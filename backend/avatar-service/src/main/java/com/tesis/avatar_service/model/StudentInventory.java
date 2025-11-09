package com.tesis.avatar_service.model;

import com.tesis.avatar_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "student_inventory",
  uniqueConstraints = @UniqueConstraint(name = "ux_inventory_idempotent",
      columnNames = {"student_id", "source", "award_code"}),
  indexes = {
    @Index(name = "ix_inventory_student", columnList = "student_id"),
    @Index(name = "ix_inventory_awarded_at", columnList = "awarded_at")
  }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StudentInventory extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
  private UUID studentId;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "cosmetic_item_id", nullable = false)
  private CosmeticItem item;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private RewardSource source;

  @Column(name = "award_code", nullable = false, length = 120)
  private String awardCode; // p.ej. ACHV:STREAK_3D

  @Column(name = "awarded_at", nullable = false)
  @Builder.Default
  private Instant awardedAt = Instant.now();

  @Column(name = "metadata_json", nullable = false, columnDefinition = "TEXT")
  @Builder.Default
  private String metadataJson = "{}";

  @PrePersist
  protected void onCreateEntity() {
    super.onCreate();
    if (this.awardedAt == null) this.awardedAt = Instant.now();
    if (this.metadataJson == null) this.metadataJson = "{}";
  }

  @PreUpdate
  protected void onUpdateEntity() { super.onUpdate(); }
}
