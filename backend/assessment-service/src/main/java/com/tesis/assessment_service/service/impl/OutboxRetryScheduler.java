package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.model.AssessmentProgressOutbox;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.repository.AssessmentProgressOutboxRepository;
import com.tesis.assessment_service.service.client.ProgressClient;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Reintentos periódicos del outbox hacia progress-service.
 * Usa JsonNode desde la entidad (sin parseo de String).
 */
@Component
@Profile("!test")
@RequiredArgsConstructor
public class OutboxRetryScheduler {

  private static final Logger log = LoggerFactory.getLogger(OutboxRetryScheduler.class);

  private final AssessmentProgressOutboxRepository outboxRepo;
  private final ProgressClient progressClient;

  @Value("${assessment.outbox.enabled:true}")
  private boolean enabled;

  @Value("${assessment.outbox.batch-size:50}")
  private int batchSize;

  @Value("${assessment.outbox.backoff-ms:2000}")
  private long backoffMs;

  /** Ejecuta cada N ms (configurable). */
  @Scheduled(fixedDelayString = "${assessment.outbox.retry.fixed-delay-ms:60000}")
  @Transactional
  public void retryOutbox() {
    if (!enabled)
      return;

    List<AssessmentProgressOutbox> batch = outboxRepo.findTopNPendingOrFailed(batchSize);
    if (batch.isEmpty())
      return;

    log.info("Outbox: reintentando {} mensajes", batch.size());

    for (var msg : batch) {
      try {
        ObjectNode node = (ObjectNode) msg.getPayloadJson(); // JSONB

        var req = new ProgressClient.AttemptRequest(
            UUID.fromString(node.path("studentId").asText()),
            node.path("source").asText("ASSESSMENT"),
            node.hasNonNull("curriculumId") ? UUID.fromString(node.path("curriculumId").asText()) : null,
            UUID.fromString(node.path("exerciseId").asText()),
            node.path("correct").isMissingNode() || node.get("correct").isNull() ? null
                : node.get("correct").asBoolean(),
            node.hasNonNull("score") ? node.path("score").decimalValue() : null,
            node.hasNonNull("points") ? node.path("points").asInt() : null,
            node.hasNonNull("objectiveId") ? UUID.fromString(node.path("objectiveId").asText()) : null,
            (ObjectNode) node.path("metadata"));

        progressClient.postAttempt(req);

        msg.setStatus(OutboxStatus.SENT);
        msg.setLastError(null);

      } catch (Exception ex) {
        msg.setStatus(OutboxStatus.FAILED);
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
