package com.tesis.assessment_service.service.impl;

import com.tesis.assessment_service.dto.request.AssignmentRequest;
import com.tesis.assessment_service.dto.response.*;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.exception.NotFoundException;
import com.tesis.assessment_service.model.*;
import com.tesis.assessment_service.model.enums.*;
import com.tesis.assessment_service.repository.*;
import com.tesis.assessment_service.service.AssignmentService;
import com.tesis.assessment_service.service.OverviewService;
import com.tesis.assessment_service.service.client.ClassroomClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

  private final AssessmentAssignmentRepository assignmentRepo;
  private final AssessmentTemplateRepository templateRepo;
  private final AssessmentSubmissionRepository submissionRepo;
  private final ClassroomClient classroomClient;
  private final OverviewService overviewService;

  @Override
  public AssignmentResponse createAssignment(UUID requesterId, AssignmentRequest request) {
    AssessmentTemplate tpl = templateRepo.findById(request.templateId())
        .orElseThrow(() -> new NotFoundException("Plantilla no encontrada"));

    if (request.scope() == AssignmentScope.CLASSROOM && request.classroomId() == null) {
      throw new BadRequestException("classroomId es requerido para scope=CLASSROOM");
    }

    // Si es classroom, debe ser staff (validación externa)
    if (request.scope() == AssignmentScope.CLASSROOM) {
      boolean staff = classroomClient.isMember(request.classroomId(), requesterId);
      if (!staff)
        throw new ForbiddenException("No eres staff del aula");
    }

    AssessmentAssignment a = AssessmentAssignment.builder()
        .template(tpl)
        .scope(request.scope())
        .type(request.type() == null ? AssignmentType.FORMATIVE : request.type())
        .classroomId(request.classroomId())
        .state(AssignmentState.DRAFT)
        .windowStart(request.windowStart())
        .windowEnd(request.windowEnd())
        .timeLimitSec(request.timeLimitSec())
        .attemptsAllowed(request.attemptsAllowed() == null ? 1 : Math.max(request.attemptsAllowed(), 1))
        .createdByUserId(requesterId)
        .build();
    assignmentRepo.save(a);
    return toDto(a);
  }

  @Override
  public AssignmentResponse publish(UUID assignmentId, UUID requesterId) {
    AssessmentAssignment a = load(assignmentId);
    checkStaffIfClassroom(a, requesterId);
    if (a.getState() != AssignmentState.DRAFT) {
      throw new BadRequestException("Sólo DRAFT puede publicarse");
    }
    a.setState(AssignmentState.PUBLISHED);
    return toDto(a);
  }

  @Override
  public AssignmentResponse close(UUID assignmentId, UUID requesterId) {
    AssessmentAssignment a = load(assignmentId);
    checkStaffIfClassroom(a, requesterId);
    if (a.getState() == AssignmentState.CLOSED) {
      return toDto(a);
    }
    a.setState(AssignmentState.CLOSED);
    return toDto(a);
  }

  @Override
  public OverviewResponse getOverview(UUID assignmentId, UUID requesterId) {
    AssessmentAssignment a = load(assignmentId);
    checkStaffIfClassroom(a, requesterId);
    return overviewService.compute(assignmentId);
  }

  @Override
  public PageResponse<SubmissionSummaryDto> listSubmissions(UUID assignmentId,
      Optional<String> status,
      Pageable pageable) {
    Page<AssessmentSubmission> page = submissionRepo.findByAssignment_Id(assignmentId, pageable);
    var mapped = page.map(this::toSummary);
    return PageResponse.of(mapped);
  }

  @Override
  public PageResponse<AssignmentResponse> listMyAssignments(UUID studentId, Pageable pageable) {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    // Simplificación: devolver PUBLISHED cuya ventana contenga now o no tengan
    // ventana.
    Page<AssessmentAssignment> page = assignmentRepo.findByStateAndWindowStartBeforeAndWindowEndAfter(
        AssignmentState.PUBLISHED,
        now,
        now,
        pageable);
    return PageResponse.of(page.map(this::toDto));
  }

  // ---- helpers

  private AssessmentAssignment load(UUID id) {
    return assignmentRepo.findById(id)
        .orElseThrow(() -> new NotFoundException("Asignación no encontrada"));
  }

  private void checkStaffIfClassroom(AssessmentAssignment a, UUID userId) {
    if (a.getScope() == AssignmentScope.CLASSROOM) {
      boolean staff = classroomClient.isMember(a.getClassroomId(), userId);
      if (!staff)
        throw new ForbiddenException("No eres staff del aula");
    }
  }

  private SubmissionSummaryDto toSummary(AssessmentSubmission s) {
    return new SubmissionSummaryDto(
        s.getId(), s.getStudentId(), s.getStatus(),
        s.getScore(), s.getMaxScore(),
        s.getStartedAt(), s.getSubmittedAt(), s.getGradedAt(),
        s.getDurationSec(), s.getAttemptNo());
  }

  private AssignmentResponse toDto(AssessmentAssignment a) {
    return new AssignmentResponse(
        a.getId(),
        a.getTemplate().getId(),
        a.getScope(),
        a.getType(),
        a.getClassroomId(),
        a.getState(),
        a.getWindowStart(),
        a.getWindowEnd(),
        a.getTimeLimitSec(),
        a.getAttemptsAllowed(),
        a.getCreatedByUserId(),
        a.getCreatedAt(),
        a.getUpdatedAt());
  }
}
