// src/main/java/com/tesis/curriculum_service/model/Competency.java
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
 * Entidad JPA que representa una Competencia dentro de un Currículo.
 *
 * - Soft-delete: marca active=false y registra deletedAt.
 * - @SQLRestriction filtra solo activas en cada SELECT.
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
public class Competency {

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

  /** Soft-delete flag. */
  @Column(nullable = false)
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
   * Relación Many-To-One con Curriculum.
   * Fetch LAZY para no cargar siempre el padre.
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "curriculum_id", nullable = false)
  private Curriculum curriculum;

  /**
   * Relación One-To-Many con Standard.
   * orphanRemoval si eliminas la entidad de la colección.
   * Cascade ALL para propagar persistencia y borrado lógico en cada hijo.
   */
  @OneToMany(mappedBy = "competency", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Standard> standards = new HashSet<>();

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
