package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.AssignmentRequest;
import com.tesis.assessment_service.dto.request.CloneAssignmentRequest;
import com.tesis.assessment_service.dto.request.AssignmentSearchCriteria;
import com.tesis.assessment_service.dto.response.*;
import org.springframework.data.domain.Page;
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

  /** Estudiante: asignaciones vigentes + flags. */
  PageResponse<StudentAssignmentSummaryResponse> listMyAssignments(UUID studentId, Pageable pageable);

  /** Clonar una asignación existente con overrides opcionales. */
  AssignmentResponse cloneAssignment(UUID sourceAssignmentId, UUID requesterId, CloneAssignmentRequest req);

  /** NUEVO: búsqueda paginada/filtrada para docente/admin. */
  Page<AssignmentSummaryResponse> search(AssignmentSearchCriteria criteria, Pageable pageable);
}
