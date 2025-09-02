// src/main/java/com/tesis/classroom_service/repository/projection/ClassroomIdNameView.java
package com.tesis.classroom_service.repository.projection;

import java.util.UUID;

public interface ClassroomIdNameView {
  UUID getId();

  String getName(); // Asegúrate que la entidad Classroom tenga 'name'. Si fuera 'title', renómbralo
                    // aquí y en el query.
}
