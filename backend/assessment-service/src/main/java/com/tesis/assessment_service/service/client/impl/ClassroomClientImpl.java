package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.assessment_service.service.client.ClassroomClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ClassroomClientImpl implements ClassroomClient {

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
    String raw = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/internal/classrooms/{cid}/members/{uid}/exists")
            .build(classroomId, userId))
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(String.class)
        .block();

    if (raw == null)
      return false;
    raw = raw.trim();
    if ("true".equalsIgnoreCase(raw))
      return true;
    if ("false".equalsIgnoreCase(raw))
      return false;
    try {
      JsonNode node = mapper.readTree(raw);
      if (node.has("exists"))
        return node.get("exists").asBoolean(false);
    } catch (Exception ignore) {
    }
    return false;
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

  // fallbacks
  public boolean isMemberFallback(UUID classroomId, UUID userId, Throwable ex) {
    log.warn("classroomClient.isMember fallback (classroomId={}, userId={}) causa={}",
        classroomId, userId, ex.toString());
    return false;
  }

  public List<UUID> getStudentIdsFallback(UUID classroomId, Throwable ex) {
    log.warn("classroomClient.getStudentIds fallback (classroomId={}) causa={}",
        classroomId, ex.toString());
    return List.of();
  }
}
