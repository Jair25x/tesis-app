package com.tesis.assessment_service.security;

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
      @Value("${services.s2s.issuer:assessment-service}") String issuer,
      @Value("${services.s2s.audience:*}") String audience,
      S2SJwtProperties props) {

    String secret = props.getSecret();
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

  public String buildToken() {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject("assessment-service")
        .issuer(issuer)
        .audience().add(audience).and()
        .claim("typ", "S2S")
        .claim("svc", "assessment-service")
        .claim("roles", List.of("INTERNAL")) // el receptor ya normaliza a ROLE_
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusSeconds(300)))
        .signWith(key, io.jsonwebtoken.Jwts.SIG.HS256) // explícito
        .compact();
  }
}
