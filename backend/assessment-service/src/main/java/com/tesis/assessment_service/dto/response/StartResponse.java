package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.GradingMode;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Respuesta al iniciar una evaluación. */
public record StartResponse(
    UUID submissionId,
    List<Item> items,
    Integer timeLimitSec,
    OffsetDateTime startedAt) {
  public record Item(
      UUID submissionItemId,
      UUID exerciseId,
      UUID objectiveId,
      int position,
      int points,
      GradingMode gradingMode) {
  }
}
