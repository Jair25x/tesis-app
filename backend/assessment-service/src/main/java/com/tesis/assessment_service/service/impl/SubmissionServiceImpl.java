package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.dto.request.SubmitRequest;
import com.tesis.assessment_service.dto.response.*;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

import static com.tesis.assessment_service.util.ScoreUtils.normalize;

@Slf4j
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

    // 3) Idempotencia
    Optional<AssessmentSubmission> inProgress = submissionRepo
        .findTopByAssignment_IdAndStudentIdAndStatusOrderByCreatedAtDesc(assignmentId, studentId,
            SubmissionStatus.IN_PROGRESS);
    if (inProgress.isPresent()) {
      return toStartResponse(inProgress.get());
    }

    // 4) Límite de intentos
    long used = submissionRepo.countByAssignment_IdAndStudentId(assignmentId, studentId);
    int allowed = (a.getAttemptsAllowed() == null || a.getAttemptsAllowed() < 1) ? 1 : a.getAttemptsAllowed();
    if (used >= allowed) {
      throw new ConflictException("Se alcanzó el número máximo de intentos permitidos");
    }

    // 5) attemptNo = máximo previo + 1
    int nextAttemptNo = submissionRepo
        .findTopByAssignment_IdAndStudentIdOrderByAttemptNoDesc(assignmentId, studentId)
        .map(s -> (s.getAttemptNo() == null ? 0 : s.getAttemptNo()) + 1)
        .orElse(1);

    // 6) Crear submission
    AssessmentTemplate tpl = templateRepo.findById(a.getTemplate().getId())
        .orElseThrow(() -> new IllegalStateException("Plantilla inconsistente"));
    Integer timeLimit = a.getTimeLimitSec();

    AssessmentSubmission s = AssessmentSubmission.builder()
        .assignment(a)
        .studentId(studentId)
        .status(SubmissionStatus.IN_PROGRESS)
        .startedAt(OffsetDateTime.now(ZoneOffset.UTC))
        .attemptNo(nextAttemptNo)
        .durationSec(timeLimit)
        .build();
    submissionRepo.save(s);

    // 7) Items de la plantilla (ordenados)
    List<AssessmentTemplateItem> templateItems = tpl.getItems() == null
        ? List.of()
        : tpl.getItems().stream()
            .sorted(Comparator.comparingInt(AssessmentTemplateItem::getPosition))
            .toList();

    // 8) Lookup batch dificultad
    List<UUID> exerciseIds = templateItems.stream()
        .map(AssessmentTemplateItem::getExerciseId)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    final Map<UUID, String> diffMap = safeGetDifficulties(exerciseIds);

    // 9) Construir y persistir items
    List<AssessmentSubmissionItem> items = templateItems.stream()
        .map(ti -> {
          AssessmentSubmissionItem.AssessmentSubmissionItemBuilder b = AssessmentSubmissionItem.builder()
              .submission(s)
              .exerciseId(ti.getExerciseId())
              .objectiveId(ti.getObjectiveId())
              .position(ti.getPosition())
              .points(ti.getPoints())
              .gradingMode(ti.getGradingMode());

          String d = diffMap.get(ti.getExerciseId()); // puede ser null
          ExerciseDifficulty ed = parseDifficultySafe(d);
          if (ed != null) {
            b.exerciseDifficulty(ed);
          }
          return b.build();
        })
        .toList();

    itemRepo.saveAll(items);

    return toStartResponse(s, items);
  }

  /** Siempre devuelve un Map; registra warning si curriculum falla. */
  private Map<UUID, String> safeGetDifficulties(List<UUID> exerciseIds) {
    if (exerciseIds == null || exerciseIds.isEmpty())
      return Map.of();
    try {
      return curriculumClient.getExerciseDifficulties(exerciseIds); // BASIC|INTERMEDIATE|ADVANCED
    } catch (Exception e) {
      log.warn("No se pudo resolver dificultades en batch (continuamos sin denormalizar): {}", e.getMessage());
      return Map.of();
    }
  }

  private ExerciseDifficulty parseDifficultySafe(String raw) {
    if (raw == null || raw.isBlank())
      return null;
    String x = raw.trim().toUpperCase(Locale.ROOT);
    switch (x) {
      case "EASY":
        x = "BASIC";
        break;
      case "MEDIUM":
        x = "INTERMEDIATE";
        break;
      case "HARD":
        x = "ADVANCED";
        break;
      default:
        break;
    }
    try {
      return ExerciseDifficulty.valueOf(x);
    } catch (IllegalArgumentException ex) {
      log.warn("Valor de dificultad no reconocido '{}', se ignora", raw);
      return null;
    }
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
      it.setAnswerJson(answerJson); // JSONB

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
      it.setFeedbackJson(cr.feedback()); // JSONB

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
    if (s.getStartedAt() != null && s.getSubmittedAt() != null) {
      int elapsed = (int) java.time.Duration.between(s.getStartedAt(), s.getSubmittedAt()).getSeconds();
      s.setElapsedSec(Math.max(0, elapsed));
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

  @Override
  public PageResponse<MySubmissionSummaryDto> listMySubmissions(UUID studentId,
      Optional<SubmissionStatus> status,
      Pageable pageable) {
    Page<AssessmentSubmission> page = status
        .map(st -> submissionRepo.findByStudentIdAndStatus(studentId, st, pageable))
        .orElseGet(() -> submissionRepo.findByStudentId(studentId, pageable));

    // 1) Colectar classroomIds de la página
    List<UUID> classroomIds = page.getContent().stream()
        .map(AssessmentSubmission::getAssignment)
        .filter(Objects::nonNull)
        .filter(a -> a.getScope() == AssignmentScope.CLASSROOM)
        .map(AssessmentAssignment::getClassroomId)
        .filter(Objects::nonNull)
        .distinct()
        .toList();

    // 2) Lookup batch id->name
    Map<UUID, String> names = classroomClient.lookupNames(classroomIds);

    // 3) Mapear DTO incluyendo classroomName
    Page<MySubmissionSummaryDto> mapped = page.map(s -> {
      var assignment = s.getAssignment();
      var tpl = assignment != null ? assignment.getTemplate() : null;
      String classroomName = null;
      if (assignment != null && assignment.getScope() == AssignmentScope.CLASSROOM) {
        classroomName = names.getOrDefault(assignment.getClassroomId(), null);
      }
      return MySubmissionSummaryDto.builder()
          .submissionId(s.getId())
          .assignmentId(assignment != null ? assignment.getId() : null)
          .templateTitle(tpl != null ? tpl.getTitle() : null)
          .attemptNo(s.getAttemptNo())
          .status(s.getStatus())
          .score(s.getScore())
          .maxScore(s.getMaxScore())
          .startedAt(s.getStartedAt())
          .submittedAt(s.getSubmittedAt())
          .gradedAt(s.getGradedAt())
          .scope(assignment != null ? assignment.getScope() : null)
          .classroomName(classroomName)
          .build();
    });

    return PageResponse.of(mapped);
  }

  // ---- helpers menores ----

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

    Integer limit = (s.getDurationSec() != null) ? s.getDurationSec() : a.getTimeLimitSec();
    if (limit != null && s.getStartedAt() != null) {
      OffsetDateTime until = s.getStartedAt().plusSeconds(limit);
      if (OffsetDateTime.now(ZoneOffset.UTC).isAfter(until)) {
        // permitido; marcarás late más adelante
      }
    }
  }

  private boolean isLate(AssessmentAssignment a, AssessmentSubmission s) {
    Integer limit = (s.getDurationSec() != null) ? s.getDurationSec() : a.getTimeLimitSec();
    if (limit == null || s.getStartedAt() == null)
      return false;
    OffsetDateTime until = s.getStartedAt().plusSeconds(limit);
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

    JsonNode configNode = loadTemplateConfig(s.getAssignment());

    Integer effectiveLimit = (s.getDurationSec() != null)
        ? s.getDurationSec()
        : (s.getAssignment() != null ? s.getAssignment().getTimeLimitSec() : null);

    return new StartResponse(
        s.getId(),
        s.getAssignment().getId(),
        s.getStudentId(),
        s.getAttemptNo(),
        s.getStartedAt(),
        effectiveLimit,
        configNode,
        list);
  }

  private JsonNode loadTemplateConfig(AssessmentAssignment a) {
    try {
      UUID tplId = (a.getTemplate() != null ? a.getTemplate().getId() : null);
      if (tplId != null) {
        var tpl = templateRepo.findById(tplId).orElse(null);
        if (tpl != null) {
          return tpl.getConfigJson();
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
        i.getAnswerJson(),
        i.getCorrect(),
        i.getScore(),
        i.getFeedbackJson(),
        i.getCheckedAt(),
        i.getExerciseTitle(),
        i.getExerciseType(),
        i.getStatementRendered())).toList();

    Integer effectiveLimit = (s.getDurationSec() != null)
        ? s.getDurationSec()
        : (s.getAssignment() != null ? s.getAssignment().getTimeLimitSec() : null);

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
        effectiveLimit,
        s.getElapsedSec(),
        s.getAttemptNo(),
        detailItems);
  }

  /** Envío a progress-service con outbox fallback. */
  private void postAttemptBestEffort(AssessmentSubmission s, AssessmentSubmissionItem it, UUID objectiveId) {
    try {
      ObjectNode meta = mapper.createObjectNode();
      meta.put("assignmentId", s.getAssignment().getId().toString());
      meta.put("submissionId", s.getId().toString());
      meta.put("submissionItemId", it.getId().toString());
      meta.put("gradingMode", it.getGradingMode().name());

      BigDecimal normalized = normalize(it.getScore(), it.getPoints());

      var req = new ProgressClient.AttemptRequest(
          s.getStudentId(),
          "ASSESSMENT",
          s.getAssignment().getTemplate().getCurriculumId(),
          it.getExerciseId(),
          it.getCorrect(),
          normalized, // normalizedScore 0..1
          it.getScore() == null ? null : it.getScore().intValue(), // awardedPoints
          it.getPoints(), // maxPoints
          (objectiveId != null ? objectiveId : it.getObjectiveId()),
          meta);
      progressClient.postAttempt(req);

    } catch (Exception ex) {
      AssessmentProgressOutbox out = AssessmentProgressOutbox.builder()
          .submissionItemId(it.getId())
          .payloadJson(safePayloadForOutbox(s, it, objectiveId))
          .status(OutboxStatus.PENDING)
          .lastError(ex.getMessage())
          .build();
      outboxRepo.save(out);
    }
  }

  private JsonNode safePayloadForOutbox(AssessmentSubmission s, AssessmentSubmissionItem it, UUID objectiveId) {
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

      BigDecimal normalized = normalize(it.getScore(), it.getPoints());
      if (normalized != null)
        root.put("normalizedScore", normalized);
      if (it.getScore() != null)
        root.put("awardedPoints", it.getScore().intValue());
      if (it.getPoints() != null)
        root.put("maxPoints", it.getPoints());

      UUID obj = (objectiveId != null ? objectiveId : it.getObjectiveId());
      if (obj != null)
        root.put("objectiveId", obj.toString());

      root.set("metadata", meta);
      return root;

    } catch (Exception e) {
      return mapper.createObjectNode();
    }
  }
}
