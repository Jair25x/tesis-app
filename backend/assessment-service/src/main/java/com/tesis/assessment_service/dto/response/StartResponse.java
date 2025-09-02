// src/main/java/com/tesis/assessment_service/dto/response/StartResponse.java
package com.tesis.assessment_service.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.model.enums.GradingMode;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Respuesta al iniciar una evaluación. Incluye config de la plantilla. */
public record StartResponse(
    UUID submissionId,
    UUID assignmentId,
    UUID studentId,
    int attemptNo,
    OffsetDateTime startedAt,
    Integer durationSec,
    JsonNode config,
    List<Item> items) {
  public record Item(
      UUID submissionItemId,
      UUID exerciseId,
      UUID objectiveId,
      Integer position,
      Integer points,
      GradingMode gradingMode) {
  }
}
