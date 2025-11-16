package com.tesis.progress_service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckResultDto {

  private boolean correct;
  private BigDecimal score; // 0..1

  // feedback genérico (texto, estructuras, etc.)
  private Map<String, Object> feedback;

  // ───────── META OPCIONAL DESDE curriculum-service ─────────

  private UUID curriculumId;
  private UUID learningObjectiveId;
  private String difficulty;
  private BigDecimal maxScore;

  // Para plantillas con sub-preguntas
  private Map<String, Boolean> questionResults;
}
