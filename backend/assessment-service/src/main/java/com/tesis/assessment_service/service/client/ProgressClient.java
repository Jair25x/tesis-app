package com.tesis.assessment_service.service.client;

import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.util.UUID;

/** Contrato hacia progress-service para registrar intentos (S2S). */
public interface ProgressClient {

  void postAttempt(AttemptRequest req);

  /** Payload que coincide con AttemptEventRequest del progress-service. */
  record AttemptRequest(
      UUID studentId,
      String source, // "ASSESSMENT"
      UUID curriculumId,
      UUID exerciseId,
      Boolean correct,
      BigDecimal score, // puntos logrados
      Integer points, // puntos máximos
      UUID objectiveId,
      ObjectNode metadata) {
  }
}
