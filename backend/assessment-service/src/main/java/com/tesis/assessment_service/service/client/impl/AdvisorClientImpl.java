package com.tesis.assessment_service.service.client.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.assessment_service.service.client.AdvisorClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class AdvisorClientImpl implements AdvisorClient {

  private final WebClient advisorWebClient;

  public AdvisorClientImpl(@Qualifier("advisorWebClient") WebClient advisorWebClient) {
    this.advisorWebClient = advisorWebClient;
  }

  @Override
  public void postAssessmentGraded(ObjectNode event) {
    advisorWebClient.post()
        .uri("/internal/ingest/assessments/graded")
        .bodyValue(event)
        .retrieve()
        .toBodilessEntity()
        .block();
  }
}
