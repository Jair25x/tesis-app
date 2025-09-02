package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.dto.request.GradeItemRequest;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.exception.NotFoundException;
import com.tesis.assessment_service.model.AssessmentAssignment;
import com.tesis.assessment_service.model.AssessmentSubmission;
import com.tesis.assessment_service.model.AssessmentSubmissionItem;
import com.tesis.assessment_service.model.AssessmentProgressOutbox;
import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import com.tesis.assessment_service.repository.AssessmentProgressOutboxRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionItemRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionRepository;
import com.tesis.assessment_service.service.AdvisorEventService;
import com.tesis.assessment_service.service.GradingService;
import com.tesis.assessment_service.service.client.ClassroomClient;
import com.tesis.assessment_service.service.client.ProgressClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

/**
 * Calificación manual/ajuste de ítems.
 * Cuando falla el post a progress-service, se persiste outbox (JSONB real).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GradingServiceImpl implements GradingService {

  private final AssessmentSubmissionRepository submissionRepo;
  private final AssessmentSubmissionItemRepository itemRepo;
  private final AssessmentProgressOutboxRepository outboxRepo;
  private final ClassroomClient classroomClient;
  private final ProgressClient progressClient;
  private final AdvisorEventService advisorEventService;
  private final ObjectMapper mapper;

  @Override
  public SubmissionDetailResponse gradeItem(UUID submissionId, UUID itemId, UUID teacherId, GradeItemRequest req) {
    AssessmentSubmission s = submissionRepo.findById(submissionId)
        .orElseThrow(() -> new NotFoundException("Submission no encontrado"));
    AssessmentAssignment a = s.getAssignment();

    // Autorización
    if (a.getScope() == AssignmentScope.CLASSROOM) {
      boolean staff = classroomClient.isMember(a.getClassroomId(), teacherId);
      if (!staff)
        throw new ForbiddenException("No eres staff del aula");
    }

    AssessmentSubmissionItem it = itemRepo.findById(itemId)
        .orElseThrow(() -> new NotFoundException("Item no encontrado"));
    if (!it.getSubmission().getId().equals(submissionId)) {
      throw new NotFoundException("Item no pertenece al submission");
    }

    // Calificación
    it.setCorrect(req.correct());
    it.setScore(req.score());
    it.setFeedbackJson(req.feedback() == null ? null : req.feedback().value()); // JSONB
    it.setCheckedAt(OffsetDateTime.now(ZoneOffset.UTC));

    // Intento de notificar progreso (best-effort) + outbox fallback
    ObjectNode meta = mapper.createObjectNode();
    meta.put("assignmentId", a.getId().toString());
    meta.put("submissionId", s.getId().toString());
    meta.put("submissionItemId", it.getId().toString());
    meta.put("gradingMode", it.getGradingMode() == null ? GradingMode.AUTO.name() : it.getGradingMode().name());

    ObjectNode payload = mapper.createObjectNode();
    payload.put("studentId", s.getStudentId().toString());
    payload.put("source", "ASSESSMENT");
    payload.put("curriculumId", a.getTemplate().getCurriculumId().toString());
    payload.put("exerciseId", it.getExerciseId().toString());
    if (it.getCorrect() != null)
      payload.put("correct", it.getCorrect());
    if (it.getScore() != null)
      payload.put("score", it.getScore());
    payload.put("points", it.getPoints() == null ? 0 : it.getPoints());
    payload.put("objectiveId", it.getObjectiveId().toString());
    payload.set("metadata", meta);

    try {
      var reqP = new ProgressClient.AttemptRequest(
          s.getStudentId(), "ASSESSMENT",
          a.getTemplate().getCurriculumId(),
          it.getExerciseId(),
          it.getCorrect(), it.getScore(),
          it.getPoints(), it.getObjectiveId(),
          meta);
      progressClient.postAttempt(reqP);
    } catch (Exception ex) {
      AssessmentProgressOutbox out = AssessmentProgressOutbox.builder()
          .submissionItemId(it.getId())
          .payloadJson(payload) // JsonNode directo (JSONB)
          .status(OutboxStatus.PENDING)
          .lastError(ex.getMessage())
          .build();
      outboxRepo.save(out);
    }

    // Recalcular totales y estado del submission
    List<AssessmentSubmissionItem> items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());
    boolean allScored = items.stream().allMatch(x -> x.getScore() != null);

    if (allScored) {
      BigDecimal total = items.stream()
          .map(x -> x.getScore() == null ? BigDecimal.ZERO : x.getScore())
          .reduce(BigDecimal.ZERO, BigDecimal::add);
      int maxPoints = items.stream().mapToInt(x -> x.getPoints() == null ? 1 : x.getPoints()).sum();

      s.setScore(total);
      s.setMaxScore(BigDecimal.valueOf(maxPoints));
      s.setStatus(SubmissionStatus.GRADED);
      s.setGradedAt(OffsetDateTime.now(ZoneOffset.UTC));

      // Encola evento para AI Advisor
      advisorEventService.enqueueGradedEvent(s);
    } else {
      if (s.getStatus() == SubmissionStatus.IN_PROGRESS) {
        s.setStatus(SubmissionStatus.SUBMITTED);
      }
    }

    return toDetail(s, items);
  }

  private SubmissionDetailResponse toDetail(AssessmentSubmission s, List<AssessmentSubmissionItem> items) {
    var list = items.stream().map(i -> new SubmissionDetailResponse.Item(
        i.getId(),
        i.getExerciseId(),
        i.getObjectiveId(),
        i.getPosition(),
        i.getPoints(),
        i.getGradingMode(),
        i.getAnswerJson(), // JSONB
        i.getCorrect(),
        i.getScore(),
        i.getFeedbackJson(), // JSONB
        i.getCheckedAt(),
        i.getExerciseTitle(),
        i.getExerciseType(),
        i.getStatementRendered())).toList();

    return new SubmissionDetailResponse(
        s.getId(),
        s.getAssignment().getId(),
        s.getStudentId(),
        s.getStatus(),
        s.getScore(),
        s.getMaxScore(),
        s.getStartedAt(),
        s.getSubmittedAt(),
        s.getGradedAt(),
        s.getDurationSec(),
        s.getElapsedSec(),
        s.getAttemptNo(),
        list);
  }
}
