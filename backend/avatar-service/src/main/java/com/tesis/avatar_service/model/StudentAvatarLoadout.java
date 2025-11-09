package com.tesis.avatar_service.model;

import com.tesis.avatar_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "student_avatar_loadout", uniqueConstraints = @UniqueConstraint(name = "ux_loadout_student_slot", columnNames = {
    "student_id", "slot" }), indexes = {
        @Index(name = "ix_loadout_student", columnList = "student_id"),
        @Index(name = "ix_loadout_updated_at", columnList = "updated_at")
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StudentAvatarLoadout extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "student_id", nullable = false, columnDefinition = "UUID")
  private UUID studentId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private CosmeticSlot slot;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cosmetic_item_id")
  private CosmeticItem item; // puede ser null (limpiar slot)

  @PrePersist
  protected void onCreateEntity() {
    super.onCreate(); // timestamps del base
  }

  @PreUpdate
  protected void onUpdateEntity() {
    super.onUpdate(); // timestamps del base
  }
}
