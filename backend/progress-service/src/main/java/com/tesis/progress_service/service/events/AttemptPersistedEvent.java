package com.tesis.progress_service.service.events;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/** Evento de dominio para invalidar recomendaciones después del commit. */
public class AttemptPersistedEvent extends ApplicationEvent {

  private final UUID studentId;

  public AttemptPersistedEvent(Object source, UUID studentId) {
    super(source);
    this.studentId = studentId;
  }

  public UUID getStudentId() {
    return studentId;
  }
}
