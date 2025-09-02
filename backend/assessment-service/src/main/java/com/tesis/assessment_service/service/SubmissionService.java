package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.SubmitRequest;
import com.tesis.assessment_service.dto.response.PageResponse;
import com.tesis.assessment_service.dto.response.StartResponse;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.dto.response.SubmitResponse;
import com.tesis.assessment_service.dto.response.MySubmissionSummaryDto;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SubmissionService {

  StartResponse start(UUID assignmentId, UUID studentId);

  SubmitResponse submit(UUID submissionId, UUID studentId, SubmitRequest request);

  SubmissionDetailResponse getDetail(UUID submissionId, UUID requesterId, boolean asTeacher);

  // ✅ Historial del alumno
  PageResponse<MySubmissionSummaryDto> listMySubmissions(UUID studentId,
                                                         Optional<SubmissionStatus> status,
                                                         Pageable pageable);
}
