package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.assessment_service.model.AssessmentProgressOutbox;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.repository.AssessmentProgressOutboxRepository;
import com.tesis.assessment_service.service.client.ProgressClient;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class OutboxRetryScheduler {

  private static final Logger log = LoggerFactory.getLogger(OutboxRetryScheduler.class);

  private final AssessmentProgressOutboxRepository outboxRepo;
  private final ProgressClient progressClient;
  private final ObjectMapper mapper;

  @Value("${assessment.outbox.enabled:true}")
  private boolean enabled;

  @Value("${assessment.outbox.batch-size:50}")
  private int batchSize;

  @Value("${assessment.outbox.backoff-ms:2000}")
  private long backoffMs;

  /** Ejecuta cada N ms (configurable). Evita cron rígido para ambientes. */
  @Scheduled(fixedDelayString = "${assessment.outbox.retry.fixed-delay-ms:60000}")
  @Transactional
  public void retryOutbox() {
    if (!enabled)
      return;

    // Trae primero PENDING y luego FAILED (orden FIFO)
    List<AssessmentProgressOutbox> batch = outboxRepo
        .findTopNPendingOrFailed(batchSize);

    if (batch.isEmpty())
      return;

    log.info("Outbox: reintentando {} mensajes", batch.size());

    for (var msg : batch) {
      try {
        var node = (com.fasterxml.jackson.databind.JsonNode) mapper.readTree(msg.getPayloadJson());

        var req = new ProgressClient.AttemptRequest(
            java.util.UUID.fromString(node.path("studentId").asText()),
            node.path("source").asText("ASSESSMENT"),
            // curriculumId puede venir null -> manejarlo:
            node.hasNonNull("curriculumId") ? java.util.UUID.fromString(node.path("curriculumId").asText()) : null,
            java.util.UUID.fromString(node.path("exerciseId").asText()),
            node.path("correct").isMissingNode() ? null : node.path("correct").asBoolean(),
            node.hasNonNull("score") ? new java.math.BigDecimal(node.path("score").asText()) : null,
            node.hasNonNull("points") ? node.path("points").asInt() : null,
            java.util.UUID.fromString(node.path("objectiveId").asText()),
            // metadata como ObjectNode:
            mapper.convertValue(node.path("metadata"), com.fasterxml.jackson.databind.node.ObjectNode.class));

        progressClient.postAttempt(req);

        msg.setStatus(com.tesis.assessment_service.model.enums.OutboxStatus.SENT);
        msg.setLastError(null);

      } catch (Exception ex) {
        msg.setStatus(com.tesis.assessment_service.model.enums.OutboxStatus.FAILED);
        msg.setLastError(ex.getMessage());
        log.warn("Outbox: fallo al reenviar id={} error={}", msg.getId(), ex.toString());
      }

      try {
        Thread.sleep(backoffMs);
      } catch (InterruptedException ignored) {
      }
    }

  }
}
