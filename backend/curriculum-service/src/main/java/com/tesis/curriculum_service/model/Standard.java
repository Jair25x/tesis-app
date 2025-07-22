// src/main/java/com/tesis/curriculum_service/model/Standard.java
package com.tesis.curriculum_service.model;

import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Entidad JPA que representa un Estándar de aprendizaje dentro de una
 * Competencia.
 *
 * - Soporta soft-delete con @SQLDelete y @SQLRestriction.
 * - Hereda campos de auditoría de AuditableEntity.
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class Standard extends AuditableEntity {

  /** UUID autogenerado como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Código único del estándar (ej. "S.01.01"). */
  @Column(name = "code", nullable = false, unique = true, length = 50)
  @ToString.Include
  private String code;

  /** Nombre o título del estándar. */
  @Column(name = "name", nullable = false, length = 500)
  @ToString.Include
  private String name;

  /** Descripción opcional y detallada. */
  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Flag de borrado lógico. */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Relación con Competency (muchos a uno). */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "competency_id", nullable = false)
  private Competency competency;

  /** Lista de objetivos de aprendizaje asociados. */
  @OneToMany(mappedBy = "standard", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<LearningObjective> learningObjectives = new HashSet<>();

  /** Hook de creación: asegura `active=true` por defecto si es null. */
  @PrePersist
  protected void prePersist() {
    super.onCreate();
    if (this.active == null)
      this.active = true;
  }

  /** Hook de actualización: actualiza el timestamp. */
  @PreUpdate
  protected void preUpdate() {
    super.onUpdate();
  }
}
