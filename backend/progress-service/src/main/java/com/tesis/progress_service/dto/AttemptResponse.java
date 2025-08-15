package com.tesis.progress_service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptResponse {

  private UUID attemptId;

  // Del check de curriculum
  private boolean correct;
  private BigDecimal score;
  private Map<String, Object> feedback;

  // Estado actualizado
  private SopDto sop;
  private StreakDto streak;

  // Logros desbloqueados en este intento (si los hay)
  private List<AchievementDto> unlocked;
}
