package com.tesis.assessment_service.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.model.enums.SubmissionStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Detalle completo de un submission (para revisión docente). */
public record SubmissionDetailResponse(
    UUID submissionId,
    UUID assignmentId,
    UUID studentId,
    SubmissionStatus status,
    BigDecimal score,
    BigDecimal maxScore,
    OffsetDateTime startedAt,
    OffsetDateTime submittedAt,
    OffsetDateTime gradedAt,
    Integer durationSec,
    Integer elapsedSec,
    Integer attemptNo,
    List<Item> items) {
  public record Item(
      UUID submissionItemId,
      UUID exerciseId,
      UUID objectiveId,
      int position,
      int points,
      GradingMode gradingMode,
      JsonNode answer, // lo persistimos como JSONB String; aquí lo exponemos como JSON
      Boolean correct,
      BigDecimal score,
      JsonNode feedback,
      OffsetDateTime checkedAt,
      // snapshot opcional
      String exerciseTitle,
      String exerciseType,
      String statementRendered) {
  }
}
