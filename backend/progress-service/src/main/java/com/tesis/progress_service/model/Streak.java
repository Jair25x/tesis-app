package com.tesis.progress_service.model;

import com.tesis.progress_service.model.base.AuditableEntity;

import jakarta.persistence.*;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "streaks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class Streak extends AuditableEntity {

  /** Clave natural: 1 registro por estudiante */
  @Id
  @Column(name = "student_id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID studentId;

  @Column(name = "current", nullable = false)
  @Builder.Default
  private Integer current = 0;

  @Column(name = "longest", nullable = false)
  @Builder.Default
  private Integer longest = 0;

  @Column(name = "last_day")
  private LocalDate lastDay;
}
