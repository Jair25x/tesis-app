package com.tesis.progress_service.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

@Component
public class AttemptMetricsRecorder {

  private final MeterRegistry registry;

  public AttemptMetricsRecorder(MeterRegistry registry) {
    this.registry = registry;
  }

  // --------- Counters ---------
  public void recordAttempt(String templateType, String difficulty, boolean correct, boolean fromReco) {
    final String t = nz(templateType);
    final String d = nz(difficulty);
    final String c = correct ? "true" : "false";

    Counter.builder("progress_attempts_total")
        .tags("template", t, "difficulty", d, "correct", c)
        .register(registry)
        .increment();

    if (fromReco) {
      Counter.builder("progress_attempts_from_reco_total")
          .tags("template", t, "difficulty", d, "correct", c)
          .register(registry)
          .increment();
    }
  }

  // --------- Timer / Histogram (latencia del flujo de intento) ---------
  public Timer.Sample startAttemptTimer() {
    return Timer.start(registry);
  }

  public void stopAttemptTimer(Timer.Sample sample, String templateType, String difficulty, Boolean correct) {
    final String t = nz(templateType);
    final String d = nz(difficulty);
    final String c = (correct != null && correct) ? "true" : "false";

    // Nombre estable; habilitamos histograma aquí (dev) y si quieres,
    // en prod puedes manejarlo por properties para reducir cardinalidad.
    Timer timer = Timer.builder("progress_attempt_duration_seconds")
        .tags(Tags.of("template", t, "difficulty", d, "correct", c))
        .publishPercentileHistogram(true)
        .register(registry);

    sample.stop(timer);
  }

  private static String nz(String v) {
    return (v == null || v.isBlank()) ? "unknown" : v;
  }
}
