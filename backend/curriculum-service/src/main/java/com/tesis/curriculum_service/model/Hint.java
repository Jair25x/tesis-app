package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA que representa una pista (hint) para un ejercicio.
 */
@Entity
@Table(name = "hints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@SQLDelete(sql = "UPDATE hints SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class Hint {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "hint_text", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String hintText;

  @Column(nullable = false)
  @ToString.Include
  private Integer cost;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  @JsonBackReference
  private Exercise exercise;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  private Boolean active;

  @Column
  private LocalDateTime deletedAt;

  @PrePersist
  void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    createdAt = now;
    updatedAt = now;
    active = true;
  }

  @PreUpdate
  void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}