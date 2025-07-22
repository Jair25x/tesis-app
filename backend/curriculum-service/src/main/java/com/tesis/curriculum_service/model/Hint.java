package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
@SQLDelete(sql = "UPDATE hints SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class Hint extends AuditableEntity {

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

  @Column(nullable = false)
  private Boolean active;

  @PrePersist
  protected void onCreate() {
    super.onCreate();
    this.active = true;
  }
}
