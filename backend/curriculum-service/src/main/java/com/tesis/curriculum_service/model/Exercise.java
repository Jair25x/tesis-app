// src/main/java/com/tesis/curriculum_service/model/Exercise.java
package com.tesis.curriculum_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un ejercicio matemático.
 *
 * - Soft-delete: al borrar, marca active=false y fija deletedAt.
 * - @SQLRestriction filtra automáticamente solo los registros activos.
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
public class Exercise {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Enunciado o texto completo del problema. */
  @Column(name = "statement", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String statement;

  /** Dificultad del ejercicio: BASIC, INTERMEDIATE o ADVANCED. */
  @Enumerated(EnumType.STRING)
  @Column(name = "difficulty", nullable = false, length = 20)
  private Difficulty difficulty;

  /** Tipo de ejercicio (por ejemplo: "CHOICE", "OPEN", etc.). */
  @Column(name = "type", nullable = false, length = 50)
  private String type;

  /** Soft-delete flag. */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Fecha y hora de creación (no actualizable). */
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** Fecha y hora de última actualización. */
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /** Fecha y hora de borrado lógico. */
  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  /**
   * Relación Many-To-One con LearningObjective.
   * Cada ejercicio pertenece a un objetivo de aprendizaje.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "learning_objective_id", nullable = false)
  private LearningObjective learningObjective;

  /**
   * Pasos de solución ordenados.
   * Serán devueltos en el JSON bajo “solutionSteps”.
   */
  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<SolutionStep> solutionSteps = new LinkedHashSet<>();

  /**
   * Pistas asociadas al ejercicio.
   * El frontend podrá mostrarlas de forma progresiva.
   */
  @OneToMany(mappedBy = "exercise", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Hint> hints = new LinkedHashSet<>();

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

  /**
   * Enum para las tres dificultades soportadas.
   * Se serializa como texto en JSON.
   */
  public enum Difficulty {
    BASIC,
    INTERMEDIATE,
    ADVANCED
  }
}
