// src/main/java/com/tesis/curriculum_service/model/SolutionStep.java
package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA que representa un paso de solución para un ejercicio.
 * Soporta soft-delete y filtra automáticamente solo activos.
 */
@Entity
@Table(name = "solution_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@SQLDelete(sql = "UPDATE solution_steps SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class SolutionStep {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  @ToString.Include
  private UUID id;

  /** Paso dentro de la solución (orden). */
  @Column(name = "step_number", nullable = false)
  @ToString.Include
  private Integer stepNumber;

  /** Texto explicativo de este paso. */
  @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String explanation;

  /**
   * Many-to-One con Exercise.
   * 
   * @JsonBackReference evita ciclos en la serialización.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  @JsonBackReference
  private Exercise exercise;

  /** Flag de soft-delete. */
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

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    this.active = true;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
