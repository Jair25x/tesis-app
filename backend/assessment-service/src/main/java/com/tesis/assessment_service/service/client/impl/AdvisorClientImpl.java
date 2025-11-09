package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import com.tesis.assessment_service.service.client.AdvisorClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Component
public class AdvisorClientImpl implements AdvisorClient {

  private final WebClient advisorWebClient;
  private final ObjectMapper mapper;

  public AdvisorClientImpl(@Qualifier("advisorWebClient") WebClient advisorWebClient,
      ObjectMapper mapper) {
    this.advisorWebClient = advisorWebClient;
    this.mapper = mapper;
  }

  @Override
  public void commitDiagnostic(UUID studentId, String phase, OffsetDateTime ws, OffsetDateTime we, boolean force) {
    ObjectNode body = mapper.createObjectNode();
    body.put("studentId", studentId.toString());
    body.put("phase", phase);
    if (ws != null)
      body.put("windowStart", ws.toString());
    if (we != null)
      body.put("windowEnd", we.toString());
    body.put("force", force);

    advisorWebClient.post()
        .uri("/internal/diagnostic/commit")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .toBodilessEntity()
        .block();
  }

  @Override
  public void postAssessmentGraded(ObjectNode event) {
    // Caso: ya viene como "attempt" suelto
    if (event.hasNonNull("submissionItemId")) {
      ObjectNode attempt = event.deepCopy();
      ObjectNode meta = attempt.with("metadata");
      if (!meta.hasNonNull("submissionItemId")) {
        meta.put("submissionItemId", attempt.path("submissionItemId").asText());
      }
      ensureAnsweredAt(attempt, event);
      sendAttempt(attempt);
      return;
    }

    // Envelope: payload con itemResults[]
    JsonNode payload = event.path("payload");
    if (payload.isMissingNode())
      return;

    final String studentId = payload.path("studentId").asText(null);
    final String curriculumId = payload.path("curriculumId").asText(null);
    final String assignmentId = payload.path("assignmentId").asText(null);

    JsonNode itemsNode = payload.get("itemResults");
    if (studentId == null || itemsNode == null || !itemsNode.isArray())
      return;

    ArrayNode items = (ArrayNode) itemsNode;

    for (JsonNode it : items) {
      ObjectNode attempt = mapper.createObjectNode();

      attempt.put("studentId", studentId);
      attempt.put("source", "ASSESSMENT");
      if (curriculumId != null)
        attempt.put("curriculumId", curriculumId);

      // objectiveId requerido por nuestro backend (si falta, el router hará fallback
      // a curriculumId)
      String obj = it.path("objectiveId").asText(null);
      if (obj != null && !obj.isBlank()) {
        attempt.put("objectiveId", obj);
      }

      // answeredAt: usa el del item; si no hay, usa occurredAt del evento; si no,
      // now(UTC)
      String answeredAt = it.path("answeredAt").asText(null);
      if (answeredAt == null || answeredAt.isBlank()) {
        String occurredAt = event.path("occurredAt").asText(null);
        if (occurredAt == null || occurredAt.isBlank()) {
          occurredAt = OffsetDateTime.now(ZoneOffset.UTC).toString();
        }
        answeredAt = occurredAt;
      }
      attempt.put("answeredAt", answeredAt);

      // opcionales
      if (it.hasNonNull("exerciseId"))
        attempt.put("exerciseId", it.get("exerciseId").asText());
      if (it.has("correct"))
        attempt.put("correct", it.path("correct").asBoolean());
      if (it.has("score")) {
        double score = it.path("score").asDouble(Double.NaN);
        if (Double.isFinite(score))
          attempt.put("score", score);
      }
      if (it.hasNonNull("difficulty"))
        attempt.put("difficulty", it.get("difficulty").asText());

      // metadata: submissionItemId obligatorio para idempotencia
      ObjectNode meta = mapper.createObjectNode();
      String sid = it.path("submissionItemId").asText(null);
      if (sid == null || sid.isBlank()) {
        // Fallback determinístico para mensajes viejos del outbox
        String exerciseId = it.path("exerciseId").asText("");
        String objectiveId = it.path("objectiveId").asText("");
        sid = deterministicId(assignmentId, studentId, exerciseId, objectiveId).toString();
      }
      meta.put("submissionItemId", sid);
      if (assignmentId != null)
        meta.put("assignmentId", assignmentId);
      if (it.hasNonNull("gradingMode"))
        meta.put("gradingMode", it.get("gradingMode").asText());
      attempt.set("metadata", meta);

      sendAttempt(attempt);
    }
  }

  private void ensureAnsweredAt(ObjectNode attempt, ObjectNode event) {
    String answeredAt = attempt.path("answeredAt").asText(null);
    if (answeredAt == null || answeredAt.isBlank()) {
      String occurredAt = event.path("occurredAt").asText(null);
      if (occurredAt == null || occurredAt.isBlank()) {
        occurredAt = OffsetDateTime.now(ZoneOffset.UTC).toString();
      }
      attempt.put("answeredAt", occurredAt);
    }
  }

  private static UUID deterministicId(String assignmentId, String studentId, String exerciseId, String objectiveId) {
    String key = String.join("|",
        assignmentId == null ? "" : assignmentId,
        studentId == null ? "" : studentId,
        exerciseId == null ? "" : exerciseId,
        objectiveId == null ? "" : objectiveId);
    return UUID.nameUUIDFromBytes(("advisor-sid:" + key).getBytes(StandardCharsets.UTF_8));
  }

  private void sendAttempt(ObjectNode attempt) {
    advisorWebClient.post()
        .uri("/internal/ingest/assessments/graded")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(attempt)
        .retrieve()
        .toBodilessEntity()
        .block();
  }
}
