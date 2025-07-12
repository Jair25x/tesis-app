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
 * <p>
 * - Soft-delete: al invocar delete(), Hibernate ejecuta el UPDATE de
 * active=false y deleted_at.
 * - @SQLRestriction (clase) filtra automáticamente todas las consultas SELECT
 * para incluir solo active=true.
 */
@Entity
@Table(name = "curricula")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE curricula SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class Curriculum {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  private UUID id;

  @Column(nullable = false, unique = true, length = 100)
  private String code;

  @Column(nullable = false, unique = true, length = 255)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, length = 50)
  private String grade;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  /**
   * Relación 1–N con Competency.
   * <ul>
   * <li>cascade PERSIST/MERGE para insertar/actualizar hijos junto al padre.</li>
   * <li>Sin orphanRemoval ni REMOVE: el borrado lógico se gestiona en
   * servicio.</li>
   * </ul>
   */
  @OneToMany(mappedBy = "curriculum", cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH })
  @Builder.Default
  private Set<Competency> competencies = new HashSet<>();

  @PrePersist
  protected void onCreate() {
    var now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    this.active = true;
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
