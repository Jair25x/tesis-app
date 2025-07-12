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
 * Soporta soft-delete: al borrar, marca active=false y registra deletedAt.
 * Usa SQLRestriction para filtrar automáticamente sólo las competencias
 * activas.
 */
@Entity
@Table(name = "competencies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE competencies SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class Competency {

  /** UUID generado automáticamente como clave primaria. */
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  private UUID id;

  /** Nombre descriptivo de la competencia. */
  @Column(nullable = false, length = 255)
  private String name;

  /** Descripción detallada de la competencia. */
  @Column(nullable = false, length = 1000, columnDefinition = "TEXT")
  private String description;

  /** Código único de la competencia (ej. "C.01.02"). */
  @Column(nullable = false, unique = true, length = 50)
  private String code;

  /** Relación Many-To-One con Curriculum. */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "curriculum_id", nullable = false)
  private Curriculum curriculum;

  /**
   * Relación One-To-Many con Standard.
   * Permite soft-delete en cascada y reactivación de estándares al
   * borrar/reactivar una competencia.
   */
  @OneToMany(mappedBy = "competency", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Standard> standards = new HashSet<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

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
