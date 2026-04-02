package backend.control;


import backend.model.DTO.UserLoginDTO;
import backend.model.DTO.UserLogoutDTO;
import backend.model.DTO.UserRegisterDTO;
import backend.model.UserAhed;
import backend.model.enums.ExpirationDates;
import backend.service.CustomUserDetailsService;
import backend.service.JWTService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthorizationController {

    private final CustomUserDetailsService userService;
    private final JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterDTO user, HttpServletRequest request, HttpServletResponse response) {

        return userService.registerUser(user, request);
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam String token, HttpServletRequest request) {
        return userService.verifyEmail(token, request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDTO user, HttpServletResponse response) {
        return userService.loginUser(user, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return userService.logoutUser(request, response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        if (request.getCookies() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Cookie refreshCookie = Arrays.stream(request.getCookies())
                .filter(c -> "refresh_token".equals(c.getName()))
                .findFirst()
                .orElse(null);

        if (refreshCookie == null || !jwtService.validateToken(refreshCookie.getValue())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return userService.refreshToken(request, response, refreshCookie);
    }

    @GetMapping("/pending")
    public ResponseEntity<?> decidePending(@RequestParam String token, @RequestParam String action) {
        return userService.decidePendingUser(token, action);
    }

}
