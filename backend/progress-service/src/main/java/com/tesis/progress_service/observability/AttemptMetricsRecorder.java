package com.tesis.progress_service.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class AttemptMetricsRecorder {

  private final MeterRegistry registry;

  public AttemptMetricsRecorder(MeterRegistry registry) {
    this.registry = registry;
  }

  public void recordAttempt(String templateType, String difficulty, boolean correct, boolean fromReco) {
    final String t = (templateType == null || templateType.isBlank()) ? "unknown" : templateType;
    final String d = (difficulty == null || difficulty.isBlank()) ? "unknown" : difficulty;
    final String c = correct ? "true" : "false";

    Counter.builder("progress_attempts_total")
        .tag("template", t)
        .tag("difficulty", d)
        .tag("correct", c)
        .register(registry)
        .increment();

    if (fromReco) {
      Counter.builder("progress_attempts_from_reco_total")
          .tag("template", t)
          .tag("difficulty", d)
          .tag("correct", c)
          .register(registry)
          .increment();
    }
  }
}
