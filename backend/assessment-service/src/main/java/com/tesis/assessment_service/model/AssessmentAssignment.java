package com.tesis.assessment_service.model;

import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_assignment", indexes = {
    @Index(name = "idx_assign_template", columnList = "template_id"),
    @Index(name = "idx_assign_scope", columnList = "scope"),
    @Index(name = "idx_assign_classroom", columnList = "classroom_id"),
    @Index(name = "idx_assign_state_window", columnList = "state, window_start, window_end")
})
public class AssessmentAssignment extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "template_id", nullable = false, foreignKey = @ForeignKey(name = "fk_assignment_template"))
  private AssessmentTemplate template;

  @Enumerated(EnumType.STRING)
  @Column(name = "scope", nullable = false, length = 16)
  private AssignmentScope scope;

  @Enumerated(EnumType.STRING)
  @Column(name = "type", nullable = false, length = 16)
  private AssignmentType type;

  /** Solo si scope=CLASSROOM. */
  @Column(name = "classroom_id")
  private UUID classroomId;

  @Enumerated(EnumType.STRING)
  @Column(name = "state", nullable = false, length = 16)
  private AssignmentState state;

  @Column(name = "window_start")
  private OffsetDateTime windowStart;

  @Column(name = "window_end")
  private OffsetDateTime windowEnd;

  @Column(name = "time_limit_sec")
  private Integer timeLimitSec;

  @Column(name = "attempts_allowed", nullable = false)
  private Integer attemptsAllowed;

  /** Usuario que creó la asignación (UUID de dominio, distinto al @CreatedBy). */
  @Column(name = "created_by_user_id", nullable = false)
  private UUID createdByUserId;

  /**
   * Validación de dominio simple (no JSR-380): si scope=CLASSROOM, classroomId no
   * debe ser null.
   */
  @PrePersist
  @PreUpdate
  void validateScope() {
    if (scope == AssignmentScope.CLASSROOM && classroomId == null) {
      throw new IllegalStateException("classroomId es obligatorio cuando scope=CLASSROOM");
    }
    if (attemptsAllowed == null || attemptsAllowed < 1) {
      attemptsAllowed = 1;
    }
    if (type == null)
      type = AssignmentType.FORMATIVE;
    if (state == null)
      state = AssignmentState.DRAFT;
  }
}
