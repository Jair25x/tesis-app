package com.tesis.progress_service.model;

import com.tesis.progress_service.model.base.AuditableEntity;
import com.tesis.progress_service.model.enums.MasteryLevel;
import com.tesis.progress_service.model.enums.ProgressStatus;

import jakarta.persistence.*;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_objective_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uk_sop_student_lo", columnNames = { "student_id", "learning_objective_id" })
}, indexes = {
    @Index(name = "idx_sop_student_curriculum", columnList = "student_id, curriculum_id"),
    @Index(name = "idx_sop_student_status", columnList = "student_id, status"),
    @Index(name = "idx_sop_student_mastery", columnList = "student_id, mastery_level")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class StudentObjectiveProgress extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
  private UUID studentId;

  @Column(name = "curriculum_id", nullable = false, columnDefinition = "UUID")
  private UUID curriculumId;

  @Column(name = "learning_objective_id", nullable = false, columnDefinition = "UUID")
  private UUID learningObjectiveId;

  @Column(name = "attempts_count", nullable = false)
  @Builder.Default
  private Integer attemptsCount = 0;

  @Column(name = "correct_count", nullable = false)
  @Builder.Default
  private Integer correctCount = 0;

  @Column(name = "streak_correct", nullable = false)
  @Builder.Default
  private Integer streakCorrect = 0;

  @Column(name = "accuracy", precision = 4, scale = 3)
  private BigDecimal accuracy; // 0..1

  @Enumerated(EnumType.STRING)
  @Column(name = "status", length = 20, nullable = false)
  @Builder.Default
  private ProgressStatus status = ProgressStatus.NOT_STARTED;

  @Enumerated(EnumType.STRING)
  @Column(name = "mastery_level", length = 20, nullable = false)
  @Builder.Default
  private MasteryLevel masteryLevel = MasteryLevel.PRACTICING;

  @Column(name = "last_attempt_at")
  private LocalDateTime lastAttemptAt;
}
