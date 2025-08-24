package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.GradeItemRequest;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;

import java.util.UUID;

public interface GradingService {

  SubmissionDetailResponse gradeItem(UUID submissionId, UUID itemId, UUID teacherId, GradeItemRequest request);
}
