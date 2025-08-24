package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.repository.AssessmentProgressOutboxRepository;
import com.tesis.assessment_service.repository.AssessmentAdvisorOutboxRepository;
import com.tesis.assessment_service.service.OutboxResendService;
import com.tesis.assessment_service.service.client.AdvisorClient;
import com.tesis.assessment_service.service.client.ProgressClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OutboxResendServiceImpl implements OutboxResendService {

  private final AssessmentProgressOutboxRepository progressRepo;
  private final AssessmentAdvisorOutboxRepository advisorRepo;
  private final ProgressClient progressClient;
  private final AdvisorClient advisorClient;
  private final ObjectMapper mapper;

  @Override
  public int resendProgressOnce(int limit) {
    var list = progressRepo.findTopNPendingOrFailed(limit);
    list.forEach(msg -> {
      try {
        var node = (ObjectNode) mapper.readTree(msg.getPayloadJson());
        var req = new ProgressClient.AttemptRequest(
            UUID.fromString(node.path("studentId").asText()),
            node.path("source").asText("ASSESSMENT"),
            node.hasNonNull("curriculumId") ? UUID.fromString(node.path("curriculumId").asText()) : null,
            UUID.fromString(node.path("exerciseId").asText()),
            node.has("correct") && !node.get("correct").isNull() ? node.get("correct").asBoolean() : null,
            node.hasNonNull("score") ? new BigDecimal(node.path("score").asText()) : null,
            node.hasNonNull("points") ? node.get("points").asInt() : null,
            UUID.fromString(node.path("objectiveId").asText()),
            mapper.convertValue(node.path("metadata"), com.fasterxml.jackson.databind.node.ObjectNode.class));
        progressClient.postAttempt(req);
        msg.setStatus(OutboxStatus.SENT);
        msg.setLastError(null);
      } catch (Exception ex) {
        msg.setStatus(OutboxStatus.FAILED);
        msg.setLastError(ex.getMessage());
      }
    });
    progressRepo.saveAll(list);
    return list.size();
  }

  @Override
  public int resendAdvisorOnce(int limit) {
    var list = advisorRepo.findTopNPendingOrFailed(limit);
    list.forEach(msg -> {
      try {
        var event = (ObjectNode) mapper.readTree(msg.getPayloadJson());
        advisorClient.postAssessmentGraded(event);
        msg.setStatus(OutboxStatus.SENT);
        msg.setLastError(null);
      } catch (Exception ex) {
        msg.setStatus(OutboxStatus.FAILED);
        msg.setLastError(ex.getMessage());
      }
    });
    advisorRepo.saveAll(list);
    return list.size();
  }
}
