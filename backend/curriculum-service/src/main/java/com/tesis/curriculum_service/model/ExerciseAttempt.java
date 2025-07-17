package com.tesis.curriculum_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad que representa un intento de resolución de un ejercicio por un
 * estudiante.
 * Se registra si fue correcto, cuántas pistas usó, cuánto tiempo tardó y qué
 * respondió.
 * Usa soft-delete mediante la bandera `active` y la columna `deleted_at`.
 */
@Entity
@Table(name = "exercise_attempts")
@SQLDelete(sql = "UPDATE exercise_attempts SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class ExerciseAttempt {

  /** ID autogenerado del intento */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @EqualsAndHashCode.Include
  private Long id;

  /** Resultado del intento (true = correcto, false = incorrecto) */
  @Column(name = "correct", nullable = false)
  private boolean correct;

  /** Cantidad de pistas usadas */
  @Column(name = "hints_used", nullable = false)
  private int hintsUsed;

  /** Tiempo invertido en milisegundos */
  @Column(name = "time_spent", nullable = false)
  private long timeSpent;

  /** Respuesta enviada por el estudiante */
  @Column(name = "submitted_answer", columnDefinition = "TEXT")
  private String submittedAnswer;

  /** Fecha y hora del intento */
  @Column(name = "attempted_at", nullable = false)
  private LocalDateTime attemptedAt;

  /** ID del usuario que realizó el intento (obtenido del JWT) */
  @Column(name = "user_id", nullable = false)
  private Long userId;

  /** Relación con el ejercicio resuelto (UUID) */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  private Exercise exercise;

  /** Borrado lógico (activo o no) */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Fecha de eliminación lógica */
  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @PrePersist
  protected void onCreate() {
    if (this.attemptedAt == null) {
      this.attemptedAt = LocalDateTime.now();
    }
    if (this.active == null) {
      this.active = true;
    }
  }
}
