package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.exception.ExternalServiceException;
import com.tesis.assessment_service.service.client.CurriculumClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Slf4j
@Service
public class CurriculumClientImpl implements CurriculumClient {

  private final WebClient webClient;

  public CurriculumClientImpl(@Qualifier("curriculumWebClient") WebClient webClient) {
    this.webClient = webClient;
  }

  public record CheckResponse(boolean correct, JsonNode feedback, String objectiveId, Integer points) {
  }

  @Override
  @CircuitBreaker(name = "curriculumClient")
  @Retry(name = "curriculumClient")
  public CheckResult checkExercise(UUID exerciseId, JsonNode answerPayload) {
    try {
      CheckResponse resp = webClient.post()
          .uri(uriBuilder -> uriBuilder
              .path("/api/curricula/exercises/{exerciseId}/check")
              .queryParam("mode", "exam")
              .build(exerciseId))
          .contentType(MediaType.APPLICATION_JSON)
          .accept(MediaType.APPLICATION_JSON)
          .bodyValue(answerPayload == null ? "{}" : answerPayload)
          .retrieve()
          .bodyToMono(CheckResponse.class)
          .block();

      if (resp == null) {
        throw new ExternalServiceException("curriculum", 502, "Respuesta vacía de autocorrección");
      }

      UUID objective = null;
      if (resp.objectiveId() != null) {
        try {
          objective = UUID.fromString(resp.objectiveId());
        } catch (Exception ignore) {
        }
      }
      return new CheckResult(resp.correct(), resp.feedback(), objective, resp.points());

    } catch (ResponseStatusException ex) {
      throw new ExternalServiceException("curriculum",
          ex.getStatusCode().value(),
          "Error al autocorregir ejercicio: " + ex.getReason(), ex);
    } catch (ExternalServiceException e) {
      throw e;
    } catch (Exception e) {
      throw new ExternalServiceException("curriculum", 500,
          "Fallo inesperado al autocorregir ejercicio", e);
    }
  }
}
