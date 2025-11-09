// backend/assessment-service/src/main/java/com/tesis/assessment_service/util/ScoreUtils.java
package com.tesis.assessment_service.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class ScoreUtils {
  private ScoreUtils() {
  }

  /**
   * Normaliza score/points a [0..1] con 3 decimales; null si datos insuficientes.
   */
  public static BigDecimal normalize(BigDecimal score, Integer points) {
    if (score == null || points == null || points <= 0)
      return null;
    return score.divide(BigDecimal.valueOf(points), 3, RoundingMode.HALF_UP);
  }
}
