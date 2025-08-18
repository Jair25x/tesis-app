package com.tesis.auth_service.security.jwt;

import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.UserRepository;
import com.tesis.auth_service.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret-key}")
    private String jwtSecretB64; // codificada en Base64

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    private static final MacAlgorithm SIGNATURE_ALGORITHM = Jwts.SIG.HS512;

    private final UserRepository userRepository;

    public JwtTokenProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecretB64);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        UUID userUuid = principal.getUuid(); // ⬅️ el canónico

        return Jwts.builder()
                .subject(userUuid.toString()) // sub = UUID
                .claim("userId", userUuid.toString()) // UUID (string)
                .claim("username", principal.getUsername()) // para filtros que aún leen username
                .claim("roles", getRoles(principal))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SIGNATURE_ALGORITHM)
                .compact();
    }

    // Para refresh: resolvemos username -> User -> UUID y re-firmamos
    public String generateTokenFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        UUID userUuid = user.getUserUuid();

        return Jwts.builder()
                .subject(userUuid.toString())
                .claim("userId", userUuid.toString())
                .claim("username", username)
                .claim("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey(), SIGNATURE_ALGORITHM)
                .compact();
    }

    // ⬇️ IMPORTANTE: ahora devolvemos preferentemente el claim 'username'
    public String getUserNameFromJwtToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        String username = claims.get("username", String.class);
        return (username != null) ? username : claims.getSubject(); // fallback a sub
    }

    public boolean validateJwtToken(String token) {
        try {
            if (token == null || token.isBlank())
                return false; // ⬅️ agregado

            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private List<String> getRoles(UserDetailsImpl principal) {
        return principal.getAuthorities().stream().map(Object::toString).collect(Collectors.toList());
    }
}
