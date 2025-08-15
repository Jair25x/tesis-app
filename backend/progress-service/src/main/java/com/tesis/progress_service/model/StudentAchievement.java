package com.tesis.progress_service.model;

import com.tesis.progress_service.model.base.AuditableEntity;

import jakarta.persistence.*;

import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "student_achievements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_achievement", columnNames = { "student_id", "achievement_id" })
}, indexes = {
    @Index(name = "idx_sa_student", columnList = "student_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class StudentAchievement extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
  private UUID studentId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "achievement_id", nullable = false, columnDefinition = "UUID")
  private Achievement achievement;

  @Column(name = "earned_at", nullable = false)
  @Builder.Default
  private LocalDateTime earnedAt = LocalDateTime.now();

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata", columnDefinition = "jsonb")
  private Map<String, Object> metadata;
}
