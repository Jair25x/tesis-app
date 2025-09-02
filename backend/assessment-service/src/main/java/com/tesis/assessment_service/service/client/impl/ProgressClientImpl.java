package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.exception.ExternalServiceException;
import com.tesis.assessment_service.service.client.ProgressClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
public class ProgressClientImpl implements ProgressClient {

  private final WebClient webClient;
  private final ObjectMapper mapper;

  public ProgressClientImpl(@Qualifier("progressWebClient") WebClient webClient,
      ObjectMapper mapper) {
    this.webClient = webClient;
    this.mapper = mapper;
  }

  @Override
  @CircuitBreaker(name = "progressClient")
  @Retry(name = "progressClient")
  public void postAttempt(AttemptRequest req) {
    try {
      ObjectNode body = mapper.createObjectNode();
      body.put("studentId", req.studentId().toString());
      body.put("source", req.source());
      body.put("curriculumId", req.curriculumId().toString());
      body.put("exerciseId", req.exerciseId().toString());
      if (req.correct() != null)
        body.put("correct", req.correct());
      if (req.score() != null)
        body.put("score", req.score());
      if (req.points() != null)
        body.put("points", req.points());
      if (req.objectiveId() != null)
        body.put("objectiveId", req.objectiveId().toString());
      if (req.metadata() != null)
        body.set("metadata", req.metadata());

      webClient.post()
          .uri("/internal/progress/attempts") // <— RUTA INTERNA
          .contentType(MediaType.APPLICATION_JSON)
          .accept(MediaType.APPLICATION_JSON)
          .bodyValue(body)
          .retrieve()
          .toBodilessEntity()
          .block();

    } catch (ResponseStatusException ex) {
      throw new ExternalServiceException("progress",
          ex.getStatusCode().value(),
          "Error registrando intento en progress: " + ex.getReason(), ex);
    } catch (ExternalServiceException e) {
      throw e;
    } catch (Exception e) {
      throw new ExternalServiceException("progress", 500,
          "Fallo inesperado registrando intento en progress", e);
    }
  }
}
