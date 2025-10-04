// progress-service: src/main/java/com/tesis/progress_service/security/S2SJwtSigner.java
package com.tesis.progress_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
public class S2SJwtSigner {

  private final SecretKey key;
  private final String issuer;
  private final String audience;

  public S2SJwtSigner(
      @Value("${services.classroom.s2s-secret:${s2s.jwt.secret}}") String secret,
      @Value("${services.classroom.s2s-issuer:progress-service}") String issuer,
      @Value("${services.classroom.s2s-audience:classroom-service}") String audience) {

    SecretKey k;
    try {
      k = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    } catch (Exception ignore) {
      k = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    this.key = k;
    this.issuer = issuer;
    this.audience = audience;
  }

  public String buildInternalToken() {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject("progress-service")
        .issuer(issuer)
        .audience().add(audience).and()
        .claim("roles", List.of("INTERNAL"))
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(300))) // 5 min
        .signWith(key)
        .compact();
  }
}
