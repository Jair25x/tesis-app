// src/main/java/com/tesis/curriculum_service/model/LearningObjective.java
package com.tesis.curriculum_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA que representa un Objetivo de Aprendizaje.
 * <p>
 * - Soft-delete: al borrar, marca {@code active=false} y fija
 * {@code deleted_at}.<br>
 * - @SQLRestriction filtra automáticamente solo los registros activos.
 */
@Entity
@Table(name = "learning_objectives")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE learning_objectives SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class LearningObjective {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  private UUID id;

  /** Título o nombre del objetivo de aprendizaje. */
  @Column(name = "name", nullable = false, columnDefinition = "TEXT")
  private String name;

  /** Descripción detallada del objetivo. */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Código único del objetivo (ej. "LO.01.01.01"). */
  @Column(name = "code", nullable = false, unique = true, length = 50)
  private String code;

  /** Flag de soft-delete. */
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
   * Relación Many-To-One con Standard.
   * Muchos objetivos pertenecen a un mismo estándar.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "standard_id", nullable = false)
  private Standard standard;

  /**
   * Callback JPA: al persistir por primera vez, fija createdAt, updatedAt y
   * active=true.
   */
  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.active == null) {
      this.active = true;
    }
  }

  /**
   * Callback JPA: al actualizar la entidad, fija updatedAt.
   */
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
