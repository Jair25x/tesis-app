package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.exception.ExternalServiceException;
import com.tesis.assessment_service.service.client.CurriculumClient;
import com.tesis.assessment_service.service.client.impl.dto.CurriculumExerciseLite;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CurriculumClientImpl implements CurriculumClient {

  private final WebClient webClient;

  public CurriculumClientImpl(@Qualifier("curriculumWebClient") WebClient webClient) {
    this.webClient = webClient;
  }

  /** Payload esperado por curriculum: { "answer": ... } */
  public record CheckRequest(JsonNode answer) {
  }

  public record CheckResponse(boolean correct, JsonNode feedback, String objectiveId, Integer points) {
  }

  @Override
  @CircuitBreaker(name = "curriculumClient")
  @Retry(name = "curriculumClient")
  public CheckResult checkExercise(UUID exerciseId, JsonNode answerPayload) {
    try {
      JsonNode safeAnswer = (answerPayload == null)
          ? new com.fasterxml.jackson.databind.ObjectMapper().createObjectNode()
          : answerPayload;

      CheckResponse resp = webClient.post()
          .uri(uriBuilder -> uriBuilder
              .path("/internal/curricula/exercises/{exerciseId}/check")
              .build(exerciseId))
          .contentType(MediaType.APPLICATION_JSON)
          .accept(MediaType.APPLICATION_JSON)
          .bodyValue(new CheckRequest(safeAnswer))
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
          log.warn("objectiveId no es UUID: {}", resp.objectiveId());
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

  @Override
  @CircuitBreaker(name = "curriculumClient")
  @Retry(name = "curriculumClient")
  public Map<UUID, String> getExerciseDifficulties(List<UUID> exerciseIds) {
    if (exerciseIds == null || exerciseIds.isEmpty())
      return Map.of();

    try {
      List<UUID> ids = exerciseIds.stream().filter(Objects::nonNull).distinct().toList();
      final int CHUNK = 100;
      Map<UUID, String> out = new HashMap<>();

      for (int i = 0; i < ids.size(); i += CHUNK) {
        List<UUID> part = ids.subList(i, Math.min(i + CHUNK, ids.size()));
        String qp = part.stream().map(UUID::toString).collect(Collectors.joining(","));

        List<CurriculumExerciseLite> resp = webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/internal/curricula/exercises/lookup")
                .queryParam("ids", qp)
                .build())
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<CurriculumExerciseLite>>() {
            })
            .block();

        if (resp != null) {
          for (CurriculumExerciseLite e : resp) {
            if (e.id() != null && e.difficulty() != null) {
              out.put(e.id(), e.difficulty()); // BASIC|INTERMEDIATE|ADVANCED
            }
          }
        }
      }
      return out;

    } catch (ResponseStatusException ex) {
      throw new ExternalServiceException("curriculum",
          ex.getStatusCode().value(),
          "Error al obtener dificultades: " + ex.getReason(), ex);
    } catch (ExternalServiceException e) {
      throw e;
    } catch (Exception e) {
      throw new ExternalServiceException("curriculum", 500,
          "Fallo inesperado en getExerciseDifficulties", e);
    }
  }
}
