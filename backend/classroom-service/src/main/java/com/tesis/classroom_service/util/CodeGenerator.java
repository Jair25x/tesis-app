package com.tesis.classroom_service.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Generador de códigos cortos (join codes).
 * Alfabeto sin caracteres ambiguos: ABCDEFGHJKMNPQRSTUVWXYZ23456789
 */
@Component
public class CodeGenerator {

  private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  private static final SecureRandom RNG = new SecureRandom();

  /**
   * Genera un código aleatorio en MAYÚSCULAS de longitud {@code length}.
   * 
   * @param length longitud (>0)
   */
  public String generate(int length) {
    if (length <= 0)
      throw new IllegalArgumentException("length must be > 0");
    StringBuilder sb = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      int idx = RNG.nextInt(ALPHABET.length());
      sb.append(ALPHABET.charAt(idx));
    }
    return sb.toString();
  }
}
