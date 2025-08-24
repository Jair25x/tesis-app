package com.tesis.assessment_service.model.enums;

/** Estado del mensaje en el outbox (integraciones confiables). */
public enum OutboxStatus {
  PENDING, SENT, FAILED
}
