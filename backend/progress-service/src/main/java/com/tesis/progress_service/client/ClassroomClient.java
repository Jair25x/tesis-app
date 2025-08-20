// progress-service: src/main/java/com/tesis/progress_service/client/ClassroomClient.java
package com.tesis.progress_service.client;

import java.util.List;
import java.util.UUID;

public interface ClassroomClient {
  List<UUID> listMemberIds(UUID classroomId);

  default boolean isMember(UUID classroomId, UUID studentId) {
    return listMemberIds(classroomId).contains(studentId);
  }
}
