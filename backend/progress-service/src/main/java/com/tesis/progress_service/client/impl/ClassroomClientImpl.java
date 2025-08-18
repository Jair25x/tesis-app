// progress-service: src/main/java/com/tesis/progress_service/client/impl/ClassroomClientImpl.java
package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.ClassroomClient;
import com.tesis.progress_service.exception.ExternalServiceException;
import com.tesis.progress_service.http.S2SHeaders;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ClassroomClientImpl implements ClassroomClient {

  private final @Qualifier("webClientBuilder") WebClient.Builder webClientBuilder;

  @Value("${clients.classroom.base-url:http://classroom-service:8084}")
  private String baseUrl;

  @Override
  public List<UUID> listMemberIds(UUID classroomId) {
    try {
      // Esperamos MemberDto { userUuid, role, joinedAt } y nos quedamos con userUuid
      var list = webClientBuilder.build()
          .get()
          .uri(baseUrl + "/api/classrooms/{id}/members", classroomId)
          .headers(S2SHeaders::enrich)
          .retrieve()
          .onStatus(HttpStatusCode::is4xxClientError, resp -> resp.bodyToMono(String.class)
              .defaultIfEmpty("Solicitud inválida hacia classroom-service")
              .flatMap(msg -> Mono.error(new ResponseStatusException(resp.statusCode(), msg))))
          .bodyToFlux(Map.class) // cada item es un Map con keys = campos del MemberDto
          .map(m -> UUID.fromString(String.valueOf(m.get("userUuid"))))
          .collectList()
          .block();

      return (list != null) ? list : List.of();

    } catch (ResponseStatusException rse) {
      // 4xx => propagar como está
      throw rse;
    } catch (Exception ex) {
      // timeouts/5xx/etc.
      throw new ExternalServiceException("No se pudo consultar miembros del classroom " + classroomId, ex);
    }
  }
}
