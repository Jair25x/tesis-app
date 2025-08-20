// classroom-service: src/main/java/com/tesis/classroom_service/client/ProfileClient.java
package com.tesis.classroom_service.client;

import java.util.List;
import java.util.UUID;

public interface ProfileClient {
  record PublicProfile(UUID id, String displayName, String avatarUrl) {
  }

  List<PublicProfile> fetchProfiles(List<UUID> ids);
}
