// auth-service: src/main/java/com/tesis/auth_service/security/jwt/JwtTokenProvider.java
package com.tesis.auth_service.security.jwt;

import com.tesis.auth_service.model.User;
import com.tesis.auth_service.repository.UserRepository;
import com.tesis.auth_service.service.UserDetailsImpl;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.MacAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Emite/valida:
 * - JWT de usuario (HS512, secret en base64)
 * - JWT S2S (HS256, secret como string plano compartido entre servicios)
 */
@Component
public class JwtTokenProvider {
    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    // ======== JWT Usuario ========
    @Value("${jwt.secret-key}")
    private String jwtSecretB64; // Base64
    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;
    private SecretKey userKey;
    private static final MacAlgorithm USER_ALG = Jwts.SIG.HS512;

    // ======== JWT S2S ========
    @Value("${auth.s2s.secret:${s2s.jwt.secret:${S2S_JWT_SECRET:}}}")
    private String s2sSecret; // String plano (no base64)
    @Value("${auth.s2s.issuer:auth-service}")
    private String s2sIssuer;
    @Value("${auth.s2s.audience:internal}")
    private String s2sAudience;
    private SecretKey s2sKey;
    private static final MacAlgorithm S2S_ALG = Jwts.SIG.HS256;

    private final UserRepository userRepository;

    public JwtTokenProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        // Clave para JWT de usuario
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecretB64);
        this.userKey = Keys.hmacShaKeyFor(keyBytes);

        // Clave para JWT S2S (usa bytes del string tal cual)
        this.s2sKey = Keys.hmacShaKeyFor(s2sSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ===================== Usuario: emitir/validar =====================

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl principal = (UserDetailsImpl) authentication.getPrincipal();
        UUID userUuid = principal.getUuid();

        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userUuid.toString())
                .claim("userId", userUuid.toString())
                .claim("username", principal.getUsername())
                .claim("roles", getRoles(principal))
                .issuedAt(now)
                .expiration(exp)
                .signWith(userKey, USER_ALG)
                .compact();
    }

    public String generateTokenFromUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        UUID userUuid = user.getUserUuid();
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userUuid.toString())
                .claim("userId", userUuid.toString())
                .claim("username", username)
                .claim("roles", user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .issuedAt(now)
                .expiration(exp)
                .signWith(userKey, USER_ALG)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        Claims claims = Jwts.parser().verifyWith(userKey).build()
                .parseSignedClaims(token).getPayload();
        String username = claims.get("username", String.class);
        return (username != null) ? username : claims.getSubject();
    }

    public boolean validateJwtToken(String token) {
        try {
            if (token == null || token.isBlank())
                return false;
            Jwts.parser().verifyWith(userKey).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            logger.error("Invalid user JWT token: {}", e.getMessage());
            return false;
        }
    }

    private List<String> getRoles(UserDetailsImpl principal) {
        return principal.getAuthorities().stream().map(Object::toString).collect(Collectors.toList());
    }

    // ===================== S2S: validar (y opcional: construir)
    // =====================

    /** ¿Es un token S2S válido? (typ=S2S y claim 'svc' presente) */
    public boolean isS2S(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(s2sKey).build()
                    .parseSignedClaims(token).getPayload();
            if (!"S2S".equals(claims.get("typ")))
                return false;
            return claims.get("svc") != null;
        } catch (Exception e) {
            return false;
        }
    }

    /** Extrae el nombre del servicio emisor (claim 'svc') */
    public String getS2SService(String token) {
        Claims claims = Jwts.parser().verifyWith(s2sKey).build()
                .parseSignedClaims(token).getPayload();
        return String.valueOf(claims.get("svc"));
    }

    /**
     * Útil si quieres que auth-service también emita S2S (no requerido para
     * validar).
     */
    public String buildS2SToken(String serviceName, long ttlMinutes) {
        long now = System.currentTimeMillis();
        Date iat = new Date(now);
        Date exp = new Date(now + ttlMinutes * 60_000L);

        return Jwts.builder()
                .issuer(s2sIssuer)
                .audience().add(s2sAudience).and()
                .issuedAt(iat)
                .expiration(exp)
                .claim("typ", "S2S")
                .claim("svc", serviceName)
                .signWith(s2sKey, S2S_ALG)
                .compact();
    }
}
