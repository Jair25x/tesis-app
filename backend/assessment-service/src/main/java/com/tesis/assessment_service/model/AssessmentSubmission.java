package com.tesis.assessment_service.model;

import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_submission", uniqueConstraints = {
    @UniqueConstraint(name = "uk_submission_assignment_student_attempt", columnNames = { "assignment_id", "student_id",
        "attempt_no" })
}, indexes = {
    @Index(name = "idx_submission_assignment", columnList = "assignment_id"),
    @Index(name = "idx_submission_student", columnList = "student_id"),
    @Index(name = "idx_submission_status", columnList = "status")
})
public class AssessmentSubmission extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "assignment_id", nullable = false, foreignKey = @ForeignKey(name = "fk_submission_assignment"))
  private AssessmentAssignment assignment;

  @Column(name = "student_id", nullable = false)
  private UUID studentId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 16)
  private SubmissionStatus status;

  @Column(name = "started_at")
  private OffsetDateTime startedAt;

  @Column(name = "submitted_at")
  private OffsetDateTime submittedAt;

  @Column(name = "graded_at")
  private OffsetDateTime gradedAt;

  @Column(name = "score", precision = 8, scale = 2)
  private BigDecimal score;

  @Column(name = "max_score", precision = 8, scale = 2)
  private BigDecimal maxScore;

  @Column(name = "duration_sec")
  private Integer durationSec;

  @Column(name = "attempt_no", nullable = false)
  private Integer attemptNo;

  @Column(name = "elapsed_sec")
  private Integer elapsedSec;

  @Column(name = "lock_token", length = 64)
  private String lockToken;

  @PrePersist
  void defaultValues() {
    if (attemptNo == null || attemptNo < 1)
      attemptNo = 1;
    if (status == null)
      status = SubmissionStatus.NOT_STARTED;
  }
}
