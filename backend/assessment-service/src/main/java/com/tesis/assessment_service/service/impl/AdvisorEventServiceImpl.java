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

    // Cargar ítems desde el repositorio
    var items = itemRepo.findBySubmission_IdOrderByPositionAsc(s.getId());

    // Agregación por objetivo
    var byObjective = items.stream()
        .collect(Collectors.groupingBy(AssessmentSubmissionItem::getObjectiveId));

    var objectiveResults = mapper.createArrayNode();
    byObjective.forEach((objectiveId, list) -> {
      BigDecimal score = list.stream()
          .map(i -> i.getScore() == null ? BigDecimal.ZERO : i.getScore())
          .reduce(BigDecimal.ZERO, BigDecimal::add);
      int points = list.stream().mapToInt(i -> i.getPoints() == null ? 0 : i.getPoints()).sum();
      double accuracy = points == 0 ? 0d : score.doubleValue() / points;

      ObjectNode node = mapper.createObjectNode();
      node.put("objectiveId", objectiveId.toString());
      node.put("score", score);
      node.put("maxScore", points);
      node.put("accuracy", accuracy);
      objectiveResults.add(node);
    });

    var itemResults = mapper.createArrayNode();
    items.forEach(i -> {
      ObjectNode n = mapper.createObjectNode();
      n.put("exerciseId", i.getExerciseId().toString());
      n.put("objectiveId", i.getObjectiveId().toString());
      n.put("gradingMode", i.getGradingMode() == null ? GradingMode.AUTO.name() : i.getGradingMode().name());
      if (i.getCorrect() != null)
        n.put("correct", i.getCorrect());
      if (i.getScore() != null)
        n.put("score", i.getScore());
      n.put("points", i.getPoints() == null ? 0 : i.getPoints());
      itemResults.add(n);
    });

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
    event.put("occurredAt", OffsetDateTime.now().toString());
    event.put("type", "AssessmentGraded");
    event.set("payload", payload);

    var out = AssessmentAdvisorOutbox.builder()
        .submissionId(s.getId())
        .status(OutboxStatus.PENDING)
        .payloadJson(event.toString())
        .build();

    advisorRepo.save(out);
  }
}
