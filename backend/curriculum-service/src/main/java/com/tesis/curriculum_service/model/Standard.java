package com.tesis.curriculum_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un Estándar de aprendizaje dentro de una
 * Competencia.
 * Soporta soft-delete: al borrar, marca active=false y pone deletedAt.
 * Usa SQLRestriction para filtrar automáticamente sólo los registros activos.
 */
@Entity
@Table(name = "standards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE standards SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class Standard {

  /**
   * Identificador UUID generado automáticamente.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  private UUID id;

  /**
   * Nombre o título breve del estándar.
   */
  @Column(name = "name", nullable = false, length = 500)
  private String name;

  /**
   * Descripción detallada del estándar.
   */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /**
   * Código único del estándar (ej. "S.01.01").
   */
  @Column(name = "code", nullable = false, unique = true, length = 50)
  private String code;

  /**
   * Marca si el estándar está activo (soft-delete).
   */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /**
   * Fecha y hora de creación (no actualizable).
   */
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /**
   * Fecha y hora de última actualización.
   */
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /**
   * Fecha y hora del borrado lógico.
   */
  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  /**
   * Relación Many-To-One con Competency: cada Estándar pertenece a una
   * Competencia.
   * LAZY para optimizar carga.
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "competency_id", nullable = false)
  private Competency competency;

  /**
   * Relación One-To-Many con LearningObjective: un Estándar puede tener múltiples
   * objetivos.
   * Cascade ALL y orphanRemoval para gestionar la colección.
   */
  @OneToMany(mappedBy = "standard", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<LearningObjective> learningObjectives = new HashSet<>();

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
   * Callback JPA: al actualizar, fija updatedAt.
   */
  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
