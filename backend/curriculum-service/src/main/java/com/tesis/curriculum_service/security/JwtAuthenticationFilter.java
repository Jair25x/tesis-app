// src/main/java/com/tesis/curriculum_service/security/JwtAuthenticationFilter.java
package com.tesis.curriculum_service.security;

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

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
  private final JwtProperties jwtProperties;

  @Override
  protected void doFilterInternal(HttpServletRequest req,
      HttpServletResponse res,
      FilterChain chain) throws ServletException, IOException {

    // 1) Confiar en llamadas internas (desde gateway u otros servicios) si envían
    // cabeceras S2S
    String internal = req.getHeader("X-Internal-Call");
    if (internal != null && !internal.isBlank()) {
      String idHeader = req.getHeader("x-user-id");
      String userHeader = req.getHeader("X-Auth-Username");
      String roles = req.getHeader("X-Auth-Roles");

      String principal = (idHeader != null && !idHeader.isBlank()) ? idHeader : userHeader;

      if (principal != null && roles != null) {
        var auth = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            Arrays.stream(roles.split(","))
                .map(String::trim)
                .map(SimpleGrantedAuthority::new)
                .toList());
        SecurityContextHolder.getContext().setAuthentication(auth);
        log.debug("⚡ curriculum-service: auth interna principal={} roles={}", principal, roles);
      }
      chain.doFilter(req, res);
      return;
    }

    // 2) Fallback: validar JWT normal si llega directo (útil en tests o sin
    // gateway)
    String bearer = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
      String token = bearer.substring(7);
      try {
        Claims claims = Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.getSecretKey())))
            .build()
            .parseSignedClaims(token)
            .getPayload();

        String username = claims.getSubject();
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        if (username != null && roles != null) {
          var auth = new UsernamePasswordAuthenticationToken(
              username,
              null,
              roles.stream()
                  .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                  .toList());
          SecurityContextHolder.getContext().setAuthentication(auth);
          log.debug("🔐 curriculum-service: auth por JWT {}", username);
        }
      } catch (Exception ex) {
        log.warn("curriculum-service: JWT inválido: {}", ex.getMessage());
      }
    }

    chain.doFilter(req, res);
  }
}
