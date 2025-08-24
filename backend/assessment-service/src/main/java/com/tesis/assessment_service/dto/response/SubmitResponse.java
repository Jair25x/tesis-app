package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.dto.common.FeedbackPayload;
import com.tesis.assessment_service.model.enums.SubmissionStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Resultado tras enviar (SUBMITTED/GRADED, puntaje global y por ítem). */
public record SubmitResponse(
    SubmissionStatus status,
    BigDecimal score,
    BigDecimal maxScore,
    Boolean late, // opcional
    List<ItemResult> items) {
  public record ItemResult(
      UUID submissionItemId,
      Boolean correct,
      BigDecimal score,
      FeedbackPayload feedback) {
  }
}
