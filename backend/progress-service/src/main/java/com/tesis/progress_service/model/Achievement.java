package com.tesis.progress_service.model;

import com.tesis.progress_service.model.base.AuditableEntity;

import jakarta.persistence.*;

import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "achievements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_achievement_code", columnNames = { "code" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class Achievement extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "code", nullable = false, length = 100)
  private String code;

  @Column(name = "name", nullable = false, length = 255)
  private String name;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Mantener como String por flexibilidad inicial (luego puede migrar a Enum) */
  @Column(name = "condition_type", length = 50)
  private String conditionType;

  @Column(name = "threshold")
  private Integer threshold;

  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;

  @Column(name = "points", nullable = false)
  @Builder.Default
  private Integer points = 0;
}
