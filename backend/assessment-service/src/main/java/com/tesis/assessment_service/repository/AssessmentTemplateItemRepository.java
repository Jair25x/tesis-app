package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface AssessmentTemplateItemRepository extends JpaRepository<AssessmentTemplateItem, UUID> {
  List<AssessmentTemplateItem> findByTemplate_IdOrderByPositionAsc(UUID templateId);

  // NUEVO: para cargar items de varios templates en una sola query
  List<AssessmentTemplateItem> findByTemplate_IdIn(Collection<UUID> templateIds);
}
