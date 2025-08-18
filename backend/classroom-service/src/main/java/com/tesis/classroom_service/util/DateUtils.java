package com.tesis.classroom_service.util;

import java.time.*;

/** Utilidades de fecha/hora en UTC. */
public final class DateUtils {
  private DateUtils() {
  }

  /** Ahora en UTC (LocalDateTime). */
  public static LocalDateTime nowUtc() {
    return LocalDateTime.now(ZoneOffset.UTC);
  }

  /** True si expiresAt es anterior a ahora (UTC). */
  public static boolean isExpired(LocalDateTime expiresAt) {
    return expiresAt != null && expiresAt.isBefore(nowUtc());
  }

  /** Convierte un LocalDateTime (sistema) a UTC preservando el instante. */
  public static LocalDateTime toUtc(LocalDateTime local) {
    if (local == null)
      return null;
    return local.atZone(ZoneId.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
  }
}
