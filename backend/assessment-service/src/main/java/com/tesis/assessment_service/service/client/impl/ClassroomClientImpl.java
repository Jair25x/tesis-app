package com.tesis.assessment_service.service.client.impl;

import com.github.benmanes.caffeine.cache.Cache;
import com.tesis.assessment_service.exception.ExternalServiceException;
import com.tesis.assessment_service.service.client.ClassroomClient;
import com.tesis.assessment_service.service.client.impl.dto.ClassroomBasicDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ClassroomClientImpl implements ClassroomClient {

  private static final String SERVICE_NAME = "classroom-service";

  private final WebClient webClient;
  private final Cache<UUID, String> nameCache;

  public ClassroomClientImpl(@Qualifier("classroomWebClient") WebClient webClient,
      @Qualifier("classroomNameCache") Cache<UUID, String> nameCache) {
    this.webClient = webClient;
    this.nameCache = nameCache;
  }

  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "isMemberFallback")
  @Retry(name = "classroomClient")
  public boolean isMember(UUID classroomId, UUID userId) {
    Integer status = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/internal/classrooms/{cid}/members/{uid}/exists")
            .build(classroomId, userId))
        .accept(MediaType.APPLICATION_JSON)
        .exchangeToMono(resp -> reactor.core.publisher.Mono.just(resp.statusCode().value()))
        .block(Duration.ofSeconds(3));

    if (status == null)
      return false;
    if (status >= 200 && status < 300)
      return true;
    if (status == 404 || status == 403)
      return false;
    return false;
  }

  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "getStudentIdsFallback")
  @Retry(name = "classroomClient")
  public List<UUID> getStudentIds(UUID classroomId) {
    List<UUID> ids = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/internal/classrooms/{cid}/students/ids")
            .build(classroomId))
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<List<UUID>>() {
        })
        .block(Duration.ofSeconds(3));
    return (ids == null) ? List.of() : ids;
  }

  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "listMyClassroomsFallback")
  @Retry(name = "classroomClient")
  public List<UUID> listMyClassrooms(UUID userId) {
    List<UUID> ids = webClient.get()
        .uri("/internal/classrooms/mine")
        .accept(MediaType.APPLICATION_JSON)
        .header("X-Act-As-User", userId.toString())
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<List<UUID>>() {
        })
        .block(Duration.ofSeconds(3));
    return (ids == null) ? List.of() : ids;
  }

  // =======================
  // lookup nombres (GET->POST fallback) + cache
  // =======================
  @Override
  @CircuitBreaker(name = "classroomClient", fallbackMethod = "lookupNamesFallback")
  @Retry(name = "classroomClient")
  public Map<UUID, String> lookupNames(List<UUID> classroomIds) {
    if (classroomIds == null || classroomIds.isEmpty())
      return Map.of();

    List<UUID> dedup = classroomIds.stream().filter(Objects::nonNull).distinct().toList();

    // 1) cache
    Map<UUID, String> cached = nameCache.getAllPresent(dedup);

    // 2) por traer
    List<UUID> toFetch = dedup.stream().filter(id -> !cached.containsKey(id)).toList();
    Map<UUID, String> fetched = Map.of();

    if (!toFetch.isEmpty()) {
      // a) intentar GET con ids
      try {
        List<ClassroomBasicDto> list = webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/internal/classrooms/lookup")
                .queryParam("ids", toFetch) // ids=...&ids=...
                .build())
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<ClassroomBasicDto>>() {
            })
            .block(Duration.ofSeconds(4));

        if (list != null && !list.isEmpty()) {
          fetched = list.stream().collect(Collectors.toMap(ClassroomBasicDto::id, ClassroomBasicDto::name));
        }
      } catch (Exception ex) {
        // b) fallback POST si GET falla (404/405/400/timeout)
        List<ClassroomBasicDto> list = webClient.post()
            .uri("/internal/classrooms/lookup")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON)
            .bodyValue(toFetch)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<ClassroomBasicDto>>() {
            })
            .block(Duration.ofSeconds(4));

        if (list != null && !list.isEmpty()) {
          fetched = list.stream().collect(Collectors.toMap(ClassroomBasicDto::id, ClassroomBasicDto::name));
        }
      }

      // cachear
      fetched.forEach(nameCache::put);
    }

    // 3) merge respetando orden
    Map<UUID, String> result = new LinkedHashMap<>();
    for (UUID id : dedup) {
      String n = cached.get(id);
      if (n == null)
        n = fetched.get(id);
      if (n != null)
        result.put(id, n);
    }

    // 4) log diagnóstico si hay id sin nombre
    for (UUID id : dedup) {
      if (!result.containsKey(id)) {
        log.warn("Classroom name missing for id={} (lookup returned empty).", id);
      }
    }

    return result;
  }

  // ---- fallbacks ----
  public boolean isMemberFallback(UUID classroomId, UUID userId, Throwable ex) {
    throw new ExternalServiceException(SERVICE_NAME, 0, "No se pudo verificar membresía de aula", ex);
  }

  public List<UUID> getStudentIdsFallback(UUID classroomId, Throwable ex) {
    throw new ExternalServiceException(SERVICE_NAME, 0, "No se pudo obtener estudiantes del aula", ex);
  }

  public List<UUID> listMyClassroomsFallback(UUID userId, Throwable ex) {
    return List.of(); // resiliencia suave
  }

  public Map<UUID, String> lookupNamesFallback(List<UUID> classroomIds, Throwable ex) {
    if (classroomIds == null || classroomIds.isEmpty())
      return Map.of();
    Map<UUID, String> cached = nameCache.getAllPresent(classroomIds);
    if (cached == null || cached.isEmpty())
      return Map.of();
    Map<UUID, String> ordered = new LinkedHashMap<>();
    classroomIds.stream().filter(Objects::nonNull).distinct().forEach(id -> {
      String n = cached.get(id);
      if (n != null)
        ordered.put(id, n);
    });
    return ordered;
  }
}
