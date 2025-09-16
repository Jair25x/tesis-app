package com.tesis.assessment_service.service.scheduler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.model.AssessmentSubmission;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import com.tesis.assessment_service.repository.AssessmentAdvisorOutboxRepository;
import com.tesis.assessment_service.repository.AssessmentSubmissionRepository;
import com.tesis.assessment_service.service.client.AdvisorClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Reintentos periódicos del outbox hacia el Advisor.
 * - Envía cada payload (evento).
 * - Marca SENT/FAILED.
 * - Detecta submissions que ya no tienen PENDING/FAILED y, si son
 * DIAGNOSTIC+GRADED,
 * dispara el commit del diagnóstico (fase desde template.configJson.phase o
 * "INITIAL").
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdvisorOutboxRetryScheduler {

  private final AssessmentAdvisorOutboxRepository repo;
  private final AssessmentSubmissionRepository submissionRepo;
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

    // Acumular los submissions que tocamos en este ciclo
    Set<UUID> touchedSubmissionIds = new HashSet<>();

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

      if (msg.getSubmissionId() != null) {
        touchedSubmissionIds.add(msg.getSubmissionId());
      }

      try {
        Thread.sleep(backoffMs);
      } catch (InterruptedException ignored) {
      }
    }

    repo.saveAll(batch);

    // === Post-procesamiento: para cada submission que tocamos,
    // si ya no quedan PENDING/FAILED -> commit diagnóstico si aplica.
    if (!touchedSubmissionIds.isEmpty()) {
      var statuses = List.of(OutboxStatus.PENDING, OutboxStatus.FAILED);
      for (UUID submissionId : touchedSubmissionIds) {
        boolean stillPending = repo.existsBySubmissionIdAndStatusIn(submissionId, statuses);
        if (stillPending)
          continue;

        // Ya no hay mensajes pendientes para este submission -> revisar si es
        // DIAGNOSTIC+GRADED
        Optional<AssessmentSubmission> opt = submissionRepo.findById(submissionId);
        if (opt.isEmpty())
          continue;

        AssessmentSubmission s = opt.get();
        if (s.getStatus() != SubmissionStatus.GRADED)
          continue;
        if (s.getAssignment() == null || s.getAssignment().getType() == null)
          continue;

        String assignmentType = s.getAssignment().getType().name();
        if (!"DIAGNOSTIC".equalsIgnoreCase(assignmentType))
          continue;

        // Fase: preferir template.configJson.phase si existe, si no: "INITIAL"
        String phase = "INITIAL";
        try {
          var tpl = s.getAssignment().getTemplate();
          if (tpl != null && tpl.getConfigJson() != null) {
            JsonNode cfg = tpl.getConfigJson();
            JsonNode phaseNode = cfg.get("phase");
            if (phaseNode != null && phaseNode.isTextual()) {
              String raw = phaseNode.asText("").trim().toUpperCase(Locale.ROOT);
              if (Set.of("INITIAL", "MID", "FINAL").contains(raw)) {
                phase = raw;
              }
            }
          }
        } catch (Exception ignore) {
        }

        OffsetDateTime ws = s.getStartedAt();
        OffsetDateTime we = (s.getSubmittedAt() != null) ? s.getSubmittedAt() : s.getGradedAt();

        try {
          advisorClient.commitDiagnostic(s.getStudentId(), phase, ws, we, false);
          log.info("AdvisorOutbox: commit diagnóstico OK submission={} student={} phase={}",
              s.getId(), s.getStudentId(), phase);
        } catch (Exception ex) {
          // Si falla el commit, ¡no afecta la entrega! Se reintentará en el próximo ciclo
          log.warn("AdvisorOutbox: commit diagnóstico FALLÓ submission={} error={}", s.getId(), ex.toString());
        }
      }
    }
  }
}
