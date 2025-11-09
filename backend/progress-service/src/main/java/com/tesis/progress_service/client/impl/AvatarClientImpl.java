package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.AvatarClient;
import com.tesis.progress_service.dto.AvatarClaimRequest;
import com.tesis.progress_service.exception.ExternalServiceException;
import com.tesis.progress_service.http.S2SHeaders;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class AvatarClientImpl implements AvatarClient {

  private final @Qualifier("lbWebClientBuilder") WebClient.Builder webClientBuilder;
  private final S2SHeaders s2sHeaders;

  @Value("${clients.avatar.base-url:lb://avatar-service}") // usa discovery
  private String baseUrl;

  @Override
  @CircuitBreaker(name = "avatarClient", fallbackMethod = "claimFallback")
  @Retry(name = "avatarClient")
  public void claimReward(AvatarClaimRequest req) {
    webClientBuilder.build()
        .post()
        .uri(baseUrl + "/internal/avatar/rewards/claim")
        .contentType(MediaType.APPLICATION_JSON)
        .headers(h -> {
          // marca S2S + actor=progress-service
          s2sHeaders.enrich(h);
          h.add("X-Service-Actor", "progress-service");
        })
        .bodyValue(req)
        .retrieve()
        .onStatus(HttpStatusCode::isError, resp -> resp.bodyToMono(String.class)
            .defaultIfEmpty("Error al reclamar recompensa en avatar-service")
            .flatMap(msg -> Mono.error(new ResponseStatusException(resp.statusCode(), msg))))
        .toBodilessEntity()
        .block();
  }

  @SuppressWarnings("unused")
  private void claimFallback(AvatarClaimRequest req, Throwable t) {
    log.error("Fallback al llamar avatar /internal/avatar/rewards/claim. req={}, error={}", req, t.toString());
    throw new ExternalServiceException("No se pudo reclamar la recompensa en avatar-service", t);
  }
}
