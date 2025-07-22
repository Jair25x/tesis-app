package com.tesis.curriculum_service.model;

import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un Objetivo de Aprendizaje.
 *
 * - Hereda campos de auditoría (creadoPor, actualizadoPor, timestamps, etc.)
 * - Soporta soft-delete con @SQLDelete y filtro automático con @SQLRestriction.
 */
@Entity
@Table(name = "learning_objectives")
@SQLDelete(sql = "UPDATE learning_objectives SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class LearningObjective extends AuditableEntity {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Código único (ej. "LO.01.01.01"). */
  @Column(name = "code", nullable = false, unique = true, length = 50)
  @ToString.Include
  private String code;

  /** Título o nombre breve del objetivo. */
  @Column(name = "name", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String name;

  /** Descripción detallada del objetivo. */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Estado lógico activo/inactivo. */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Relación con el estándar al que pertenece. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "standard_id", nullable = false)
  private Standard standard;

  /**
   * Relación uno-a-muchos con ejercicios:
   * un objetivo puede tener múltiples ejercicios asociados.
   */
  @OneToMany(mappedBy = "learningObjective", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Exercise> exercises = new HashSet<>();
}
