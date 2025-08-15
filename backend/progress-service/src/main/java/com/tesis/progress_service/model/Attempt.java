package com.tesis.progress_service.model;

import com.tesis.progress_service.model.base.AuditableEntity;
import com.tesis.progress_service.model.enums.AttemptSource;

import jakarta.persistence.*;

import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "attempts", indexes = {
    @Index(name = "idx_attempt_student_created", columnList = "student_id, created_at"),
    @Index(name = "idx_attempt_student_lo", columnList = "student_id, learning_objective_id"),
    @Index(name = "idx_attempt_student_exercise", columnList = "student_id, exercise_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class Attempt extends AuditableEntity {

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

  @Column(name = "exercise_id", nullable = false, columnDefinition = "UUID")
  private UUID exerciseId;

  /** Copia de metadatos del ejercicio (para analítica rápida) */
  @Column(name = "template_type", length = 50)
  private String templateType;

  @Column(name = "difficulty", length = 20)
  private String difficulty;

  @Enumerated(EnumType.STRING)
  @Column(name = "source", length = 20, nullable = false)
  @Builder.Default
  private AttemptSource source = AttemptSource.PRACTICE;

  @Column(name = "session_id", length = 64)
  private String sessionId;

  /** Lo que envió el frontend */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "answer_payload", columnDefinition = "jsonb")
  private Map<String, Object> answerPayload;

  /** Respuesta de curriculum:/check */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "check_result", columnDefinition = "jsonb")
  private Map<String, Object> checkResult;

  /** Denormalización para queries rápidas */
  @Column(name = "correct", nullable = false)
  @Builder.Default
  private boolean correct = false;

  @Column(name = "score", precision = 4, scale = 3)
  private BigDecimal score; // 0.000..1.000

  @Column(name = "hints_used")
  @Builder.Default
  private Integer hintsUsed = 0;

  @Column(name = "duration_ms")
  private Integer durationMs;

  @Column(name = "source_ref_id", columnDefinition = "UUID")
  private UUID sourceRefId; // p.ej. assessmentId
}
