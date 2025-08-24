package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.dto.common.AnswerPayload;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/** Envío de respuestas del alumno (one-shot en MVP). */
public record SubmitRequest(
    @NotEmpty @Valid List<AnswerItem> answers) {
  public record AnswerItem(
      @NotNull UUID submissionItemId,
      @NotNull UUID exerciseId,
      @Valid AnswerPayload answer,
      Integer timeSpentSec // opcional
  ) {
  }
}
