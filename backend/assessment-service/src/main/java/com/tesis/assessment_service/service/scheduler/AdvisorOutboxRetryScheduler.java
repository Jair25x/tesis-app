package com.tesis.assessment_service.service.scheduler;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.repository.AssessmentAdvisorOutboxRepository;
import com.tesis.assessment_service.service.client.AdvisorClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Reintentos periódicos del outbox hacia el Advisor.
 * Usa JsonNode desde la entidad (sin parseo String).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdvisorOutboxRetryScheduler {

  private final AssessmentAdvisorOutboxRepository repo;
  private final AdvisorClient advisorClient;

  @Value("${assessment.advisor-outbox.enabled:true}")
  private boolean enabled;
  @Value("${assessment.advisor-outbox.batch-size:50}")
  private int batchSize;
  @Value("${assessment.advisor-outbox.backoff-ms:2000}")
  private long backoffMs;

  @Scheduled(fixedDelayString = "${assessment.advisor-outbox.retry.fixed-delay-ms:60000}")
  public void retry() {
    if (!enabled)
      return;

    var batch = repo.findTopNPendingOrFailed(batchSize);
    if (batch.isEmpty())
      return;

    log.info("AdvisorOutbox: procesando {} mensajes…", batch.size());
    for (var msg : batch) {
      try {
        ObjectNode event = (ObjectNode) msg.getPayloadJson(); // JSONB
        advisorClient.postAssessmentGraded(event);
        msg.setStatus(OutboxStatus.SENT);
        msg.setLastError(null);
      } catch (Exception ex) {
        msg.setStatus(OutboxStatus.FAILED);
        msg.setLastError(ex.getMessage());
        log.warn("AdvisorOutbox: fallo al reenviar id={} error={}", msg.getId(), ex.toString());
      }
      try {
        Thread.sleep(backoffMs);
      } catch (InterruptedException ignored) {
      }
    }
    repo.saveAll(batch);
  }
}
