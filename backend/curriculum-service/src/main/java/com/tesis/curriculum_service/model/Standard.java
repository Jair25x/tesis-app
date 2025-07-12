// src/main/java/com/tesis/curriculum_service/model/Standard.java
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
 * Entidad JPA que representa un Estándar de aprendizaje dentro de una
 * Competencia.
 *
 * - Soft-delete: al borrar marca active=false y registra deletedAt.
 * - @SQLRestriction filtra solo los registros activos en SELECTs.
 */
@Entity
@Table(name = "standards")
@SQLDelete(sql = "UPDATE standards SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Standard {

  /** UUID autogenerado como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Código único (ej. "S.01.01"). */
  @Column(name = "code", nullable = false, unique = true, length = 50)
  @ToString.Include
  private String code;

  /** Nombre o título breve del estándar. */
  @Column(name = "name", nullable = false, length = 500)
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

  /** Cada Estándar pertenece a una Competencia. */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "competency_id", nullable = false)
  private Competency competency;

  /**
   * Un Estándar puede tener múltiples LearningObjectives.
   * Cascade ALL + orphanRemoval para gestionar la colección.
   */
  @OneToMany(mappedBy = "standard", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<LearningObjective> learningObjectives = new HashSet<>();

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
