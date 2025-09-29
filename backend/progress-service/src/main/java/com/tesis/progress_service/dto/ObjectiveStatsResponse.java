package com.tesis.progress_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Stats ligeras por objetivo para consumo interno (Advisor).
 * - solvedDistinct: ejercicios distintos correctos (histórico)
 * - attempts7d / correct7d: ventana móvil últimos 7 días
 * - winRate7d: correct7d / attempts7d (0..1)
 * - lastAttemptAt: último intento (UTC)
 * - status: NOT_STARTED | IN_PROGRESS | COMPLETED
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObjectiveStatsResponse {
  private UUID objectiveId;
  private String status;

  private Integer solvedDistinct;

  private Integer attempts7d;
  private Integer correct7d;
  private Double winRate7d;

  private Instant lastAttemptAt;
}
