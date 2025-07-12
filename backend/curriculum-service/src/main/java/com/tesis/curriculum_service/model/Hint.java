// src/main/java/com/tesis/curriculum_service/model/Hint.java
package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA que representa una pista (hint) para un ejercicio.
 */
@Entity
@Table(name = "hints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Hint {

  /** UUID autogenerado como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Texto de la pista. */
  @Column(name = "hint_text", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String hintText;

  /** Coste en puntos al solicitar esta pista. */
  @Column(name = "cost", nullable = false)
  @ToString.Include
  private Integer cost;

  /**
   * Relación Many-To-One con Exercise.
   * 
   * @JsonBackReference evita ciclos al serializar bidireccionalmente.
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

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
