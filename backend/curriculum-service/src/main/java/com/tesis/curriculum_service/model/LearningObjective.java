// src/main/java/com/tesis/curriculum_service/model/LearningObjective.java
package com.tesis.curriculum_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un Objetivo de Aprendizaje.
 *
 * - Soft-delete: al borrar marca active=false y registra deletedAt.
 * - @SQLRestriction filtra automáticamente solo registros activos.
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
public class LearningObjective {

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

  /** Descripción detallada (opcional). */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Soft-delete flag. */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Timestamp de creación (no actualizable). */
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** Timestamp de última modificación. */
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /** Timestamp de borrado lógico. */
  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  /** Muchos objetivos pertenecen a un mismo Estándar. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "standard_id", nullable = false)
  private Standard standard;

  /**
   * Relación One-To-Many con Exercise:
   * un Objetivo puede tener múltiples ejercicios.
   */
  @OneToMany(mappedBy = "learningObjective", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Exercise> exercises = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.active == null) {
      this.active = true;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
