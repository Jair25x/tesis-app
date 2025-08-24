package com.tesis.assessment_service.repository;

import com.tesis.assessment_service.model.AssessmentTemplate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentTemplateRepository extends JpaRepository<AssessmentTemplate, UUID> {

  @EntityGraph(attributePaths = "items")
  Optional<AssessmentTemplate> findWithItemsById(UUID id);
}
