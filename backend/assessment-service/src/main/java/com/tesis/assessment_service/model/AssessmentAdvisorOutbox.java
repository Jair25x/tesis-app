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

  @Column(name = "payload_json", columnDefinition = "jsonb", nullable = false)
  private String payloadJson;

  @Column(name = "last_error")
  private String lastError;
}
