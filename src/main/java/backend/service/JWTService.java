package backend.service;


import backend.model.UserAhed;
import backend.model.enums.ExpirationDates;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service
public class JWTService {

    private final String SECRET;
    private final SecretKey key;

    public JWTService(@Value("${app.secret-key}") String secretKey) {
        this.SECRET = secretKey;
        this.key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }


    public String generateAccessToken(UserAhed userAhed) {
        return buildToken(userAhed, ExpirationDates.accessTokenExpirationDate);
    }

    public String generateRefreshToken(UserAhed userAhed) {
        return buildToken(userAhed,ExpirationDates.refreshTokenExpirationDate);
    }

    private String buildToken(UserAhed userAhed, long expiration) {
        return Jwts.builder()
                .subject(userAhed.getUsername())
                .claim("role", userAhed.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
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


    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}