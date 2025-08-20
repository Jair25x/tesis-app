// src/main/java/com/tesis/classroom_service/model/JoinCode.java
package com.tesis.classroom_service.model;

import com.tesis.classroom_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "join_codes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_join_code_code", columnNames = { "code" })
}, indexes = {
    @Index(name = "idx_join_code_classroom", columnList = "classroom_id"),
    @Index(name = "idx_join_code_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class JoinCode extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(name = "classroom_id", nullable = false, columnDefinition = "UUID")
  private UUID classroomId;

  /** Código en mayúsculas (alfabeto sin caracteres ambiguos). */
  @Column(name = "code", nullable = false, length = 12)
  private String code;

  @Column(name = "expires_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
  private Instant expiresAt;

  /** null = usos ilimitados */
  @Column(name = "max_uses")
  private Integer maxUses;

  @Column(name = "used_count", nullable = false)
  @Builder.Default
  private Integer usedCount = 0;

  /** Si el owner lo revoca manualmente */
  @Column(name = "revoked", nullable = false)
  @Builder.Default
  private Boolean revoked = false;
}
