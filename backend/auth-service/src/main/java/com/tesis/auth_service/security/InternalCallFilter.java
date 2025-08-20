// auth-service: src/main/java/com/tesis/auth_service/security/InternalCallFilter.java
package com.tesis.auth_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Si la petición trae X-Internal-Call, marcamos un principal
 * "internal:{service}"
 * con ROLE_INTERNAL. Útil para endpoints S2S como /profiles.
 *
 * En prod, conviene migrar a service-to-service JWT o mTLS.
 */
@Slf4j
public class InternalCallFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {

    String internal = request.getHeader("X-Internal-Call");

    if (internal != null && !internal.isBlank()
        && SecurityContextHolder.getContext().getAuthentication() == null) {

      var auth = new UsernamePasswordAuthenticationToken(
          "internal:" + internal,
          null,
          List.of(new SimpleGrantedAuthority("ROLE_INTERNAL")));
      SecurityContextHolder.getContext().setAuthentication(auth);
    }

    filterChain.doFilter(request, response);
  }
}
