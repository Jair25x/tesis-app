// classroom-service: src/main/java/com/tesis/classroom_service/client/impl/ProfileClientImpl.java
package com.tesis.classroom_service.client.impl;

import com.tesis.classroom_service.client.ProfileClient;
import com.tesis.classroom_service.http.S2SHeaders;
import com.tesis.classroom_service.security.S2STokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProfileClientImpl implements ProfileClient {

  private final WebClient.Builder webClientBuilder;
  private final S2STokenProvider s2s;

  @Value("${clients.auth.base-url:http://auth-service:8081}")
  private String authBase;

  @Override
  public List<PublicProfile> fetchProfiles(List<UUID> ids) {
    return fetchProfilesInternal(ids);
  }

  private List<PublicProfile> fetchProfilesInternal(Collection<UUID> ids) {
    if (ids == null || ids.isEmpty())
      return List.of();

    // Admite "ids=a,b,c" (tu controller ya lo soporta)
    String joined = ids.stream().map(UUID::toString).collect(Collectors.joining(","));
    String token = s2s.buildToken(); // Debe emitir typ=S2S + svc=classroom-service con el mismo secret que auth

    URI uri = org.springframework.web.util.UriComponentsBuilder
        .fromUriString(authBase) // p.ej. http://auth-service:8081
        .path("/api/auth/profiles")
        .queryParam("ids", joined) // también soporta ids=a&ids=b
        .build(true)
        .toUri();

    try {
      var list = webClientBuilder.build()
          .get()
          .uri(uri)
          .headers(S2SHeaders::enrich) // opcional: marca interna para trazas
          .header("Authorization", "Bearer " + token)
          .retrieve()
          .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
              .defaultIfEmpty("")
              .flatMap(body -> Mono.error(new ResponseStatusException(resp.statusCode(),
                  "profiles 4xx: " + body))))
          .onStatus(HttpStatusCode::is5xxServerError, resp -> resp.bodyToMono(String.class)
              .defaultIfEmpty("")
              .flatMap(body -> Mono.error(new ResponseStatusException(resp.statusCode(),
                  "profiles 5xx: " + body))))
          .bodyToFlux(PublicProfile.class)
          .collectList()
          .block();

      return (list != null) ? list : List.of();

    } catch (ResponseStatusException rse) {
      throw rse; // deja que el caller decida degradar
    } catch (Exception ex) {
      // DNS/timeout/conexión: conviértelo en 503 semántico
      throw new ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
          "auth-service unreachable", ex);
    }
  }
}
