package com.tesis.assessment_service.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

/**
 * Outbox para enviar intentos al progress-service (y/o otros consumidores).
 * payload_json es JSONB real -> usamos JsonNode + @JdbcTypeCode(SqlTypes.JSON)
 * para que Hibernate haga el bind correcto a Postgres.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_progress_outbox", indexes = {
    @Index(name = "idx_outbox_status", columnList = "status"),
    @Index(name = "idx_outbox_submission_item", columnList = "submission_item_id")
})
public class AssessmentProgressOutbox extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  /** Referencia para trazabilidad (no FK para aislar el outbox). */
  @Column(name = "submission_item_id", nullable = false)
  private UUID submissionItemId;

  /** Carga útil JSONB que se publicará. */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
  private JsonNode payloadJson;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 16)
  private OutboxStatus status;

  @Column(name = "last_error", columnDefinition = "text")
  private String lastError;

  @PrePersist
  void defaultStatus() {
    if (status == null)
      status = OutboxStatus.PENDING;
  }
}
