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
 * Outbox para el AI Advisor. Igual patrón: JSONB real.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_advisor_outbox", indexes = {
    @Index(name = "idx_advisor_outbox_status", columnList = "status"),
    @Index(name = "idx_advisor_outbox_submission", columnList = "submission_id")
})
public class AssessmentAdvisorOutbox extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @Column(name = "submission_id", nullable = false)
  private UUID submissionId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 16)
  private OutboxStatus status;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "payload_json", columnDefinition = "jsonb", nullable = false)
  private JsonNode payloadJson;

  @Column(name = "last_error")
  private String lastError;

  @PrePersist
  void defaultStatus() {
    if (status == null)
      status = OutboxStatus.PENDING;
  }
}
