// src/main/java/com/tesis/progress_service/client/AdvisorClient.java
package com.tesis.progress_service.client;

import java.util.UUID;

public interface AdvisorClient {
  void invalidateRecommendations(UUID studentId);
}
