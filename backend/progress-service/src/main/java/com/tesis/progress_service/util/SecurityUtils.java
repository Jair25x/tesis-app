// src/main/java/com/tesis/progress_service/util/SecurityUtils.java
package com.tesis.progress_service.util;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtils {

  private SecurityUtils() {
  }

  public static UUID getCurrentUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String name = (auth != null ? auth.getName() : null);
    if (name == null)
      return null;
    try {
      return UUID.fromString(name);
    } catch (IllegalArgumentException ignored) {
      // Si tu principal no es UUID (p.ej. "estudiante"), cámbialo cuando armes el
      // token
      return null;
    }
  }

  public static UUID getCurrentUserIdOrThrow() {
    UUID id = getCurrentUserId();
    if (id == null) {
      throw new AccessDeniedException("Usuario no autenticado o principal no es UUID");
    }
    return id;
  }
}
