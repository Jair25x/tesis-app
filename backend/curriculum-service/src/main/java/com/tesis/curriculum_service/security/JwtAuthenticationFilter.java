// src/main/java/com/tesis/curriculum_service/security/JwtAuthenticationFilter.java
package com.tesis.curriculum_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.security.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
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
import java.util.stream.Collectors;

/**
 * Filtro que intercepta todas las solicitudes y:
 * 1) Si viene de nuestro gateway (X-Internal-Call=gateway), confía en
 * X-Auth-Username y X-Auth-Roles para poblar el SecurityContext.
 * 2) Si no, extrae y valida el JWT de Authorization: Bearer &lt;token&gt;.
 */
/**
 * Filtro JWT adaptado a JJWT 0.12.x sin usar parserBuilder().
 */
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

    /* 1️⃣ – Confianza en llamadas internas desde el Gateway */
    if ("gateway".equals(req.getHeader("X-Internal-Call"))) {
      String user = req.getHeader("X-Auth-Username");
      String roles = req.getHeader("X-Auth-Roles"); // "ROLE_ADMIN,ROLE_STUDENT"

      if (user != null && roles != null) {
        var auth = new UsernamePasswordAuthenticationToken(
            user,
            null,
            Arrays.stream(roles.split(","))
                .map(String::trim)
                .map(SimpleGrantedAuthority::new)
                .toList());

        SecurityContextHolder.getContext().setAuthentication(auth);
        log.debug("⚡ Auth por cabeceras internas: {}", user);
      }
      chain.doFilter(req, res);
      return;
    }

    /* 2️⃣ – Fallback: validar JWT normal si llega directo */
    String bearer = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
      String token = bearer.substring(7);
      try {
        Claims claims = Jwts.parser()
            .verifyWith(Keys.hmacShaKeyFor(
                io.jsonwebtoken.io.Decoders.BASE64.decode(jwtProperties.getSecretKey())))
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
          log.debug("🔐 Auth por JWT: {}", username);
        }
      } catch (Exception ex) {
        log.warn("JWT inválido: {}", ex.getMessage());
      }
    }

    chain.doFilter(req, res);
  }
}