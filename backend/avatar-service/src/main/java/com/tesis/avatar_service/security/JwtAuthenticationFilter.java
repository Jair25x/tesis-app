package com.tesis.avatar_service.security;

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
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

  private final JwtProperties jwtProperties;
  private final S2SJwtProperties s2sJwtProperties;

  private volatile List<SecretKey> cachedKeys;

  private List<SecretKey> signingKeys() {
    List<SecretKey> local = cachedKeys;
    if (local != null)
      return local;
    synchronized (this) {
      if (cachedKeys == null) {
        List<SecretKey> keys = new ArrayList<>();
        addKey(keys, jwtProperties.getSecretKey(), "jwt.secret-key");
        addKey(keys, s2sJwtProperties.getSecret(), "s2s.jwt.secret");
        cachedKeys = keys;
      }
      local = cachedKeys;
    }
    return local;
  }

  private void addKey(List<SecretKey> out, String secret, String name) {
    if (!StringUtils.hasText(secret))
      return;
    try {
      byte[] b64 = Decoders.BASE64.decode(secret);
      if (b64.length >= 32)
        out.add(Keys.hmacShaKeyFor(b64));
    } catch (Exception ignore) {
    }
    byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
    if (raw.length >= 32) {
      out.add(Keys.hmacShaKeyFor(raw));
    } else {
      log.warn("La clave '{}' parece corta (<32 bytes). Usa Base64 >= 256 bits.", name);
    }
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
      chain.doFilter(req, res);
      return;
    }

    String bearer = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
      String token = bearer.substring(7);
      Claims claims = parseWithAnyKey(token);
      if (claims != null) {
        Collection<String> roles = extractRoles(claims.get("roles"));
        boolean isInternal = roles.stream().anyMatch(r -> r.equals("INTERNAL") || r.equals("ROLE_INTERNAL"));

        String principal = claims.get("userId", String.class);
        if (!StringUtils.hasText(principal))
          principal = claims.getSubject();

        if (!isInternal && !isUuid(principal)) {
          chain.doFilter(req, res);
          return;
        }

        var authorities = roles.stream()
            .map(this::normalizeRole)
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(principal, null, authorities));
        log.debug("🔐 avatar-service: principal={} roles={}", principal, roles);
      } else {
        log.warn("avatar-service: JWT inválido");
      }
    }

    chain.doFilter(req, res);
  }

  private Claims parseWithAnyKey(String token) {
    for (SecretKey k : signingKeys()) {
      try {
        return Jwts.parser().verifyWith(k).build().parseSignedClaims(token).getPayload();
      } catch (Exception ignore) {
      }
    }
    return null;
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
    return rr.startsWith("ROLE_") ? rr : "ROLE_" + rr.toUpperCase(Locale.ROOT);
  }

  @SuppressWarnings("unchecked")
  private Collection<String> extractRoles(Object raw) {
    if (raw == null)
      return List.of();
    if (raw instanceof Collection<?> col) {
      return col.stream().filter(Objects::nonNull).map(Object::toString).toList();
    }
    String s = raw.toString();
    if (!StringUtils.hasText(s))
      return List.of();
    return Arrays.stream(s.split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList();
  }
}
