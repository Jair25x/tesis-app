// src/main/java/com/tesis/progress_service/http/S2SHeaders.java
package com.tesis.progress_service.http;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.stream.Collectors;

public final class S2SHeaders {
  private S2SHeaders() {
  }

  public static void enrich(HttpHeaders headers) {
    headers.add("X-Internal-Call", "progress-service");
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    if (a != null && a.isAuthenticated()) {
      String principal = a.getName(); // en tus filtros es UUID/username
      String roles = a.getAuthorities().stream()
          .map(GrantedAuthority::getAuthority)
          .collect(Collectors.joining(","));
      headers.add("x-user-id", principal);
      headers.add("X-Auth-Username", principal);
      headers.add("X-Auth-Roles", roles);
    }
  }
}
