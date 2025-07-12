// src/main/java/com/tesis/curriculum_service/model/Curriculum.java
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
 * Entidad JPA que representa un Currículo escolar.
 *
 * - Soft-delete: al invocar delete(), Hibernate ejecuta el UPDATE de
 * active=false y deleted_at.
 * - @SQLRestriction filtra automáticamente todas las consultas SELECT
 * para incluir solo active=true.
 */
@Entity
@Table(name = "curricula")
@SQLDelete(sql = "UPDATE curricula SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Curriculum {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(nullable = false, unique = true, length = 100)
  @ToString.Include
  private String code;

  @Column(nullable = false, unique = true, length = 255)
  @ToString.Include
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, length = 50)
  @ToString.Include
  private String grade;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  /** Soft-delete flag. */
  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  /** Fecha y hora de borrado lógico. */
  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  /**
   * Relación 1–N con Competency.
   * Cascade sin REMOVE/orphanRemoval para que el borrado sea lógico.
   */
  @OneToMany(mappedBy = "curriculum", cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH })
  @Builder.Default
  private Set<Competency> competencies = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    this.active = true;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
