package com.tesis.assessment_service.model;

import com.tesis.assessment_service.model.base.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_template", indexes = {
    @Index(name = "idx_template_owner", columnList = "owner_uuid"),
    @Index(name = "idx_template_curriculum", columnList = "curriculum_id")
})
public class AssessmentTemplate extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @Column(name = "owner_uuid", nullable = false)
  private UUID ownerUuid;

  @Column(name = "title", nullable = false, length = 160)
  private String title;

  @Column(name = "curriculum_id", nullable = false)
  private UUID curriculumId;

  /** Configuración de la plantilla (flags como shuffle, allowHints, etc.). */
  @Column(name = "config_json", columnDefinition = "jsonb")
  private String configJson;

  @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  @OrderBy("position ASC")
  @Builder.Default
  private List<AssessmentTemplateItem> items = new ArrayList<>();
}
