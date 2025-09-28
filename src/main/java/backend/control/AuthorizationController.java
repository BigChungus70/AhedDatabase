package backend.control;


import backend.model.DTO.UserLoginDTO;
import backend.model.DTO.UserLogoutDTO;
import backend.model.DTO.UserRegisterDTO;
import backend.model.UserAhed;
import backend.service.CustomUserDetailsService;
import backend.service.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthorizationController {

    private final CustomUserDetailsService userService;
    private final JWTService jwtService;

    //@PostMapping("/register") //Unused for now
    public ResponseEntity<?> registerUser(@RequestBody UserRegisterDTO user) {
        if (user.username() == null || user.password() == null) {
            return ResponseEntity.badRequest().body("Username or password is empty");
        }
        if (userService.existsByUsername(user.username())) {
            return ResponseEntity.badRequest().body("Username is already in use");
        }
        userService.registerUser(user);
        UserLoginDTO loginDTO = new UserLoginDTO(user.username(), user.password());
        return ResponseEntity.ok(userService.loginUser(loginDTO));

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserLoginDTO user) {
        if (user.username() == null || user.password() == null) {
            return ResponseEntity.badRequest().body("Username or password is empty");
        }
        if (!userService.existsByUsername(user.username())) {
            return ResponseEntity.badRequest().body("User does not exist");
        }
        return ResponseEntity.ok(userService.loginUser(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody UserLogoutDTO user) {
        return ResponseEntity.ok(userService.logoutUser(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        if (!jwtService.validateToken(refreshToken)) {
            return ResponseEntity.badRequest().body("Session Expired");
        }

        String username = jwtService.extractUsername(refreshToken);
        UserAhed userAhed = userService.customLoadUserByUsername(username);

        String newAccess = jwtService.generateAccessToken(userAhed);
        return ResponseEntity.ok(Map.of("access_token", newAccess));
    }


}
