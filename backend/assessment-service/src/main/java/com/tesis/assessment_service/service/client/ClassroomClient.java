package com.tesis.assessment_service.service.client;

import java.util.List;
import java.util.UUID;

/** Contrato hacia classroom-service. */
public interface ClassroomClient {

  /** Verifica si un usuario es miembro (student/teacher) del classroom. */
  boolean isMember(UUID classroomId, UUID userId);

  /** Devuelve los IDs de estudiantes del classroom (para overview y filtros). */
  List<UUID> getStudentIds(UUID classroomId);

  /** NUEVO: aulas (IDs) del principal para prefiltrar paginado. */
  List<UUID> listMyClassrooms(UUID userId);
}
