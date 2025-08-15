// src/main/java/com/tesis/progress_service/client/CurriculumClient.java
package com.tesis.progress_service.client;

import com.tesis.progress_service.dto.CheckResultDto;

import java.util.Map;
import java.util.UUID;

public interface CurriculumClient {
  CheckResultDto checkAnswer(UUID exerciseId, Map<String, Object> payload);
}
