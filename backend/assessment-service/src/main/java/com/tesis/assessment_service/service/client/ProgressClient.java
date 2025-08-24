package com.tesis.assessment_service.service.client;

import com.fasterxml.jackson.databind.node.ObjectNode;

import java.math.BigDecimal;
import java.util.UUID;

/** Contrato hacia progress-service para registrar intentos. */
public interface ProgressClient {

  void postAttempt(AttemptRequest req);

  record AttemptRequest(
      UUID studentId,
      String source, // "ASSESSMENT"
      UUID curriculumId,
      UUID exerciseId,
      Boolean correct,
      BigDecimal score, // puntos logrados en el ítem
      Integer points, // puntos máximos del ítem
      UUID objectiveId,
      ObjectNode metadata // assignmentId, submissionId, submissionItemId, etc.
  ) {
  }
}
