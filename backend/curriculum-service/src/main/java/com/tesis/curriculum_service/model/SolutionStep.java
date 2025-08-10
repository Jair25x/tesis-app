package com.tesis.curriculum_service.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "solution_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
@SQLDelete(sql = "UPDATE solution_steps SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
public class SolutionStep extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @ToString.Include
  private UUID id;

  @Column(name = "step_number", nullable = false)
  @ToString.Include
  private Integer stepNumber;

  @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
  @ToString.Include
  private String explanation;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  @JsonBackReference
  private Exercise exercise;

  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;
}
