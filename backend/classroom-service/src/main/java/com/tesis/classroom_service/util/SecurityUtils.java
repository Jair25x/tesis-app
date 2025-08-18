// src/main/java/com/tesis/classroom_service/util/SecurityUtils.java
package com.tesis.classroom_service.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {
  private SecurityUtils() {
  }

  public static UUID getCurrentUserIdOrThrow() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getPrincipal() == null) {
      throw new org.springframework.security.access.AccessDeniedException("No authenticated user");
    }
    String principal = String.valueOf(auth.getPrincipal()).trim();
    try {
      return UUID.fromString(principal);
    } catch (IllegalArgumentException e) {
      throw new org.springframework.security.access.AccessDeniedException("Invalid principal (expected UUID)");
    }
  }

  public static boolean hasRole(String roleSimple) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null)
      return false;
    String expected = ("ROLE_" + roleSimple.toUpperCase());
    return auth.getAuthorities().stream().anyMatch(a -> expected.equals(a.getAuthority()));
  }

  public static boolean isAdmin() {
    return hasRole("ADMIN");
  }
}
