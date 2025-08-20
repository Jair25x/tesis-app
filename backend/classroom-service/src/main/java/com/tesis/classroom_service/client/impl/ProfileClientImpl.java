//src/main/java/com/tesis/classroom_service/client/impl/ProfileClientImpl.java
package com.tesis.classroom_service.client.impl;

import com.tesis.classroom_service.client.ProfileClient;
import com.tesis.classroom_service.security.S2STokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProfileClientImpl implements ProfileClient {

  private final @Qualifier("lbWebClientBuilder") WebClient.Builder webClientBuilder;
  private final S2STokenProvider s2s;

  @Value("${clients.auth.base-url:http://auth-service:8081}")
  private String authBase;

  @Override
  public List<PublicProfile> fetchProfiles(List<UUID> ids) {
    if (ids == null || ids.isEmpty())
      return List.of();

    String token = s2s.buildToken();

    return webClientBuilder.build()
        .get()
        .uri(uriBuilder -> {
          var b = uriBuilder
              .scheme("http")
              .host(extractHost(authBase)) // "auth-service"
              .port(extractPort(authBase)) // 8081
              .path("/api/auth/profiles");
          ids.forEach(id -> b.queryParam("ids", id.toString()));
          return b.build();
        })
        .accept(MediaType.APPLICATION_JSON)
        .header("Authorization", "Bearer " + token)
        .retrieve()
        .bodyToFlux(PublicProfile.class)
        .collectList()
        .block();
  }

  // Helpers muy simples (si prefieres, usa
  // UriComponentsBuilder.fromUriString(authBase))
  private String extractHost(String base) {
    // espera http://host:port; fallback: host
    try {
      var u = new java.net.URI(base);
      return u.getHost() != null ? u.getHost() : base;
    } catch (Exception e) {
      return base;
    }
  }

  private int extractPort(String base) {
    try {
      var u = new java.net.URI(base);
      return u.getPort() > 0 ? u.getPort() : 80;
    } catch (Exception e) {
      return 80;
    }
  }
}
