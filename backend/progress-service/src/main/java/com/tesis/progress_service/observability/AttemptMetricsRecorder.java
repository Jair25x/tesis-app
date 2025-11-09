package com.tesis.progress_service.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AttemptMetricsRecorder {

  private final MeterRegistry registry;

  public AttemptMetricsRecorder(MeterRegistry registry) {
    this.registry = registry;
  }

  // =========================
  // 1) Counters de intentos
  // =========================
  public void recordAttempt(String templateType, String difficulty, boolean correct, boolean fromReco) {
    final String t = nz(templateType);
    final String d = nz(difficulty);
    final String c = correct ? "true" : "false";

    Counter.builder("progress_attempts_total")
        .description("Total de intentos")
        .tags("template", t, "difficulty", d, "correct", c)
        .register(registry)
        .increment();

    if (fromReco) {
      Counter.builder("progress_attempts_from_reco_total")
          .description("Intentos provenientes del recomendador")
          .tags("template", t, "difficulty", d, "correct", c)
          .register(registry)
          .increment();
    }
  }

  // ===========================================
  // 2) Timer/histograma de duración de intento
  // ===========================================
  public Timer.Sample startAttemptTimer() {
    return Timer.start(registry);
  }

  public void stopAttemptTimer(Timer.Sample sample, String templateType, String difficulty, Boolean correct) {
    final String t = nz(templateType);
    final String d = nz(difficulty);
    final String c = (correct != null && correct) ? "true" : "false";

    // Timer con histograma y SLAs razonables para FE (<3s típicamente)
    Timer timer = Timer.builder("progress_attempt_duration_seconds")
        .description("Latencia end-to-end al registrar un intento")
        .tags(Tags.of("template", t, "difficulty", d, "correct", c))
        .publishPercentileHistogram(true) // <-- habilita histograma (buckets)
        .minimumExpectedValue(Duration.ofMillis(5)) // ruido de nanos
        .maximumExpectedValue(Duration.ofSeconds(10)) // tope sano
        .serviceLevelObjectives( // SLAs útiles para alertas
            Duration.ofMillis(50),
            Duration.ofMillis(100),
            Duration.ofMillis(200),
            Duration.ofMillis(500),
            Duration.ofSeconds(1),
            Duration.ofSeconds(2),
            Duration.ofSeconds(3))
        .register(registry);

    sample.stop(timer);
  }

  // ===================================================
  // 3) Métrica de invalidación (inmediata tras intento)
  // ===================================================
  public Timer.Sample startInvalidationTimer() {
    return Timer.start(registry);
  }

  public void stopInvalidationTimer(Timer.Sample sample, String result) {
    final String r = ("success".equalsIgnoreCase(result) ? "success" : "error");

    // counter de resultados
    Counter.builder("progress_reco_invalidation_total")
        .description("Invalidaciones del caché/estado del recomendador")
        .tags("result", r)
        .register(registry)
        .increment();

    // timer de latencia de invalidación
    Timer timer = Timer.builder("progress_reco_invalidation_seconds")
        .description("Latencia de invalidación hacia ai-advisor-service")
        .tags(Tags.of("result", r))
        .publishPercentileHistogram(true)
        .minimumExpectedValue(Duration.ofMillis(1))
        .maximumExpectedValue(Duration.ofSeconds(5))
        .serviceLevelObjectives(
            Duration.ofMillis(10),
            Duration.ofMillis(20),
            Duration.ofMillis(50),
            Duration.ofMillis(100),
            Duration.ofMillis(200),
            Duration.ofMillis(500),
            Duration.ofSeconds(1))
        .register(registry);

    sample.stop(timer);
  }

  // =================
  // util
  // =================
  private static String nz(String v) {
    return (v == null || v.isBlank()) ? "unknown" : v;
  }
}
