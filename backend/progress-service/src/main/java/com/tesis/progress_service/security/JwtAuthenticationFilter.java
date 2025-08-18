package com.tesis.progress_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  private final JwtProperties jwtProperties;

  /** Cacheamos la clave para no decodificar en cada request */
  private volatile SecretKey cachedKey;

  private SecretKey signingKey() {
    SecretKey local = cachedKey;
    if (local == null) {
      synchronized (this) {
        if (cachedKey == null) {
          cachedKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.getSecretKey()));
        }
        local = cachedKey;
      }
    }
    return local;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req,
      HttpServletResponse res,
      FilterChain chain) throws ServletException, IOException {

    // Preflight CORS → dejar pasar
    if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
      chain.doFilter(req, res);
      return;
    }

    // 1) Confía en llamadas internas desde el Gateway
    String internal = req.getHeader("X-Internal-Call");
    if (StringUtils.hasText(internal)) {
      String idHeader = headerOrNull(req, "x-user-id"); // UUID
      String userHeader = headerOrNull(req, "X-Auth-Username"); // también UUID en nuestro gateway
      String rolesHdr = headerOrNull(req, "X-Auth-Roles"); // CSV (ROLE_...)

      String principal = StringUtils.hasText(idHeader) ? idHeader : userHeader;

      if (StringUtils.hasText(principal) && StringUtils.hasText(rolesHdr)) {
        if (isUuid(principal)) {
          var authorities = Arrays.stream(rolesHdr.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .map(this::normalizeRole) // NO duplicar ROLE_
              .map(SimpleGrantedAuthority::new)
              .collect(Collectors.toList());

          var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
          SecurityContextHolder.getContext().setAuthentication(auth);
          log.debug("⚡ progress-service: auth interna principal={} roles={}", principal, rolesHdr);
        } else {
          log.warn("Llamada interna con principal NO-UUID: {}", principal);
        }
      }
      chain.doFilter(req, res);
      return;
    }

    // 2) Fallback: validar JWT si llega directo (tests / llamadas sin gateway)
    String bearer = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
      String token = bearer.substring(7);
      try {
        Claims claims = Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();

        // Principal = userId (UUID) o sub (UUID)
        String principal = claims.get("userId", String.class);
        if (!StringUtils.hasText(principal)) {
          principal = claims.getSubject(); // sub
        }

        if (!isUuid(principal)) {
          log.warn("JWT sin principal UUID (userId/sub): {}", principal);
          chain.doFilter(req, res);
          return;
        }

        // Roles: pueden venir como List<?> o CSV
        Collection<String> rawRoles = extractRoles(claims.get("roles"));
        var authorities = rawRoles.stream()
            .map(this::normalizeRole) // NO duplicar ROLE_
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);
        log.debug("🔐 progress-service: auth por JWT principal={} roles={}", principal, rawRoles);

      } catch (Exception ex) {
        log.warn("progress-service: JWT inválido: {}", ex.getMessage());
      }
    }

    chain.doFilter(req, res);
  }

  private String headerOrNull(HttpServletRequest req, String name) {
    String v = req.getHeader(name);
    return (v != null && !v.isBlank()) ? v : null;
  }

  private boolean isUuid(String s) {
    try {
      UUID.fromString(s);
      return true;
    } catch (Exception e) {
      return false;
    }
  }

  private String normalizeRole(String r) {
    if (r == null)
      return "";
    String rr = r.trim();
    return rr.startsWith("ROLE_") ? rr : "ROLE_" + rr.toUpperCase();
  }

  @SuppressWarnings("unchecked")
  private Collection<String> extractRoles(Object raw) {
    if (raw == null)
      return List.of();
    if (raw instanceof Collection<?> col) {
      return col.stream().filter(Objects::nonNull).map(Object::toString).toList();
    }
    // CSV fallback
    String s = raw.toString();
    if (!StringUtils.hasText(s))
      return List.of();
    return Arrays.stream(s.split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList();
  }
}
