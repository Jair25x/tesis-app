package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.SubmitRequest;
import com.tesis.assessment_service.dto.response.StartResponse;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.dto.response.SubmitResponse;

import java.util.UUID;

public interface SubmissionService {

  StartResponse start(UUID assignmentId, UUID studentId);

  SubmitResponse submit(UUID submissionId, UUID studentId, SubmitRequest request);

  SubmissionDetailResponse getDetail(UUID submissionId, UUID requesterId, boolean asTeacher);
}
