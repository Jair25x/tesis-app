package com.tesis.assessment_service.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.GradingMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_submission_item", indexes = {
    @Index(name = "idx_sitem_submission_position", columnList = "submission_id, position"),
    @Index(name = "idx_sitem_submission_exercise", columnList = "submission_id, exercise_id"),
    @Index(name = "idx_sitem_submission_objective", columnList = "submission_id, objective_id")
})
public class AssessmentSubmissionItem extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "submission_id", nullable = false, foreignKey = @ForeignKey(name = "fk_sitem_submission"))
  private AssessmentSubmission submission;

  @Column(name = "exercise_id", nullable = false)
  private UUID exerciseId;

  @Column(name = "objective_id", nullable = false)
  private UUID objectiveId;

  @Column(name = "position", nullable = false)
  private Integer position;

  @Column(name = "points", nullable = false)
  private Integer points;

  @Enumerated(EnumType.STRING)
  @Column(name = "grading_mode", nullable = false, length = 12)
  private GradingMode gradingMode;

  /** Respuesta del alumno (JSONB). */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "answer_json", columnDefinition = "jsonb")
  private JsonNode answerJson;

  /** Resultado (AUTO) o luego de calificar (MANUAL). */
  @Column(name = "correct")
  private Boolean correct;

  @Column(name = "score", precision = 8, scale = 2)
  private BigDecimal score;

  /** Feedback de la corrección (JSONB). */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "feedback_json", columnDefinition = "jsonb")
  private JsonNode feedbackJson;

  @Column(name = "checked_at")
  private OffsetDateTime checkedAt;

  /** Snapshot opcional del ejercicio para auditoría. */
  @Column(name = "exercise_title", length = 200)
  private String exerciseTitle;

  @Column(name = "exercise_type", length = 40)
  private String exerciseType;

  @Lob
  @Column(name = "statement_rendered", columnDefinition = "text")
  private String statementRendered;
}
