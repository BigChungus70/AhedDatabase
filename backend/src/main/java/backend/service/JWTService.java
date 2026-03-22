package backend.service;

import backend.model.JWT;
import backend.model.UserAhed;
import backend.model.enums.ExpirationDates;
import backend.repository.JWTRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

@Service
public class JWTService {

    private final JWTRepository JWTRepository;

    private final String SECRET;
    private final SecretKey key;

    public JWTService(@Value("${app.secret-key}") String secretKey, JWTRepository JWTRepository) {
        this.SECRET = secretKey;
        this.key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        this.JWTRepository = JWTRepository;
    }


    public String generateAccessToken(UserAhed user) {
        return buildToken(user, ExpirationDates.accessTokenExpirationDate);
    }


    @Transactional
    public String generateAndSaveRefreshToken(UserAhed user) {
        String token = buildToken(user, ExpirationDates.refreshTokenExpirationDate);

        JWT refreshToken = JWT.builder()
                .token(token)
                .user(user)
                .expiresAt(Instant.now().plusMillis(ExpirationDates.refreshTokenExpirationDate))
                .build();

        JWTRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public Optional<UserAhed> validateRefreshToken(String token) {
        return JWTRepository.findByToken(token)
                .filter(rt -> rt.getExpiresAt().isAfter(Instant.now()))
                .map(JWT::getUser);
    }

    @Transactional
    public void deleteRefreshToken(String token) {
        JWTRepository.deleteByToken(token);
    }



    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    private String buildToken(UserAhed user, long expiration) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}