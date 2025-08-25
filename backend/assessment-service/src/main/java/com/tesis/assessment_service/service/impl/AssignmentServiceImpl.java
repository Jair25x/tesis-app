package com.tesis.assessment_service.service.impl;

import com.tesis.assessment_service.dto.request.AssignmentRequest;
import com.tesis.assessment_service.dto.request.CloneAssignmentRequest;
import com.tesis.assessment_service.dto.request.AssignmentSearchCriteria;
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
import java.util.EnumSet;
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

  /** Estudiante: asignaciones publicadas vigentes + flags. */
  @Override
  public PageResponse<StudentAssignmentSummaryResponse> listMyAssignments(UUID studentId, Pageable pageable) {
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

    // PUBLISHED y ventana activa (o sin ventana)
    Page<AssessmentAssignment> page = assignmentRepo.findByStateAndWindowStartBeforeAndWindowEndAfter(
        AssignmentState.PUBLISHED, now, now, pageable);

    var mapped = page.map(a -> {
      // attempts usados por este estudiante
      long attemptsUsed = submissionRepo.countByAssignment_IdAndStudentId(a.getId(), studentId);

      // started: existe IN_PROGRESS
      boolean started = submissionRepo.existsByAssignment_IdAndStudentIdAndStatus(
          a.getId(), studentId, SubmissionStatus.IN_PROGRESS);

      // submitted: existe SUBMITTED o GRADED
      boolean submitted = submissionRepo.existsByAssignment_IdAndStudentIdAndStatusIn(
          a.getId(), studentId, EnumSet.of(SubmissionStatus.SUBMITTED, SubmissionStatus.GRADED));

      boolean withinWindow = isWithinWindow(a, now);
      boolean canStart = a.getState() == AssignmentState.PUBLISHED
          && withinWindow
          && attemptsUsed < (a.getAttemptsAllowed() == null ? 1 : a.getAttemptsAllowed())
          && !started; // no permitir nuevo intento si hay uno en curso

      return new StudentAssignmentSummaryResponse(
          a.getId(),
          a.getTemplate().getId(),
          a.getTemplate().getTitle(),
          a.getScope(),
          a.getType(),
          a.getState(),
          a.getWindowStart(),
          a.getWindowEnd(),
          a.getTimeLimitSec(),
          a.getAttemptsAllowed(),
          (int) attemptsUsed,
          canStart,
          started,
          submitted);
    });

    return PageResponse.of(mapped);
  }

  @Override
  public AssignmentResponse cloneAssignment(UUID sourceAssignmentId, UUID requesterId, CloneAssignmentRequest req) {
    AssessmentAssignment src = load(sourceAssignmentId);
    // Validación: el requester debe poder operar en el scope destino
    AssignmentScope scope = req != null && req.scope() != null ? req.scope() : src.getScope();
    UUID classroomId = req != null ? req.classroomId() : src.getClassroomId();

    if (scope == AssignmentScope.CLASSROOM) {
      if (classroomId == null)
        throw new BadRequestException("classroomId es requerido para scope=CLASSROOM");
      boolean staff = classroomClient.isMember(classroomId, requesterId);
      if (!staff)
        throw new ForbiddenException("No eres staff del aula destino");
    }

    AssessmentAssignment clone = AssessmentAssignment.builder()
        .template(src.getTemplate())
        .scope(scope)
        .type(src.getType())
        .classroomId(scope == AssignmentScope.CLASSROOM ? classroomId : null)
        .state(AssignmentState.DRAFT) // siempre nace DRAFT
        .windowStart(req != null && req.windowStart() != null ? req.windowStart() : src.getWindowStart())
        .windowEnd(req != null && req.windowEnd() != null ? req.windowEnd() : src.getWindowEnd())
        .timeLimitSec(req != null && req.timeLimitSec() != null ? req.timeLimitSec() : src.getTimeLimitSec())
        .attemptsAllowed(
            req != null && req.attemptsAllowed() != null ? req.attemptsAllowed() : src.getAttemptsAllowed())
        .createdByUserId(requesterId)
        .build();

    assignmentRepo.save(clone);
    return toDto(clone);
  }

  @Override
  public Page<AssignmentSummaryResponse> search(AssignmentSearchCriteria c, Pageable pageable) {
    // --- Auth -> finales para uso en lambda/Specification
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

    UUID tmp = null;
    if (auth != null && auth.getName() != null) {
      try {
        tmp = UUID.fromString(auth.getName());
      } catch (Exception ignore) {
      }
    }
    final UUID requesterId = tmp;

    final boolean isAdmin = auth != null && auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
    final boolean mineOnlyEffective = (c.mineOnly == null) ? !isAdmin : c.mineOnly;

    // Specification dinámica
    org.springframework.data.jpa.domain.Specification<AssessmentAssignment> spec = (root, query, cb) -> {
      var preds = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

      if (mineOnlyEffective || !isAdmin) {
        if (requesterId != null) {
          preds.add(cb.equal(root.get("createdByUserId"), requesterId));
        }
      }
      if (c.state != null)
        preds.add(cb.equal(root.get("state"), c.state));
      if (c.type != null)
        preds.add(cb.equal(root.get("type"), c.type));
      if (c.scope != null)
        preds.add(cb.equal(root.get("scope"), c.scope));
      if (c.classroomId != null)
        preds.add(cb.equal(root.get("classroomId"), c.classroomId));
      if (c.templateId != null)
        preds.add(cb.equal(root.get("template").get("id"), c.templateId));
      if (c.windowFrom != null)
        preds.add(cb.greaterThanOrEqualTo(root.get("windowStart"), c.windowFrom));
      if (c.windowTo != null)
        preds.add(cb.lessThanOrEqualTo(root.get("windowEnd"), c.windowTo));

      return cb.and(preds.toArray(new jakarta.persistence.criteria.Predicate[0]));
    };

    var page = assignmentRepo.findAll(spec, pageable);

    return page.map(a -> new AssignmentSummaryResponse(
        a.getId(),
        a.getTemplate() != null ? a.getTemplate().getId() : null,
        a.getTemplate() != null ? a.getTemplate().getTitle() : null,
        a.getScope(),
        a.getType(),
        a.getState(),
        a.getWindowStart(),
        a.getWindowEnd(),
        a.getTimeLimitSec(),
        a.getAttemptsAllowed(),
        a.getClassroomId(),
        a.getCreatedByUserId(),
        toOffset(a.getCreatedAt()), // LocalDateTime -> OffsetDateTime UTC
        toOffset(a.getUpdatedAt()) // LocalDateTime -> OffsetDateTime UTC
    ));
  }

  // ---- helpers
  /** Convierte LocalDateTime a OffsetDateTime (UTC) de forma segura. */
  private java.time.OffsetDateTime toOffset(java.time.LocalDateTime dt) {
    return dt == null ? null : dt.atOffset(java.time.ZoneOffset.UTC);
  }

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

  private boolean isWithinWindow(AssessmentAssignment a, OffsetDateTime now) {
    boolean afterStart = a.getWindowStart() == null || !now.isBefore(a.getWindowStart());
    boolean beforeEnd = a.getWindowEnd() == null || !now.isAfter(a.getWindowEnd());
    return afterStart && beforeEnd;
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
