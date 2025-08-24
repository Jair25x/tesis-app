package com.tesis.assessment_service.service.client;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

/** Contrato hacia curriculum-service para autocorrección. */
public interface CurriculumClient {

  /** POST /api/curriculum/check (o el shortcut por ejercicioId) */
  CheckResult checkExercise(UUID exerciseId, JsonNode answerPayload);

  /** Resultado de autocorrección. */
  record CheckResult(boolean correct, JsonNode feedback, UUID objectiveId, Integer points) {
  }
}
