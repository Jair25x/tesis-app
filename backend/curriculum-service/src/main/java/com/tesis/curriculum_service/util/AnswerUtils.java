// src/main/java/com/tesis/curriculum_service/util/AnswerUtils.java
package com.tesis.curriculum_service.util;

import java.math.BigDecimal;
import java.text.Normalizer;

public final class AnswerUtils {

  private AnswerUtils() {
  }

  /**
   * Compara dos valores como numéricos (ignora espacios y comas de miles).
   */
  public static boolean eqNumeric(Object student, Object expected) {
    BigDecimal s = toNum(student);
    BigDecimal e = toNum(expected);
    if (s == null || e == null) {
      return false;
    }
    return s.compareTo(e) == 0;
  }

  /**
   * Compara dos textos normalizando espacios, minúsculas y forma Unicode.
   */
  public static boolean eqText(Object student, Object expected) {
    String s = normalize(student);
    String e = normalize(expected);
    return !s.isEmpty() && s.equals(e);
  }

  public static BigDecimal toNum(Object o) {
    if (o == null) {
      return null;
    }
    if (o instanceof Number n) {
      return new BigDecimal(n.toString());
    }
    if (o instanceof String s) {
      String t = s
          .replaceAll("\\s+", "") // quita espacios
          .replace(",", ""); // quita coma como separador de miles
      if (t.isEmpty()) {
        return null;
      }
      try {
        return new BigDecimal(t);
      } catch (Exception ignore) {
      }
    }
    return null;
  }

  public static String normalize(Object o) {
    if (o == null) {
      return "";
    }
    String s = o.toString();
    s = Normalizer.normalize(s, Normalizer.Form.NFKC)
        .trim()
        .replaceAll("\\s+", " ")
        .toLowerCase();
    return s;
  }
}
