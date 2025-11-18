// src/main/java/com/tesis/progress_service/client/impl/AdvisorClientImpl.java
package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.AdvisorClient;
import com.tesis.progress_service.security.S2SJwtSigner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
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
    if (studentId == null) {
      return;
    }

    try {
      // 🔐 Token S2S (por compatibilidad / logs, aunque no lo necesitemos para el
      // happy-path)
      String token = s2s.buildInternalToken(); // debería incluir ROLE_INTERNAL

      advisorWebClient.post()
          .uri(uriBuilder -> uriBuilder
              .path("/api/ai/internal/recommendations/invalidate")
              .queryParam("studentId", studentId.toString())
              .build())
          .headers(headers -> {
            // ✅ Camino interno preferido en AI Advisor (no depende de la firma del token)
            headers.add("X-Internal-Call", "progress-service");
            headers.add("X-Auth-Username", "progress-service");
            headers.add("X-Auth-Roles", "ROLE_INTERNAL,INTERNAL");

            // ✅ Bearer S2S opcional (para compatibilidad futura / auditoría)
            if (token != null && !token.isBlank()) {
              headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            }
            // ❌ No seteamos Content-Type: no hay body JSON, y así evitamos warnings
            // non_utf8_json_client
          })
          .retrieve()
          .toBodilessEntity()
          .block(Duration.ofSeconds(3)); // bloqueante breve y seguro

      log.debug("advisor.invalidateRecommendations OK studentId={}", studentId);
    } catch (Exception e) {
      // fail-open: si no invalida, el TTL natural hará su trabajo.
      log.warn("advisor.invalidateRecommendations failed for {}: {}", studentId, e.toString());
    }
  }
}
