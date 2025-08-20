// classroom-service: src/main/java/com/tesis/classroom_service/security/S2STokenProvider.java
package com.tesis.classroom_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.MacAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class S2STokenProvider {

  @Value("${s2s.secret}")
  private String secret;
  @Value("${s2s.issuer:classroom-service}")
  private String issuer;
  @Value("${s2s.audience:internal}")
  private String audience;
  @Value("${s2s.ttl-minutes:5}")
  private long ttlMinutes;
  @Value("${spring.application.name:classroom-service}")
  private String serviceName;

  private static final MacAlgorithm ALG = Jwts.SIG.HS256;

  private SecretKey key() {
    return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }

  public String buildToken() {
    long now = System.currentTimeMillis();
    Date iat = new Date(now);
    Date exp = new Date(now + ttlMinutes * 60_000L);

    return Jwts.builder()
        .issuer(issuer)
        .audience().add(audience).and()
        .issuedAt(iat)
        .expiration(exp)
        .claim("typ", "S2S")
        .claim("svc", serviceName)
        .signWith(key(), ALG)
        .compact();
  }
}
