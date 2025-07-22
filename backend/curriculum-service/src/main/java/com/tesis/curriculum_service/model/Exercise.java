package com.tesis.curriculum_service.model;

import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un ejercicio matemático.
 * Soporta soft-delete, auditoría automática y parámetros dinámicos en JSON.
 */
@Entity
@Table(name = "exercises")
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

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "learning_objective_id", nullable = false)
  private LearningObjective learningObjective;

  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<SolutionStep> solutionSteps = new LinkedHashSet<>();

  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Hint> hints = new LinkedHashSet<>();

  public enum Difficulty {
    BASIC,
    INTERMEDIATE,
    ADVANCED
  }
}
