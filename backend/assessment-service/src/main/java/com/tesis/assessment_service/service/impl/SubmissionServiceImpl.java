package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.dto.request.SubmitRequest;
import com.tesis.assessment_service.dto.response.StartResponse;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.dto.response.SubmitResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.exception.ConflictException;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.exception.NotFoundException;
import com.tesis.assessment_service.model.*;
import com.tesis.assessment_service.model.enums.*;
import com.tesis.assessment_service.repository.*;
import com.tesis.assessment_service.service.SubmissionService;
import com.tesis.assessment_service.service.client.ClassroomClient;
import com.tesis.assessment_service.service.client.CurriculumClient;
import com.tesis.assessment_service.service.client.ProgressClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

  private final AssessmentAssignmentRepository assignmentRepo;
  private final AssessmentTemplateRepository templateRepo;
  private final AssessmentSubmissionRepository submissionRepo;
  private final AssessmentSubmissionItemRepository itemRepo;
  private final AssessmentProgressOutboxRepository outboxRepo;

  private final ClassroomClient classroomClient;
  private final CurriculumClient curriculumClient;
  private final ProgressClient progressClient;

  private final ObjectMapper mapper;

  @Override
  public StartResponse start(UUID assignmentId, UUID studentId) {
    AssessmentAssignment a = assignmentRepo.findById(assignmentId)
        .orElseThrow(() -> new NotFoundException("Asignación no encontrada"));

    // 1) ventana y estado
    ensureStartAllowed(a);

    // 2) membresía si es aula
    ensureStudentMembership(a, studentId);

    // 3) idempotencia
    Optional<AssessmentSubmission> existingLatest = submissionRepo
        .findTopByAssignment_IdAndStudentIdOrderByCreatedAtDesc(assignmentId, studentId);

    if (existingLatest.isPresent()) {
      AssessmentSubmission s = existingLatest.get();
      if (s.getStatus() == SubmissionStatus.IN_PROGRESS) {
        return toStartResponse(s);
      }
      if (s.getStatus() == SubmissionStatus.SUBMITTED || s.getStatus() == SubmissionStatus.GRADED) {
        throw new ConflictException("Ya enviaste esta evaluación");
      }
    }

    // 4) crear submission + items desde snapshot de plantilla
    AssessmentTemplate tpl = templateRepo.findWithItemsById(a.getTemplate().getId())
        .orElseThrow(() -> new IllegalStateException("Plantilla inconsistente"));

    AssessmentSubmission s = AssessmentSubmission.builder()
        .assignment(a)
        .studentId(studentId)
        .status(SubmissionStatus.IN_PROGRESS)
        .startedAt(OffsetDateTime.now(ZoneOffset.UTC))
        .attemptNo(1) // TODO: si soportas múltiples intentos, incrementa aquí
        .build();
    submissionRepo.save(s);

    List<AssessmentSubmissionItem> items = tpl.getItems().stream()
        .sorted(Comparator.comparingInt(AssessmentTemplateItem::getPosition))
        .map(ti -> AssessmentSubmissionItem.builder()
            .submission(s)
            .exerciseId(ti.getExerciseId())
            .objectiveId(ti.getObjectiveId())
            .position(ti.getPosition())
            .points(ti.getPoints())
            .gradingMode(ti.getGradingMode())
            .build())
        .toList();
    itemRepo.saveAll(items);

    return toStartResponse(s, items);
  }

  @Override
  public SubmitResponse submit(UUID submissionId, UUID studentId, SubmitRequest request) {
    AssessmentSubmission s = submissionRepo.findById(submissionId)
        .orElseThrow(() -> new NotFoundException("Submission no encontrado"));

    if (!s.getStudentId().equals(studentId)) {
      throw new ForbiddenException("No puedes enviar un submission de otro alumno");
    }
    if (s.getStatus() == SubmissionStatus.SUBMITTED || s.getStatus() == SubmissionStatus.GRADED) {
      throw new ConflictException("Submission ya fue enviado");
    }

    AssessmentAssignment a = s.getAssignment();

    // Ventana y time-limit
    ensureSubmitAllowed(a, s);

    // Traer items y mapear respuestas por id
    List<AssessmentSubmissionItem> items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());
    Map<UUID, SubmitRequest.AnswerItem> answersById = request.answers().stream()
        .collect(Collectors.toMap(SubmitRequest.AnswerItem::submissionItemId, x -> x));

    // Corrección
    BigDecimal totalScore = BigDecimal.ZERO;
    int totalPoints = 0;
    boolean hasManual = false;
    List<SubmitResponse.ItemResult> results = new ArrayList<>();

    for (AssessmentSubmissionItem it : items) {
      totalPoints += Optional.ofNullable(it.getPoints()).orElse(1);

      SubmitRequest.AnswerItem ans = answersById.get(it.getId());
      JsonNode answerJson = (ans != null && ans.answer() != null) ? ans.answer().value() : null;
      it.setAnswerJson(answerJson); // 👈 JsonNode directo (JSONB)

      if (it.getGradingMode() == GradingMode.MANUAL) {
        hasManual = true;
        results.add(new SubmitResponse.ItemResult(it.getId(), null, null, null));
        continue;
      }

      // AUTO → curriculum check
      CurriculumClient.CheckResult cr = curriculumClient.checkExercise(it.getExerciseId(), answerJson);
      it.setCheckedAt(OffsetDateTime.now(ZoneOffset.UTC));
      it.setCorrect(cr.correct());
      BigDecimal itemScore = BigDecimal.valueOf(it.getPoints());
      if (!cr.correct()) {
        itemScore = BigDecimal.ZERO;
      }
      it.setScore(itemScore);
      it.setFeedbackJson(cr.feedback()); // 👈 JsonNode directo (JSONB)

      totalScore = totalScore.add(itemScore);

      results.add(new SubmitResponse.ItemResult(
          it.getId(),
          cr.correct(),
          itemScore,
          cr.feedback() == null ? null : new com.tesis.assessment_service.dto.common.FeedbackPayload(cr.feedback())));

      // Intento → progress-service (best-effort) + outbox fallback
      postAttemptBestEffort(s, it, cr.objectiveId());
    }

    // Estado final submission
    s.setSubmittedAt(OffsetDateTime.now(ZoneOffset.UTC));
    if (s.getStartedAt() != null) {
      s.setDurationSec((int) java.time.Duration.between(s.getStartedAt(), s.getSubmittedAt()).getSeconds());
    }
    s.setMaxScore(BigDecimal.valueOf(totalPoints));

    if (hasManual) {
      s.setStatus(SubmissionStatus.SUBMITTED);
      s.setScore(totalScore);
    } else {
      s.setStatus(SubmissionStatus.GRADED);
      s.setScore(totalScore);
      s.setGradedAt(OffsetDateTime.now(ZoneOffset.UTC));
    }

    boolean late = isLate(a, s);

    return new SubmitResponse(s.getStatus(), s.getScore(), s.getMaxScore(), late, results);
  }

  @Override
  public SubmissionDetailResponse getDetail(UUID submissionId, UUID requesterId, boolean asTeacher) {
    AssessmentSubmission s = submissionRepo.findById(submissionId)
        .orElseThrow(() -> new NotFoundException("Submission no encontrado"));
    AssessmentAssignment a = s.getAssignment();

    if (asTeacher) {
      if (a.getScope() == AssignmentScope.CLASSROOM) {
        boolean staff = classroomClient.isMember(a.getClassroomId(), requesterId);
        if (!staff)
          throw new ForbiddenException("No eres staff del aula");
      }
    } else {
      if (!s.getStudentId().equals(requesterId)) {
        throw new ForbiddenException("No puedes ver el submission de otro alumno");
      }
    }

    List<AssessmentSubmissionItem> items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());
    return toDetailResponse(s, items);
  }

  // ---- helpers

  private void ensureStartAllowed(AssessmentAssignment a) {
    if (a.getState() != AssignmentState.PUBLISHED) {
      throw new BadRequestException("La asignación no está publicada");
    }
    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    if (a.getWindowStart() != null && now.isBefore(a.getWindowStart())) {
      throw new ForbiddenException("Aún no inicia la ventana de evaluación");
    }
    if (a.getWindowEnd() != null && now.isAfter(a.getWindowEnd())) {
      throw new ForbiddenException("La ventana de evaluación ya terminó");
    }
  }

  private void ensureStudentMembership(AssessmentAssignment a, UUID studentId) {
    if (a.getScope() == AssignmentScope.CLASSROOM) {
      boolean member = classroomClient.isMember(a.getClassroomId(), studentId);
      if (!member)
        throw new ForbiddenException("No perteneces al aula de esta evaluación");
    }
  }

  private void ensureSubmitAllowed(AssessmentAssignment a, AssessmentSubmission s) {
    ensureStartAllowed(a);
    if (a.getTimeLimitSec() != null && s.getStartedAt() != null) {
      OffsetDateTime until = s.getStartedAt().plusSeconds(a.getTimeLimitSec());
      if (OffsetDateTime.now(ZoneOffset.UTC).isAfter(until)) {
        // permitido; solo marca late en la respuesta
      }
    }
  }

  private boolean isLate(AssessmentAssignment a, AssessmentSubmission s) {
    if (a.getTimeLimitSec() == null || s.getStartedAt() == null)
      return false;
    OffsetDateTime until = s.getStartedAt().plusSeconds(a.getTimeLimitSec());
    return s.getSubmittedAt() != null && s.getSubmittedAt().isAfter(until);
  }

  private StartResponse toStartResponse(AssessmentSubmission s) {
    List<AssessmentSubmissionItem> items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());
    return toStartResponse(s, items);
  }

  private StartResponse toStartResponse(AssessmentSubmission s, List<AssessmentSubmissionItem> items) {
    var list = items.stream()
        .sorted(Comparator.comparing(AssessmentSubmissionItem::getPosition))
        .map(i -> new StartResponse.Item(
            i.getId(),
            i.getExerciseId(),
            i.getObjectiveId(),
            i.getPosition(),
            i.getPoints(),
            i.getGradingMode()))
        .toList();

    // Config de la plantilla (JsonNode directo desde JSONB)
    JsonNode configNode = loadTemplateConfig(s.getAssignment());

    return new StartResponse(
        s.getId(),
        s.getAssignment().getId(),
        s.getStudentId(),
        s.getAttemptNo(),
        s.getStartedAt(),
        configNode,
        list);
  }

  /** Obtiene el config JSONB (JsonNode) de la plantilla asociada. */
  private JsonNode loadTemplateConfig(AssessmentAssignment a) {
    try {
      UUID tplId = (a.getTemplate() != null ? a.getTemplate().getId() : null);
      if (tplId != null) {
        var tpl = templateRepo.findById(tplId).orElse(null);
        if (tpl != null) {
          return tpl.getConfigJson(); // JsonNode directo (JSONB)
        }
      }
      return (a.getTemplate() != null) ? a.getTemplate().getConfigJson() : null;
    } catch (Exception ignore) {
      return null;
    }
  }

  private SubmissionDetailResponse toDetailResponse(AssessmentSubmission s, List<AssessmentSubmissionItem> items) {
    var detailItems = items.stream().map(i -> new SubmissionDetailResponse.Item(
        i.getId(),
        i.getExerciseId(),
        i.getObjectiveId(),
        i.getPosition(),
        i.getPoints(),
        i.getGradingMode(),
        i.getAnswerJson(), // JsonNode directo
        i.getCorrect(),
        i.getScore(),
        i.getFeedbackJson(), // JsonNode directo
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
        s.getAttemptNo(),
        detailItems);
  }

  private void postAttemptBestEffort(AssessmentSubmission s, AssessmentSubmissionItem it, UUID objectiveId) {
    try {
      ObjectNode meta = mapper.createObjectNode();
      meta.put("assignmentId", s.getAssignment().getId().toString());
      meta.put("submissionId", s.getId().toString());
      meta.put("submissionItemId", it.getId().toString());
      meta.put("gradingMode", it.getGradingMode().name());

      var req = new ProgressClient.AttemptRequest(
          s.getStudentId(),
          "ASSESSMENT",
          s.getAssignment().getTemplate().getCurriculumId(),
          it.getExerciseId(),
          it.getCorrect(),
          it.getScore(),
          it.getPoints(),
          objectiveId != null ? objectiveId : it.getObjectiveId(),
          meta);
      progressClient.postAttempt(req);
    } catch (Exception ex) {
      // Outbox como fallback
      AssessmentProgressOutbox out = AssessmentProgressOutbox.builder()
          .submissionItemId(it.getId())
          .payloadJson(safePayloadForOutbox(s, it, objectiveId)) // String OK (se almacena como JSONB en DB)
          .status(OutboxStatus.PENDING)
          .lastError(ex.getMessage())
          .build();
      outboxRepo.save(out);
    }
  }

  private String safePayloadForOutbox(AssessmentSubmission s, AssessmentSubmissionItem it, UUID objectiveId) {
    try {
      ObjectNode meta = mapper.createObjectNode();
      meta.put("assignmentId", s.getAssignment().getId().toString());
      meta.put("submissionId", s.getId().toString());
      meta.put("submissionItemId", it.getId().toString());
      meta.put("gradingMode", it.getGradingMode().name());

      ObjectNode root = mapper.createObjectNode();
      root.put("studentId", s.getStudentId().toString());
      root.put("source", "ASSESSMENT");
      root.put("curriculumId", s.getAssignment().getTemplate().getCurriculumId().toString());
      root.put("exerciseId", it.getExerciseId().toString());
      if (it.getCorrect() != null)
        root.put("correct", it.getCorrect());
      if (it.getScore() != null)
        root.put("score", it.getScore());
      root.put("points", it.getPoints());
      root.put("objectiveId", (objectiveId != null ? objectiveId : it.getObjectiveId()).toString());
      root.set("metadata", meta);
      return mapper.writeValueAsString(root);
    } catch (Exception e) {
      return "{}";
    }
  }
}
