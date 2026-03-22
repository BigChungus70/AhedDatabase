package backend.service;

import backend.model.DTO.IpLocationDTO;
import backend.model.DTO.UserLoginDTO;
import backend.model.DTO.UserRegisterDTO;
import backend.model.PendingUser;
import backend.model.UserAhed;
import backend.model.enums.ExpirationDates;
import backend.model.enums.UserRole;
import backend.repository.PendingUserRepository;
import backend.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PendingUserRepository pendingRepo;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;
    private final MailService mailService;
    private final RestClient restClient = RestClient.create();
    private final String accessCookiePath = "/api";
    private final String refreshTokenCookiePath = "/api/auth/";

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAhed temp = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new org.springframework.security.core.userdetails.User(
                temp.getUsername(),
                temp.getPassword(),
                java.util.List.of(new SimpleGrantedAuthority(temp.getRole().asAuthority()))
        );
    }

    public UserAhed customLoadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public boolean isEnabled(String username) {
        return userRepo.isEnabled(username);
    }

    @Transactional
    public ResponseEntity<?> registerUser(UserRegisterDTO toRegister, HttpServletRequest request) {
        if (existsByUsername(toRegister.username())) {
            throw new IllegalArgumentException("يوجد حساب آخر بهذا الاسم");
        }
        if (pendingExistsByUsername(toRegister.username())) {
            throw new IllegalArgumentException("يوجد طلب حساب بهذا الاسم قيد الانتظار");
        }
        if (existsByEmail(toRegister.email())) {
            throw new IllegalArgumentException("يوجد حساب آخر بهذا البريد الإلكتروني");
        }
        if (pendingExistsByEmail(toRegister.email())) {
            throw new IllegalArgumentException("يوجد طلب حساب بهذا البريد الإلكتروني قيد الانتظار");
        }


        PendingUser pending = new PendingUser();
        pending.setUsername(toRegister.username());
        pending.setPassword(passwordEncoder.encode(toRegister.password()));
        pending.setEmail(toRegister.email());
        pending.setToken(UUID.randomUUID().toString());
        pending.setCreatedAt(LocalDateTime.now());
        IpLocationDTO location = getClientIpLocation(request);
        pendingRepo.save(pending);
        mailService.sendApprovalRequestEmail(pending, location);
        return ResponseEntity.ok(Map.of("Message", "تم إرسال طلب إنشاء الحساب، يرجى الانتظار حتى تتم الموافقة"));
    }

    public ResponseEntity<?> loginUser(UserLoginDTO dto, HttpServletResponse response) {
        UserAhed userAhed = userRepo.findByUsername(dto.username())
                .orElseThrow(() -> new IllegalArgumentException("اسم المستخدم غير موجود"));

        if (!passwordEncoder.matches(dto.password(), userAhed.getPassword())) {
            throw new IllegalArgumentException("كلمة المرور غير صحيحة");
        }
        if (!isEnabled(userAhed.getUsername())) {
            throw new IllegalArgumentException("تم حظرك");
        }

        String accessToken = jwtService.generateAccessToken(userAhed);
        String refreshToken = jwtService.generateAndSaveRefreshToken(userAhed);

        setCookie(response, "access_token", accessToken, ExpirationDates.accessTokenExpirationDate, accessCookiePath);
        setCookie(response, "refresh_token", refreshToken, ExpirationDates.refreshTokenExpirationDate, refreshTokenCookiePath);

        return ResponseEntity.ok(Map.of("Message", "تم تسجيل الدخول بنجاح", "username", userAhed.getUsername()));
    }

    public ResponseEntity<?> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        Arrays.stream(request.getCookies())
                .filter(c -> "refresh_token".equals(c.getName()))
                .findFirst().ifPresent(refreshCookie -> jwtService.deleteRefreshToken(refreshCookie.getValue()));

        clearCookie(response, "access_token", accessCookiePath);
        clearCookie(response, "refresh_token", refreshTokenCookiePath);

        return ResponseEntity.ok(Map.of("Message", "تم تسجيل الخروج بنجاح"));
    }

    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response, Cookie refreshCookie) {
        return jwtService.validateRefreshToken(refreshCookie.getValue())
                .filter(user -> Boolean.TRUE.equals(user.getEnabled()))
                .map(user -> {
                    String newAccessToken = jwtService.generateAccessToken(user);
                    setCookie(response, "access_token", newAccessToken, ExpirationDates.accessTokenExpirationDate, accessCookiePath);
                    return ResponseEntity.ok(Map.of("Message", "تم تجديد الجلسة"));
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }


    public ResponseEntity<?> decidePendingUser(String token, String action) {
        PendingUser pending = pendingRepo.findByToken(token);

        if (pending == null) {
            throw new IllegalArgumentException("الطلب غير موجود أو انتهت صلاحيته");
        }

        if (action.equalsIgnoreCase("approve")) {
            UserAhed user = new UserAhed();
            user.setUsername(pending.getUsername());
            user.setPassword(pending.getPassword());
            user.setEmail(pending.getEmail());
            user.setRole(UserRole.Normal);
            user.setEnabled(true);
            userRepo.save(user);
            pendingRepo.delete(pending);
            return ResponseEntity.ok(Map.of("Message", "تمت الموافقة على الحساب"));

        } else if (action.equalsIgnoreCase("reject")) {
            pendingRepo.delete(pending);
            return ResponseEntity.ok(Map.of("Message", "تم رفض الحساب"));
        } else {
            throw new IllegalArgumentException("قرار غير صالح");
        }
    }





    private void setCookie(HttpServletResponse response, String name, String value, long expirationMs, String path) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(true)
                .path(path)
                .maxAge(expirationMs / 1000)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name, String path) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(true)
                .path(path)
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public boolean existsByUsername(String username) {
        return userRepo.findByUsername(username).isPresent();
    }

    public boolean pendingExistsByUsername(String username) {
        return pendingRepo.findByUsername(username).isPresent();
    }

    public boolean existsByEmail(String email){
        return userRepo.findByEmail(email).isPresent();
    }
    public boolean pendingExistsByEmail(String email){
        return pendingRepo.findByEmail(email).isPresent();
    }

    private IpLocationDTO getClientIpLocation(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        String xRealIp = request.getHeader("X-Real-IP");
        String ip;

        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            ip = xForwardedFor.split(",")[0].trim();
        } else if (xRealIp != null && !xRealIp.isBlank()) {
            ip = xRealIp.trim();
        } else {
            ip = request.getRemoteAddr();
        }


        try {
            return restClient.get()
                    .uri("http://ip-api.com/json/" + ip)
                    .retrieve()
                    .body(IpLocationDTO.class);
        } catch (Exception e) {
            return new IpLocationDTO("غير معروف", "غير معروف", "غير معروف", ip, "fail");
        }
    }
}


