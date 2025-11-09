package com.tesis.avatar_service.model;

import com.tesis.avatar_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "reward_rule",
  indexes = {
    @Index(name = "ix_reward_rule_active", columnList = "active"),
    @Index(name = "ix_reward_rule_source", columnList = "source"),
    @Index(name = "ix_reward_rule_trigger", columnList = "trigger_code")
  }
)
@SQLDelete(sql = "UPDATE reward_rule SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RewardRule extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private RewardSource source; // ACHIEVEMENT en esta fase

  @Column(name = "trigger_code", nullable = false, length = 120)
  private String triggerCode; // p.ej. ACHV:STREAK_3D

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "cosmetic_item_id", nullable = false)
  private CosmeticItem cosmeticItem;

  @Column(name = "max_claims", nullable = false)
  @Builder.Default
  private Integer maxClaims = 1;

  @Column(name = "ttl_seconds")
  private Integer ttlSeconds;

  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  @PrePersist
  protected void onCreateEntity() {
    super.onCreate();
    if (this.active == null) this.active = true;
  }

  @PreUpdate
  protected void onUpdateEntity() { super.onUpdate(); }
}
