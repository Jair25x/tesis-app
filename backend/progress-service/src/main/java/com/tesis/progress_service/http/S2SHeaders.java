package com.tesis.progress_service.http;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Slf4j
@Component
public class S2SHeaders {

  @Value("${s2s.jwt.secret:}")
  private String s2sSecret; // viene de config-repo -> ${S2S_JWT_SECRET}

  @Value("${s2s.jwt.issuer:progress-service}")
  private String issuer;

  @Value("${s2s.jwt.enabled:true}")
  private boolean s2sJwtEnabled; // por si quieres apagar JWT y usar solo headers internos

  private SecretKey resolveKey() {
    if (!StringUtils.hasText(s2sSecret))
      return null;

    // 1) intenta base64
    try {
      byte[] b64 = Base64.getDecoder().decode(s2sSecret);
      if (b64.length >= 32) {
        return Keys.hmacShaKeyFor(b64);
      }
    } catch (Exception ignore) {
      /* no era b64 */ }

    // 2) raw
    byte[] raw = s2sSecret.getBytes(StandardCharsets.UTF_8);
    if (raw.length < 32) {
      log.warn("S2S secret parece corto (<32 bytes). Usa >=256 bits o Base64.");
    }
    return Keys.hmacShaKeyFor(raw);
  }

  private String mintS2SToken() {
    SecretKey key = resolveKey();
    if (key == null)
      return null;

    long now = Instant.now().getEpochSecond();
    long exp = now + 120; // 2 min
    List<String> roles = List.of("INTERNAL", "ROLE_INTERNAL");

    return Jwts.builder()
        .issuer(issuer)
        .subject("progress-service")
        .claim("roles", roles)
        .claim("authorities", roles)
        .issuedAt(new Date(now * 1000))
        .expiration(new Date(exp * 1000))
        .signWith(key)
        .compact();
  }

  /** Usar así: webClient.post().headers(s2sHeaders::enrich)... */
  public void enrich(HttpHeaders headers) {
    headers.add("X-Internal-Call", "progress-service");

    // 1) Propaga el principal del contexto si existe (UUID del alumno)
    var ctx = org.springframework.security.core.context.SecurityContextHolder.getContext();
    var a = ctx != null ? ctx.getAuthentication() : null;

    String principal = (a != null && a.isAuthenticated()) ? a.getName() : null;
    if (principal != null && !principal.isBlank()) {
      headers.set("x-user-id", principal); // UUID (si viene del gateway)
      headers.set("X-Auth-Username", principal); // redundante pero útil
    } else {
      headers.set("X-Auth-Username", "progress-service");
    }

    // 2) Roles: tomamos los del contexto y añadimos INTERNAL + STUDENT siempre
    java.util.LinkedHashSet<String> roles = new java.util.LinkedHashSet<>();
    if (a != null && a.isAuthenticated() && a.getAuthorities() != null) {
      for (org.springframework.security.core.GrantedAuthority ga : a.getAuthorities()) {
        if (ga != null && ga.getAuthority() != null && !ga.getAuthority().isBlank()) {
          String r = ga.getAuthority().trim();
          roles.add(r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase(java.util.Locale.ROOT));
        }
      }
    }
    // Siempre añadimos estos para cubrir /internal/** y /api/**:
    roles.add("ROLE_INTERNAL");
    roles.add("INTERNAL"); // por si algún filtro lee sin prefijo
    roles.add("ROLE_STUDENT"); // <- importante para /api/curricula/**/check

    headers.set("X-Auth-Roles", String.join(",", roles));

    // 3) (Opcional pero recomendable) Bearer S2S firmado
    if (s2sJwtEnabled) {
      try {
        String token = mintS2SToken();
        if (org.springframework.util.StringUtils.hasText(token)) {
          headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        } else {
          log.warn("No se pudo firmar JWT S2S; se enviarán solo cabeceras internas.");
        }
      } catch (Exception e) {
        log.warn("Error generando JWT S2S; se enviarán solo cabeceras internas. {}", e.toString());
      }
    }
  }
}
