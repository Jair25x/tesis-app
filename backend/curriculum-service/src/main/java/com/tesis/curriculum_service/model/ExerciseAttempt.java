package com.tesis.curriculum_service.model;

import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;

/**
 * Entidad que representa un intento de resolución de un ejercicio por parte de
 * un estudiante.
 * Registra si fue correcto, cuántas pistas usó, cuánto tiempo tardó y qué
 * respondió.
 * Usa soft-delete y auditoría automática heredada de {@link AuditableEntity}.
 */
@Entity
@Table(name = "exercise_attempts")
@SQLDelete(sql = "UPDATE exercise_attempts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class ExerciseAttempt extends AuditableEntity {

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

  /** Relación con el ejercicio resuelto (obligatoria) */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  private Exercise exercise;

  @PrePersist
  protected void onCreateAttempt() {
    super.onCreate();
    if (this.attemptedAt == null) {
      this.attemptedAt = LocalDateTime.now();
    }
  }
}
