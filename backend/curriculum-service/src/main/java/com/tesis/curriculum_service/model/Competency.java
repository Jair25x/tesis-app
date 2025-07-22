// src/main/java/com/tesis/curriculum_service/model/Competency.java
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
 * Entidad JPA que representa una Competencia dentro de un Currículo.
 *
 * - Soft-delete: marca active=false y registra deletedAt.
 * - Hereda auditoría automática desde AuditableEntity.
 */
@Entity
@Table(name = "competencies")
@SQLDelete(sql = "UPDATE competencies SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Competency extends AuditableEntity {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Código único de la competencia (ej. "C.01.02"). */
  @Column(nullable = false, unique = true, length = 50)
  @ToString.Include
  private String code;

  /** Nombre descriptivo de la competencia. */
  @Column(nullable = false, length = 255)
  @ToString.Include
  private String name;

  /** Descripción detallada de la competencia. */
  @Column(nullable = false, columnDefinition = "TEXT", length = 1000)
  private String description;

  /** Estado lógico (soft delete). */
  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  /**
   * Relación Many-To-One con Curriculum.
   * Fetch LAZY para eficiencia.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "curriculum_id", nullable = false)
  private Curriculum curriculum;

  /**
   * Relación One-To-Many con Standard.
   * orphanRemoval y cascade garantizan sincronización total.
   */
  @OneToMany(mappedBy = "competency", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Standard> standards = new HashSet<>();

  @PrePersist
  protected void onCreateEntity() {
    super.onCreate(); // timestamps automáticos
    if (this.active == null) {
      this.active = true;
    }
  }

  @PreUpdate
  protected void onUpdateEntity() {
    super.onUpdate();
  }
}
