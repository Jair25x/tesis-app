package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.AssignmentRequest;
import com.tesis.assessment_service.dto.response.*;

import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface AssignmentService {

  AssignmentResponse createAssignment(UUID requesterId, AssignmentRequest request);

  AssignmentResponse publish(UUID assignmentId, UUID requesterId);

  AssignmentResponse close(UUID assignmentId, UUID requesterId);

  OverviewResponse getOverview(UUID assignmentId, UUID requesterId);

  PageResponse<SubmissionSummaryDto> listSubmissions(UUID assignmentId,
      Optional<String> status,
      Pageable pageable);

  /** Asignaciones para el alumno (ventana vigente / state=PUBLISHED). */
  PageResponse<AssignmentResponse> listMyAssignments(UUID studentId, Pageable pageable);
}
