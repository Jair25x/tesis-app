package com.tesis.curriculum_service.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

/**
 * Utilidad para acceder al usuario autenticado actual.
 */
public class SecurityUtils {

  /**
   * Devuelve el username del usuario autenticado actual, si lo hay.
   */
  public static Optional<String> getCurrentUsername() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return Optional.empty();
    }

    Object principal = authentication.getPrincipal();

    if (principal instanceof UserDetails userDetails) {
      return Optional.of(userDetails.getUsername());
    }

    if (principal instanceof String username) {
      return Optional.of(username);
    }

    return Optional.empty();
  }
}
