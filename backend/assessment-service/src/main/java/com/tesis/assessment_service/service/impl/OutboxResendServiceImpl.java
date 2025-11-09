package com.tesis.assessment_service.service.impl;

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

/**
 * Reintentos manuales (API/administrador).
 * Ya no parsea Strings: usa JsonNode directo de las entidades.
 */
@Service
@RequiredArgsConstructor
public class OutboxResendServiceImpl implements OutboxResendService {

  private final AssessmentProgressOutboxRepository progressRepo;
  private final AssessmentAdvisorOutboxRepository advisorRepo;
  private final ProgressClient progressClient;
  private final AdvisorClient advisorClient;

  @Override
  public int resendProgressOnce(int limit) {
    var list = progressRepo.findTopNPendingOrFailed(limit);
    list.forEach(msg -> {
      try {
        ObjectNode node = (ObjectNode) msg.getPayloadJson(); // JSONB → ObjectNode

        var req = new ProgressClient.AttemptRequest(
            UUID.fromString(node.path("studentId").asText()),
            node.path("source").asText("ASSESSMENT"),
            node.hasNonNull("curriculumId") ? UUID.fromString(node.path("curriculumId").asText()) : null,
            UUID.fromString(node.path("exerciseId").asText()),
            node.has("correct") && !node.get("correct").isNull() ? node.get("correct").asBoolean() : null,
            node.hasNonNull("normalizedScore") ? node.path("normalizedScore").decimalValue() : null,
            node.hasNonNull("awardedPoints") ? node.path("awardedPoints").asInt() : null,
            node.hasNonNull("maxPoints") ? node.path("maxPoints").asInt() : null,
            node.hasNonNull("objectiveId") ? UUID.fromString(node.path("objectiveId").asText()) : null,
            (ObjectNode) node.path("metadata"));
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
        ObjectNode event = (ObjectNode) msg.getPayloadJson(); // JSONB → ObjectNode
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
