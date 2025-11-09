// src/main/java/com/tesis/progress_service/client/impl/AdvisorClientImpl.java
package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.AdvisorClient;
import com.tesis.progress_service.security.S2SJwtSigner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdvisorClientImpl implements AdvisorClient {

  private final @Qualifier("advisorWebClient") WebClient advisorWebClient;
  private final S2SJwtSigner s2s;

  @Override
  public void invalidateRecommendations(UUID studentId) {
    if (studentId == null)
      return;
    try {
      String token = s2s.buildInternalToken(); // debe incluir role INTERNAL
      advisorWebClient.post()
          .uri(uriBuilder -> uriBuilder
              .path("/api/ai/internal/recommendations/invalidate")
              .queryParam("studentId", studentId.toString())
              .build())
          .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
          .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
          .retrieve()
          .toBodilessEntity()
          .block(Duration.ofSeconds(3)); // bloqueante breve y seguro
    } catch (Exception e) {
      // fail-open: si no invalida, el TTL natural hará su trabajo.
      log.warn("advisor.invalidateRecommendations failed for {}: {}", studentId, e.toString());
    }
  }
}
