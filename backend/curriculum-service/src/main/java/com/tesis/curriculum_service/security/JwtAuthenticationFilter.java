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

  private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
  private final JwtProperties jwtProperties;

  @Override
  protected void doFilterInternal(HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    // -- manejo de llamadas internas vía gateway (X-Internal-Call) omitido aquí --

    // manejo JWT estándar
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      try {
        // En tu versión, Jwts.parser() existe; encadenamos verifyWith(...) y build()
        JwtParser parser = Jwts
            .parser()
            .verifyWith(Keys.hmacShaKeyFor(
                io.jsonwebtoken.io.Decoders.BASE64.decode(jwtProperties.getSecretKey())))
            .build();

        // parseSignedClaims() es la nueva forma de obtener el payload
        Claims claims = parser
            .parseSignedClaims(token)
            .getPayload();

        String username = claims.getSubject();
        @SuppressWarnings("unchecked")
        List<String> roles = claims.get("roles", List.class);

        if (username != null && roles != null) {
          var authorities = roles.stream()
              .map(r -> new SimpleGrantedAuthority("ROLE_" + r.trim().toUpperCase()))
              .collect(Collectors.toList());
          var auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
          SecurityContextHolder.getContext().setAuthentication(auth);
          logger.debug("Authenticated JWT user {}", username);
        }

      } catch (ExpiredJwtException ex) {
        logger.warn("JWT expired: {}", ex.getMessage());
      } catch (SignatureException ex) {
        logger.warn("Invalid JWT signature: {}", ex.getMessage());
      } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
        logger.warn("Invalid JWT token: {}", ex.getMessage());
      }
    }

    filterChain.doFilter(request, response);
  }
}