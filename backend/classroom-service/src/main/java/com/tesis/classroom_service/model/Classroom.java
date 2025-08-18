package com.tesis.classroom_service.model;

import com.tesis.classroom_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "classrooms", indexes = {
    @Index(name = "idx_classroom_owner", columnList = "owner_uuid"),
    @Index(name = "idx_classroom_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString(onlyExplicitlyIncluded = true)
public class Classroom extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", nullable = false, updatable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  /** Docente propietario (UUID canónico del usuario) */
  @Column(name = "owner_uuid", nullable = false, columnDefinition = "UUID")
  private UUID ownerUuid;

  @ToString.Include
  @Column(name = "name", nullable = false, length = 120)
  private String name;

  @Column(name = "description", columnDefinition = "TEXT")
  private String description;

  /** Grado (opcional). Si luego standardizas, puedes migrarlo a enum. */
  @Column(name = "grade", length = 20)
  private String grade;

  /** Asignatura (opcional) */
  @Column(name = "subject", length = 50)
  private String subject;

  /** Soft-delete/estado */
  @Column(name = "active", nullable = false)
  @Builder.Default
  private Boolean active = true;
}
