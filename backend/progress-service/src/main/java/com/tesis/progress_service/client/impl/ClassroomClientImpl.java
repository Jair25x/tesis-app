package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.ClassroomClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;


import java.util.*;


@Component
@RequiredArgsConstructor
public class ClassroomClientImpl implements ClassroomClient {

  private final @Qualifier("classroomWebClient") WebClient classroomWebClient;

  @Override
  public List<UUID> listMemberIds(UUID classroomId) {
    UUID[] ids = classroomWebClient.get()
        .uri("/internal/classrooms/{id}/students/ids", classroomId)
        // si quieres marcar también como llamada interna:
        // .headers(S2SHeaders::enrich)
        .retrieve()
        .onStatus(
            status -> status.is4xxClientError(),
            resp -> resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> reactor.core.publisher.Mono.error(
                    new org.springframework.web.server.ResponseStatusException(
                        resp.statusCode(), "students ids 4xx: " + body))))
        .onStatus(
            status -> status.is5xxServerError(),
            resp -> resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> reactor.core.publisher.Mono.error(
                    new org.springframework.web.server.ResponseStatusException(
                        resp.statusCode(), "students ids 5xx: " + body))))
        .bodyToMono(UUID[].class)
        .block();

    return (ids == null) ? java.util.List.of() : java.util.Arrays.asList(ids);
  }
}
