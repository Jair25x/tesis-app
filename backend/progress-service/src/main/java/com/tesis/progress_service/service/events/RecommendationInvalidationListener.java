package com.tesis.progress_service.service.events;

import com.tesis.progress_service.client.AdvisorClient;
import com.tesis.progress_service.observability.AttemptMetricsRecorder;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Ejecuta la invalidación DESPUÉS del commit.
 * Mide latencia y registra resultado (success/error). Fail-open.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationInvalidationListener {

  private final AdvisorClient advisorClient;
  private final AttemptMetricsRecorder metrics;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onAttemptPersisted(AttemptPersistedEvent event) {
    Timer.Sample sample = metrics.startInvalidationTimer();
    try {
      advisorClient.invalidateRecommendations(event.getStudentId());
      metrics.stopInvalidationTimer(sample, "success");
    } catch (Exception ex) {
      log.warn("Reco invalidation failed (studentId={}): {}", event.getStudentId(), ex.getMessage());
      metrics.stopInvalidationTimer(sample, "error");
      // fail-open (no exception thrown)
    }
  }
}
