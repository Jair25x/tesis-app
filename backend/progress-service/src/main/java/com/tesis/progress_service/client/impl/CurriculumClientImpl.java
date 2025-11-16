package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.dto.CheckResultDto;
import com.tesis.progress_service.dto.ExerciseMetaDto;
import com.tesis.progress_service.exception.ExternalServiceException;
import com.tesis.progress_service.http.S2SHeaders;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class CurriculumClientImpl implements CurriculumClient {

  private final @Qualifier("lbWebClientBuilder") WebClient.Builder webClientBuilder;
  private final S2SHeaders s2sHeaders; // << INYECTADO

  @Value("${clients.curriculum.base-url:http://curriculum-service}")
  private String curriculumBase;

  // ====== MAPPING RESPUESTA /internal/curricula/exercises/{id}/meta ======

  private record ExerciseMetaResponse(
      UUID exerciseId,
      UUID learningObjectiveId,
      UUID standardId,
      UUID competencyId,
      UUID curriculumId,
      String difficulty,
      Boolean active,
      Boolean diagnostic) {
  }

  @Override
  @CircuitBreaker(name = "curriculumClient", fallbackMethod = "metaFallback")
  @Retry(name = "curriculumClient")
  public ExerciseMetaDto getExerciseMeta(UUID exerciseId) {
    try {
      ExerciseMetaResponse resp = webClientBuilder.build()
          .get()
          .uri(curriculumBase + "/internal/curricula/exercises/{exerciseId}/meta", exerciseId)
          .headers(s2sHeaders::enrich) // añade X-Internal-Call, Authorization S2S, etc.
          .retrieve()
          .onStatus(HttpStatusCode::is4xxClientError, r -> r.bodyToMono(String.class)
              .defaultIfEmpty("Solicitud inválida hacia curriculum-service (exercise meta)")
              .flatMap(msg -> Mono.error(new ResponseStatusException(r.statusCode(), msg))))
          .bodyToMono(ExerciseMetaResponse.class)
          .block();

      if (resp == null) {
        throw new ExternalServiceException(
            "Respuesta vacía desde curriculum-service /internal/curricula/exercises/" + exerciseId + "/meta");
      }

      return ExerciseMetaDto.builder()
          .exerciseId(resp.exerciseId())
          .learningObjectiveId(resp.learningObjectiveId())
          .standardId(resp.standardId())
          .competencyId(resp.competencyId())
          .curriculumId(resp.curriculumId())
          .difficulty(resp.difficulty())
          .active(resp.active())
          .diagnostic(resp.diagnostic())
          .build();

    } catch (WebClientResponseException wce) {
      if (wce.getStatusCode().is4xxClientError()) {
        // Para 4xx devuelves como error de cliente (datos inconsistentes desde FE)
        throw new ResponseStatusException(wce.getStatusCode(), wce.getResponseBodyAsString());
      }
      log.error("Error llamando a curriculum /meta id={}: {}", exerciseId, wce.getMessage());
      throw wce;
    } catch (Exception e) {
      log.error("Error llamando a curriculum /meta id={}: {}", exerciseId, e.toString());
      throw e;
    }
  }

  @SuppressWarnings("unused")
  private ExerciseMetaDto metaFallback(UUID exerciseId, Throwable t) {
    log.error("Fallback curriculum /meta exerciseId={} por excepción:\n", exerciseId, t);
    throw new ExternalServiceException(
        "No se pudo obtener metadatos del ejercicio " + exerciseId + " desde curriculum-service", t);
  }

  // ====== /api/curricula/exercises/{id}/check ======

  @Override
  @CircuitBreaker(name = "curriculumClient", fallbackMethod = "checkAnswerFallback")
  @Retry(name = "curriculumClient")
  public CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload) {
    var body = Map.of("answer", payload == null ? Map.of() : payload);

    try {
      CheckResultDto response = webClientBuilder.build()
          .post()
          .uri(curriculumBase + "/api/curricula/exercises/{exerciseId}/check", exerciseId)
          .headers(s2sHeaders::enrich) // << USA EL BEAN
          .bodyValue(body)
          .retrieve()
          .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
              .defaultIfEmpty("Solicitud inválida hacia curriculum-service")
              .flatMap(msg -> Mono.error(new ResponseStatusException(resp.statusCode(), msg))))
          .bodyToMono(CheckAnswerResponseLite.class)
          .map(this::toCheckResultDto)
          .block();

      if (response == null) {
        throw new ExternalServiceException("Respuesta vacía desde curriculum-service /check");
      }
      return response;

    } catch (WebClientResponseException wce) {
      if (wce.getStatusCode().is4xxClientError()) {
        throw new ResponseStatusException(wce.getStatusCode(), wce.getResponseBodyAsString());
      }
      log.error("Error llamando a curriculum /check id={}: {}", exerciseId, wce.getMessage());
      throw wce;
    } catch (Exception e) {
      log.error("Error llamando a curriculum /check id={}: {}", exerciseId, e.toString());
      throw e;
    }
  }

  private CheckResultDto checkAnswerFallback(UUID exerciseId, Map<String, Object> payload, Throwable t) {
    log.error("Fallback curriculum /check exerciseId={} por excepción:\n", exerciseId, t);
    throw new ExternalServiceException(
        "No se pudo evaluar el ejercicio " + exerciseId + " en curriculum-service", t);
  }

  // Debe reflejar los campos de CheckAnswerResponse
  private record CheckAnswerResponseLite(
      boolean correct,
      Double score,
      Map<String, Boolean> questionResults,
      String feedback,
      UUID curriculumId,
      UUID learningObjectiveId,
      String difficulty,
      Double maxScore) {
  }

  private CheckResultDto toCheckResultDto(CheckAnswerResponseLite src) {
    Map<String, Object> fb = null;
    if (src.feedback() != null || src.questionResults() != null) {
      fb = new LinkedHashMap<>();
      if (src.feedback() != null) {
        fb.put("text", src.feedback());
      }
      if (src.questionResults() != null) {
        fb.put("questionResults", src.questionResults());
      }
    }

    return CheckResultDto.builder()
        .correct(src.correct())
        .score(src.score() == null ? null : BigDecimal.valueOf(src.score()))
        .feedback(fb)
        .curriculumId(src.curriculumId())
        .learningObjectiveId(src.learningObjectiveId())
        .difficulty(src.difficulty())
        .maxScore(src.maxScore() == null ? null : BigDecimal.valueOf(src.maxScore()))
        .questionResults(src.questionResults())
        .build();
  }

  // ===== NUEVO: batch conteo de ejercicios por OA =====
  private record ExerciseCountsRequest(Collection<UUID> ids, Boolean active) {
  }

  private record ExerciseCountsResponse(Map<String, Integer> counts) {
  }

  @Override
  @CircuitBreaker(name = "curriculumClient", fallbackMethod = "countsFallback")
  @Retry(name = "curriculumClient")
  public Map<UUID, Integer> getExerciseCountsForObjectives(Collection<UUID> objectiveIds, boolean active) {
    if (objectiveIds == null || objectiveIds.isEmpty())
      return Collections.emptyMap();

    ExerciseCountsRequest body = new ExerciseCountsRequest(objectiveIds, active);

    try {
      ExerciseCountsResponse resp = webClientBuilder.build()
          .post()
          .uri(curriculumBase + "/internal/objectives/exercise-counts")
          .headers(s2sHeaders::enrich)
          .bodyValue(body)
          .retrieve()
          .onStatus(HttpStatusCode::is4xxClientError, r -> r.bodyToMono(String.class)
              .defaultIfEmpty("Solicitud inválida hacia curriculum-service (exercise-counts)")
              .flatMap(msg -> Mono.error(new ResponseStatusException(r.statusCode(), msg))))
          .bodyToMono(ExerciseCountsResponse.class)
          .block();

      if (resp == null || resp.counts() == null)
        return Collections.emptyMap();

      return resp.counts().entrySet().stream().collect(Collectors.toMap(
          e -> UUID.fromString(e.getKey()),
          Map.Entry::getValue));

    } catch (WebClientResponseException wce) {
      if (wce.getStatusCode().is4xxClientError()) {
        log.warn("Curriculum /internal/objectives/exercise-counts 4xx: {}", wce.getMessage());
        return Collections.emptyMap();
      }
      log.error("Error 5xx al llamar exercise-counts: {}", wce.getMessage());
      throw wce;
    } catch (Exception e) {
      log.error("Error llamando exercise-counts: {}", e.toString());
      throw e;
    }
  }

  @SuppressWarnings("unused")
  private Map<UUID, Integer> countsFallback(Collection<UUID> ids, boolean active, Throwable t) {
    log.error("Fallback curriculum exercise-counts por excepción: {}", t.toString());
    return Collections.emptyMap();
  }
}
