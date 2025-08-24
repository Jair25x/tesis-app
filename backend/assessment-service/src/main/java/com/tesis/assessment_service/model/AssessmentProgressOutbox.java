package com.tesis.assessment_service.model;

import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.OutboxStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

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

  /**
   * Referencia al item del submission para trazabilidad (no FK para aislar el
   * outbox).
   */
  @Column(name = "submission_item_id", nullable = false)
  private UUID submissionItemId;

  /** Carga útil que se enviará a progress/ai-advisor. */
  @Column(name = "payload_json", nullable = false, columnDefinition = "jsonb")
  private String payloadJson;

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
