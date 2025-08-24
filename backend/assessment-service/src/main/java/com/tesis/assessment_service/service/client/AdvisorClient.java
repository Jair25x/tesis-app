package com.tesis.assessment_service.service.client;

import com.fasterxml.jackson.databind.node.ObjectNode;

public interface AdvisorClient {
  void postAssessmentGraded(ObjectNode event);
}
