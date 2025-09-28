package backend.service;

import backend.model.DTO.UserLoginDTO;
import backend.model.DTO.UserLogoutDTO;
import backend.model.DTO.UserRegisterDTO;
import backend.model.UserAhed;
import backend.model.enums.UserRole;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;


@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

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

    public UserAhed registerUser(UserRegisterDTO toRegister) {
        UserAhed userAhed = new UserAhed();
        userAhed.setUsername(toRegister.username());
        userAhed.setPassword(passwordEncoder.encode(toRegister.password()));
        userAhed.setRole(UserRole.Normal);
        userAhed.setEnabled(true);
        return userRepo.save(userAhed);
    }

    public Map<String, String> loginUser(UserLoginDTO dto) {
        UserAhed userAhed = userRepo.findByUsername(dto.username())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(dto.password(), userAhed.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!Boolean.TRUE.equals(userAhed.getEnabled())) {
            throw new DisabledException("User is disabled");
        }

        userRepo.save(userAhed);

        String accessToken = jwtService.generateAccessToken(userAhed);
        String refreshToken = jwtService.generateRefreshToken(userAhed);

        return Map.of(
                "access_token", accessToken,
                "refresh_token", refreshToken
        );
    }


    public UserAhed logoutUser(UserLogoutDTO toLogout) {
        UserAhed userAhed = userRepo.findByUsername(toLogout.username())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return userRepo.save(userAhed);
    }

    public boolean existsByUsername(String username) {
        return userRepo.findByUsername(username).isPresent();
    }
}


