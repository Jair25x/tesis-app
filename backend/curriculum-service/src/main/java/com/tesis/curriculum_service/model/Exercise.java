package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "exercises", indexes = {
    @Index(name = "idx_ex_lo_active", columnList = "learning_objective_id, active"),
    @Index(name = "idx_ex_diag_active", columnList = "is_diagnostic, active")
})
@SQLDelete(sql = "UPDATE exercises SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Exercise extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "statement", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String statement;

  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false, length = 20)
  private Difficulty difficulty;

  @Column(name = "type", nullable = false, length = 50)
  private String type;

  @Column(name = "correct_answer", columnDefinition = "TEXT")
  private String correctAnswer;

  @Enumerated(EnumType.STRING)
  @Column(name = "template_type", length = 50)
  private TemplateType templateType;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "parameters", columnDefinition = "jsonb")
  private Map<String, Object> parameters;

  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  @Column(name = "is_diagnostic", nullable = false)
  @Builder.Default
  private boolean isDiagnostic = false;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "learning_objective_id", nullable = false)
  private LearningObjective learningObjective;

  // Ordenada por stepNumber; evita N+1/MultipleBagFetch con SUBSELECT
  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("stepNumber ASC")
  @Fetch(FetchMode.SUBSELECT)
  @BatchSize(size = 64)
  @Builder.Default
  @JsonManagedReference
  private List<SolutionStep> solutionSteps = new ArrayList<>();

  // Orden estable; idem SUBSELECT para evitar MultipleBagFetch
  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("id ASC")
  @Fetch(FetchMode.SUBSELECT)
  @BatchSize(size = 64)
  @Builder.Default
  @JsonManagedReference
  private List<Hint> hints = new ArrayList<>();

  public enum Difficulty {
    BASIC, INTERMEDIATE, ADVANCED
  }
}
