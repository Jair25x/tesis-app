package com.tesis.classroom_service.http;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.stream.Collectors;

/**
 * Enriquecimiento de cabeceras para llamadas S2S (intra-cluster).
 * El gateway confía/inyecta estas cabeceras; los servicios internos pueden
 * usarlas.
 */
public final class S2SHeaders {
  private S2SHeaders() {
  }

  public static void enrich(HttpHeaders headers) {
    headers.add("X-Internal-Call", "classroom-service");
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    if (a != null && a.isAuthenticated()) {
      String principal = a.getName(); // generalmente UUID por nuestro filtro
      String roles = a.getAuthorities().stream()
          .map(GrantedAuthority::getAuthority)
          .collect(Collectors.joining(","));
      headers.add("x-user-id", principal);
      headers.add("X-Auth-Username", principal);
      headers.add("X-Auth-Roles", roles);
    }
  }
}
