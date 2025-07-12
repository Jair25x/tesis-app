package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA que representa una pista (hint) para un ejercicio.
 * Cada pista tiene un texto explicativo y un “coste” en puntos que
 * podrá descontarse del alumno al pedirla.
 */
@Entity
@Table(name = "hints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hint {

  /** UUID autogenerado como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  private UUID id;

  /** Texto de la pista. */
  @Column(name = "hint_text", nullable = false, columnDefinition = "TEXT")
  private String hintText;

  /** Coste en puntos al solicitar esta pista. */
  @Column(name = "cost", nullable = false)
  private Integer cost;

  /**
   * Relación Many-To-One con Exercise.
   * 
   * @JsonBackReference evita ciclos al serializar Exercise → hints → exercise.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  @JsonBackReference
  private Exercise exercise;

  /** Timestamp de creación (no actualizable). */
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** Timestamp de última modificación. */
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /** Se fija createdAt y updatedAt al persistir por primera vez. */
  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  /** Se actualiza updatedAt antes de cada modificación. */
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
