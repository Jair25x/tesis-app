package com.tesis.assessment_service.util;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public final class DateUtils {
  private DateUtils() {
  }

  public static OffsetDateTime nowUtc() {
    return OffsetDateTime.now(ZoneOffset.UTC);
  }

  public static boolean withinWindow(OffsetDateTime now, OffsetDateTime start, OffsetDateTime end) {
    if (start != null && now.isBefore(start))
      return false;
    if (end != null && now.isAfter(end))
      return false;
    return true;
  }

  /**
   * Duración en segundos, nunca negativa si submitted < started por algún
   * desfase.
   */
  public static int secondsBetweenNonNegative(OffsetDateTime start, OffsetDateTime end) {
    if (start == null || end == null)
      return 0;
    long s = Duration.between(start, end).getSeconds();
    return (int) Math.max(0, s);
  }
}
