// src/main/java/com/tesis/progress_service/client/impl/CurriculumClientImpl.java
package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.dto.CheckResultDto;
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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CurriculumClientImpl implements CurriculumClient {

  private final @Qualifier("lbWebClientBuilder") WebClient.Builder webClientBuilder;

  @Value("${clients.curriculum.base-url:http://curriculum-service}")
  private String curriculumBase;

  @Override
  @CircuitBreaker(name = "curriculumClient", fallbackMethod = "checkAnswerFallback")
  @Retry(name = "curriculumClient")
  public CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload) {
    // El controller de curriculum espera { "answer": <obj> }
    var body = Map.of("answer", payload == null ? Map.of() : payload);

    try {
      var response = webClientBuilder.build()
          .post()
          .uri(curriculumBase + "/api/curricula/exercises/{exerciseId}/check", exerciseId)
          .headers(S2SHeaders::enrich) // 🔐 S2S headers (UUID + roles)
          .bodyValue(body)
          .retrieve()
          // 4xx: propagamos como ResponseStatusException para que NO dispare fallback si
          // lo ignoramos en CB
          .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
              .defaultIfEmpty("Solicitud inválida hacia curriculum-service")
              .flatMap(msg -> Mono.error(new ResponseStatusException(resp.statusCode(), msg))))
          // 2xx: leemos el JSON de curriculum y lo adaptamos a nuestro DTO
          .bodyToMono(CheckAnswerResponseLite.class)
          .map(this::toCheckResultDto)
          .block();

      if (response == null) {
        throw new ExternalServiceException("Respuesta vacía desde curriculum-service /check");
      }

      return response;

    } catch (WebClientResponseException wce) {
      // Respeta 4xx, deja 5xx levantar fallback
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

  // Fallback SOLO para timeouts/5xx/circuito abierto
  private CheckResultDto checkAnswerFallback(UUID exerciseId, Map<String, Object> payload, Throwable t) {
    log.error("Fallback curriculum /check exerciseId={} por excepción:\n", exerciseId, t);
    throw new ExternalServiceException(
        "No se pudo evaluar el ejercicio " + exerciseId + " en curriculum-service", t);
  }

  // DTO local minimalista que calza con CheckAnswerResponse de curriculum-service
  private record CheckAnswerResponseLite(boolean correct, Double score, String feedback) {
  }

  private CheckResultDto toCheckResultDto(CheckAnswerResponseLite src) {
    return CheckResultDto.builder()
        .correct(src.correct())
        .score(src.score() == null ? null : BigDecimal.valueOf(src.score()))
        .feedback(src.feedback() == null ? null : Map.of("text", src.feedback()))
        .build();
  }
}
