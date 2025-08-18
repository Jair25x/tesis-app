package com.tesis.classroom_service.model;

import com.tesis.classroom_service.model.base.AuditableEntity;
import com.tesis.classroom_service.model.enums.MemberRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "classroom_members", uniqueConstraints = {
    @UniqueConstraint(name = "uk_member_classroom_user", columnNames = { "classroom_id", "user_uuid" })
}, indexes = {
    @Index(name = "idx_member_classroom", columnList = "classroom_id"),
    @Index(name = "idx_member_user", columnList = "user_uuid")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class ClassroomMember extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "classroom_id", nullable = false, columnDefinition = "UUID")
  private UUID classroomId;

  /** UUID canónico del usuario miembro */
  @Column(name = "user_uuid", nullable = false, columnDefinition = "UUID")
  private UUID userUuid;

  @Enumerated(EnumType.STRING)
  @Column(name = "role", nullable = false, length = 20)
  @Builder.Default
  private MemberRole role = MemberRole.STUDENT;

  @Column(name = "joined_at", nullable = false)
  private LocalDateTime joinedAt;

  @PrePersist
  protected void onPersist() {
    if (this.joinedAt == null) {
      this.joinedAt = LocalDateTime.now();
    }
  }
}
