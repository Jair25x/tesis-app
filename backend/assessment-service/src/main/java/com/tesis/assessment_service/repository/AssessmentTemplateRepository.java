package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentTemplate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentTemplateRepository
    extends JpaRepository<AssessmentTemplate, UUID>, JpaSpecificationExecutor<AssessmentTemplate> {

  @EntityGraph(attributePaths = "items")
  Optional<AssessmentTemplate> findWithItemsById(UUID id);
}
