// src/main/java/com/tesis/progress_service/util/DateUtils.java
package com.tesis.progress_service.util;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class DateUtils {
  private DateUtils() {
  }

  public static LocalDateTime todayStart() {
    return LocalDate.now().atStartOfDay();
  }

  public static LocalDateTime tomorrowStart() {
    return LocalDate.now().plusDays(1).atStartOfDay();
  }
}
