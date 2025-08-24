package com.tesis.assessment_service.model;

import com.tesis.assessment_service.model.base.AuditableEntity;
import com.tesis.assessment_service.model.enums.GradingMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assessment_template_item", indexes = {
    @Index(name = "idx_titem_template_position", columnList = "template_id, position"),
    @Index(name = "idx_titem_objective", columnList = "objective_id")
})
public class AssessmentTemplateItem extends AuditableEntity {

  @Id
  @GeneratedValue
  @UuidGenerator
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "template_id", nullable = false, foreignKey = @ForeignKey(name = "fk_titem_template"))
  private AssessmentTemplate template;

  @Column(name = "objective_id", nullable = false)
  private UUID objectiveId;

  @Column(name = "exercise_id", nullable = false)
  private UUID exerciseId;

  @Column(name = "points", nullable = false)
  private Integer points;

  @Column(name = "position", nullable = false)
  private Integer position;

  @Enumerated(EnumType.STRING)
  @Column(name = "grading_mode", nullable = false, length = 12)
  private GradingMode gradingMode;
}
