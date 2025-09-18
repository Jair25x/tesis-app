// src/main/java/com/tesis/curriculum_service/service/CatalogService.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.catalog.*;
import com.tesis.curriculum_service.model.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.UUID;

public interface CatalogService {
  Page<CatalogCompetencyDto> searchCompetencies(String q, UUID curriculumId, Pageable pageable);

  Page<CatalogStandardDto> searchStandards(String q, UUID curriculumId, UUID competencyId, Pageable pageable);

  Page<CatalogObjectiveDto> searchObjectives(String q, UUID curriculumId, UUID competencyId, UUID standardId,
      Pageable pageable);

  Page<CatalogExerciseDto> searchExercises(
      String q,
      UUID curriculumId,
      UUID competencyId,
      UUID standardId,
      UUID objectiveId,
      Exercise.Difficulty difficulty,
      Date from,
      Date to,
      Pageable pageable);
}
