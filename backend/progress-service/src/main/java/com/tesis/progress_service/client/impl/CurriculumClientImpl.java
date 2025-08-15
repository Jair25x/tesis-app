package com.tesis.progress_service.client.impl;

import com.tesis.progress_service.client.CurriculumClient;
import com.tesis.progress_service.dto.CheckResultDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CurriculumClientImpl implements CurriculumClient {

  /** 👇 Inyecta el builder con LoadBalancer */
  private final @Qualifier("lbWebClientBuilder") WebClient.Builder webClientBuilder;

  @Value("${clients.curriculum.base-url:lb://curriculum-service}")
  private String curriculumBase;

  @Override
  public CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload) {
    var body = (payload == null) ? Map.of("answer", Map.of()) : Map.of("answer", payload);
    return webClientBuilder.build()
        .post()
        .uri(curriculumBase + "/api/curricula/exercises/{id}/check", exerciseId)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(CheckResultDto.class)
        .block();
  }
}
