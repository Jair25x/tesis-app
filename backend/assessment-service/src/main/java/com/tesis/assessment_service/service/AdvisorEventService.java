package com.tesis.assessment_service.service;

import com.tesis.assessment_service.model.AssessmentSubmission;
import java.util.UUID;

public interface AdvisorEventService {
  void enqueueGradedEvent(AssessmentSubmission submission);
}
