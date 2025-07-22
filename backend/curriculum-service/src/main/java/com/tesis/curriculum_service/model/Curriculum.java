// src/main/java/com/tesis/curriculum_service/model/Curriculum.java
package com.tesis.curriculum_service.model;

import com.tesis.curriculum_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "curricula")
@SQLDelete(sql = "UPDATE curricula SET active = false, deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("active = true")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class Curriculum extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID")
  @EqualsAndHashCode.Include
  private UUID id;

  @Column(nullable = false, unique = true, length = 100)
  @ToString.Include
  private String code;

  @Column(nullable = false, unique = true, length = 255)
  @ToString.Include
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, length = 50)
  @ToString.Include
  private String grade;

  /** Soft-delete flag. */
  @Column(nullable = false)
  @Builder.Default
  private Boolean active = true;

  @OneToMany(mappedBy = "curriculum", cascade = {
      CascadeType.PERSIST,
      CascadeType.MERGE,
      CascadeType.REFRESH
  })
  @Builder.Default
  private Set<Competency> competencies = new HashSet<>();
}
