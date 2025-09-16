package com.tesis.assessment_service.service.client;

import java.time.OffsetDateTime;
import java.util.UUID;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface AdvisorClient {
  void postAssessmentGraded(ObjectNode event);

  void commitDiagnostic(UUID studentId, String phase, OffsetDateTime windowStart, OffsetDateTime windowEnd,
      boolean force);

}
