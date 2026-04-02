package backend.service;

import backend.model.DTO.IpLocationDTO;
import backend.model.DTO.UserLoginDTO;
import backend.model.DTO.UserRegisterDTO;
import backend.model.PendingUser;
import backend.model.UnverifiedUser;
import backend.model.UserAhed;
import backend.model.enums.ExpirationDates;
import backend.model.enums.UserRole;
import backend.repository.PendingUserRepository;
import backend.repository.UnverifiedUserRepository;
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
    private final UnverifiedUserRepository unverifiedRepo;
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
        if (existsByUsername(toRegister.username()))
            throw new IllegalArgumentException("اسم المستخدم غير متاح");
        if (pendingExistsByUsername(toRegister.username()))
            throw new IllegalArgumentException("اسم المستخدم غير متاح");
        if (unverifiedExistsByUsername(toRegister.username()))
            throw new IllegalArgumentException("اسم المستخدم غير متاح");
        if (existsByEmail(toRegister.email()))
            throw new IllegalArgumentException("البريد الإلكتروني مرتبط بحساب آخر");
        if (pendingExistsByEmail(toRegister.email()))
            throw new IllegalArgumentException("البريد الإلكتروني مرتبط بحساب آخر");
        if (unverifiedExistsByEmail(toRegister.email()))
            throw new IllegalArgumentException("البريد الإلكتروني مرتبط بحساب آخر");

        UnverifiedUser unverified = new UnverifiedUser();
        unverified.setUsername(toRegister.username());
        unverified.setPassword(passwordEncoder.encode(toRegister.password()));
        unverified.setEmail(toRegister.email());
        unverified.setToken(UUID.randomUUID().toString());
        unverified.setCreatedAt(LocalDateTime.now());

        IpLocationDTO registrationLocation = getClientIpLocation(request);
        unverified.setRegistrationIp(registrationLocation.query());
        unverified.setRegistrationCountry(registrationLocation.country());
        unverified.setRegistrationRegion(registrationLocation.regionName());
        unverified.setRegistrationCity(registrationLocation.city());

        unverifiedRepo.save(unverified);
        mailService.sendVerificationEmail(unverified.getEmail(), unverified.getUsername(), unverified.getToken());

        return ResponseEntity.ok(Map.of("Message", "تم إرسال رابط التحقق إلى بريدك الإلكتروني"));
    }

    @Transactional
    public ResponseEntity<?> verifyEmail(String token, HttpServletRequest request) {
        UnverifiedUser unverified = unverifiedRepo.findByToken(token);

        if (unverified == null)
            throw new IllegalArgumentException("الرابط غير صالح");
        if (unverified.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(15))) {
            unverifiedRepo.delete(unverified);
            throw new IllegalArgumentException("انتهت صلاحية الرابط");
        }

        PendingUser pending = new PendingUser();
        pending.setUsername(unverified.getUsername());
        pending.setPassword(unverified.getPassword());
        pending.setEmail(unverified.getEmail());
        pending.setToken(UUID.randomUUID().toString());
        pending.setCreatedAt(LocalDateTime.now());

        IpLocationDTO verificationLocation = getClientIpLocation(request);
        unverifiedRepo.delete(unverified);
        pendingRepo.save(pending);
        mailService.sendApprovalRequestEmail(pending, unverified, verificationLocation);

        return ResponseEntity.ok(Map.of("Message", "تم تأكيد بريدك الإلكتروني، سيتم مراجعة طلبك قريباً"));
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

        return ResponseEntity.ok(Map.of(
                "Message", "تم تسجيل الدخول بنجاح",
                "username", userAhed.getUsername(),
                "role", userAhed.getRole().name()));
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
            user.setRole(UserRole.Low);
            user.setSlot(false);
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

    public boolean unverifiedExistsByUsername(String username) {
        return unverifiedRepo.findByUsername(username).isPresent();
    }

    public boolean existsByEmail(String email) {
        return userRepo.findByEmail(email).isPresent();
    }

    public boolean pendingExistsByEmail(String email) {
        return pendingRepo.findByEmail(email).isPresent();
    }

    public boolean unverifiedExistsByEmail(String email) {
        return unverifiedRepo.findByEmail(email).isPresent();
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


