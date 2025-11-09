package com.tesis.avatar_service.model;

import com.tesis.avatar_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "cosmetic_item",
  indexes = {
    @Index(name = "ix_cosmetic_item_slot", columnList = "slot"),
    @Index(name = "ix_cosmetic_item_active", columnList = "active")
  }
)
@SQLDelete(sql = "UPDATE cosmetic_item SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class CosmeticItem extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(nullable = false, unique = true, length = 64)
  @ToString.Include
  private String code; // ej: HAT_RED_CAP

  @Column(name = "display_name", nullable = false, length = 120)
  @ToString.Include
  private String displayName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private CosmeticSlot slot;

  @Column(nullable = false, length = 24)
  @Builder.Default
  private String rarity = "COMMON";

  @Column(name = "asset_url", nullable = false, columnDefinition = "TEXT")
  private String assetUrl;

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
