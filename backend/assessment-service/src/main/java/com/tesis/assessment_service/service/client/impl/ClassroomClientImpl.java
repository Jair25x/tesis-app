package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.assessment_service.exception.ExternalServiceException;
import com.tesis.assessment_service.service.client.ClassroomClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ClassroomClientImpl implements ClassroomClient {

  private static final String SERVICE_NAME = "classroom-service";

  private final WebClient webClient;
  private final ObjectMapper mapper;

  public ClassroomClientImpl(@Qualifier("classroomWebClient") WebClient webClient,
      ObjectMapper mapper) {
    this.webClient = webClient;
    this.mapper = mapper;
  }

  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "isMemberFallback")
  @Retry(name = "classroomClient")
  public boolean isMember(UUID classroomId, UUID userId) {
    HttpStatusCode status = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/internal/classrooms/{cid}/members/{uid}/exists")
            .build(classroomId, userId))
        .accept(MediaType.APPLICATION_JSON)
        .exchangeToMono(resp -> Mono.just(resp.statusCode()))
        .block();

    if (status == null) {
      log.warn("classroomClient.isMember: respuesta sin status (null) cid={}, uid={}", classroomId, userId);
      return false;
    }

    int code = status.value();
    if (code >= 200 && code < 300) {
      return true;
    } else if (code == 404) {
      return false;
    } else if (code == 403) {
      log.warn("classroomClient.isMember: 403 Forbidden verificando membresía. cid={}, uid={}", classroomId, userId);
      return false;
    } else {
      log.warn("classroomClient.isMember: status inesperado {}. cid={}, uid={}", code, classroomId, userId);
      return false;
    }
  }

  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "getStudentIdsFallback")
  @Retry(name = "classroomClient")
  public List<UUID> getStudentIds(UUID classroomId) {
    List<String> ids = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/internal/classrooms/{cid}/students/ids")
            .build(classroomId))
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToFlux(String.class)
        .collectList()
        .block();

    if (ids == null)
      return List.of();

    List<UUID> out = new ArrayList<>(ids.size());
    for (String s : ids) {
      try {
        out.add(UUID.fromString(s));
      } catch (Exception ignore) {
      }
    }
    return out;
  }

  // NUEVO: lista de aulas del principal (IDs)
  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "listMyClassroomsFallback")
  @Retry(name = "classroomClient")
  public List<UUID> listMyClassrooms(UUID userId) {
    // S2S: el WebClient ya inyecta X-Internal-Call, x-user-id y X-Auth-Roles
    List<String> ids = webClient.get()
        .uri(uriBuilder -> uriBuilder.path("/internal/classrooms/mine").build())
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToFlux(String.class)
        .collectList()
        .block(Duration.ofSeconds(2));

    if (ids == null)
      return List.of();

    List<UUID> out = new ArrayList<>(ids.size());
    for (String s : ids) {
      try {
        out.add(UUID.fromString(s));
      } catch (Exception ignore) {
      }
    }
    return out;
  }

  // =========================
  // FALLBACKS
  // =========================

  public boolean isMemberFallback(UUID classroomId, UUID userId, Throwable ex) {
    log.warn("classroomClient.isMember fallback (classroomId={}, userId={}) causa={}",
        classroomId, userId, ex.toString());
    throw new ExternalServiceException(
        SERVICE_NAME, 0, "No se pudo verificar membresía de aula en " + SERVICE_NAME, ex);
  }

  public List<UUID> getStudentIdsFallback(UUID classroomId, Throwable ex) {
    log.warn("classroomClient.getStudentIds fallback (classroomId={}) causa={}", classroomId, ex.toString());
    throw new ExternalServiceException(
        SERVICE_NAME, 0, "No se pudo obtener estudiantes del aula desde " + SERVICE_NAME, ex);
  }

  public List<UUID> listMyClassroomsFallback(UUID userId, Throwable ex) {
    log.warn("classroomClient.listMyClassrooms fallback (userId={}) causa={}", userId, ex.toString());
    // Para “mis asignaciones” preferimos resiliencia suave: si classroom cae,
    // todavía mostramos PUBLIC.
    return List.of();
  }
}
