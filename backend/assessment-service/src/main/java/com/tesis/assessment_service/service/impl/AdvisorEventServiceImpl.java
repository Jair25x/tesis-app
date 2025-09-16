// com.tesis.assessment_service.service.impl.AdvisorEventServiceImpl
// (reemplazo completo)
package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.model.AssessmentSubmission;
import com.tesis.assessment_service.model.AssessmentSubmissionItem;
import com.tesis.assessment_service.model.AssessmentAdvisorOutbox;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import com.tesis.assessment_service.repository.AssessmentAdvisorOutboxRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionItemRepository;
import com.tesis.assessment_service.service.AdvisorEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvisorEventServiceImpl implements AdvisorEventService {

  private final AssessmentAdvisorOutboxRepository advisorRepo;
  private final AssessmentSubmissionItemRepository itemRepo;
  private final ObjectMapper mapper;

  @Override
  public void enqueueGradedEvent(AssessmentSubmission s) {
    if (s.getStatus() != SubmissionStatus.GRADED)
      return;

    var items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());

    // --- agregación por objetivo (informativa)
    var byObjective = items.stream().collect(Collectors.groupingBy(AssessmentSubmissionItem::getObjectiveId));
    var objectiveResults = mapper.createArrayNode();
    byObjective.forEach((objectiveId, list) -> {
      BigDecimal scoreSum = list.stream()
          .map(i -> i.getScore() == null ? BigDecimal.ZERO : i.getScore())
          .reduce(BigDecimal.ZERO, BigDecimal::add);
      int pointsSum = list.stream().mapToInt(i -> i.getPoints() == null ? 0 : i.getPoints()).sum();
      double accuracy = pointsSum == 0 ? 0d : scoreSum.doubleValue() / (double) pointsSum;

      ObjectNode node = mapper.createObjectNode();
      node.put("objectiveId", objectiveId.toString());
      node.put("score", scoreSum);
      node.put("maxScore", pointsSum);
      node.put("accuracy", accuracy);
      objectiveResults.add(node);
    });

    // --- detalle por ítem
    var itemResults = mapper.createArrayNode();
    items.forEach(i -> {
      ObjectNode n = mapper.createObjectNode();

      n.put("submissionItemId", i.getId().toString());
      n.put("exerciseId", i.getExerciseId().toString());
      n.put("objectiveId", i.getObjectiveId().toString());
      n.put("gradingMode", i.getGradingMode() == null ? GradingMode.AUTO.name() : i.getGradingMode().name());
      n.put("source", "ASSESSMENT"); // opcional (tu schema lo asume por defecto)

      if (i.getCorrect() != null)
        n.put("correct", i.getCorrect());

      int maxPts = (i.getPoints() == null ? 0 : i.getPoints());
      n.put("maxPoints", maxPts);

      BigDecimal raw = i.getScore(); // puntos logrados
      if (raw != null) {
        n.put("points", raw.intValue());
        if (maxPts > 0) {
          double norm = raw.doubleValue() / (double) maxPts;
          if (norm < 0)
            norm = 0;
          if (norm > 1)
            norm = 1;
          n.put("score", norm);
        }
      }

      OffsetDateTime at = (i.getCheckedAt() != null) ? i.getCheckedAt()
          : (i.getUpdatedAt() != null) ? i.getUpdatedAt().atOffset(ZoneOffset.UTC)
              : (s.getGradedAt() != null) ? s.getGradedAt() : OffsetDateTime.now(ZoneOffset.UTC);
      n.put("answeredAt", at.toInstant().toString());

      // (Opcional) si denormalizas dificultad:
      // n.put("difficulty", i.getExerciseDifficulty().name());

      itemResults.add(n);
    });

    // --- envelope (el client lo “aplana” a 1 POST por item)
    ObjectNode payload = mapper.createObjectNode();
    payload.put("assignmentId", s.getAssignment().getId().toString());
    payload.put("assignmentType", s.getAssignment().getType().name());
    payload.put("studentId", s.getStudentId().toString());
    if (s.getAssignment().getClassroomId() != null)
      payload.put("classroomId", s.getAssignment().getClassroomId().toString());
    payload.put("curriculumId", s.getAssignment().getTemplate().getCurriculumId().toString());

    if (s.getScore() != null)
      payload.put("score", s.getScore());
    if (s.getMaxScore() != null)
      payload.put("maxScore", s.getMaxScore());
    if (s.getDurationSec() != null)
      payload.put("durationSec", s.getDurationSec());

    payload.set("objectiveResults", objectiveResults);
    payload.set("itemResults", itemResults);

    ObjectNode event = mapper.createObjectNode();
    event.put("eventId", java.util.UUID.randomUUID().toString());
    event.put("occurredAt", OffsetDateTime.now(ZoneOffset.UTC).toString());
    event.put("type", "AssessmentGraded");
    event.set("payload", payload);

    var out = AssessmentAdvisorOutbox.builder()
        .submissionId(s.getId())
        .status(OutboxStatus.PENDING)
        .payloadJson(event)
        .build();

    advisorRepo.save(out);
  }
}
