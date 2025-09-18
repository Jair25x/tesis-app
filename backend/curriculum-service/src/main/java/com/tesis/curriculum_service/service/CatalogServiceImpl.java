// src/main/java/com/tesis/curriculum_service/service/CatalogServiceImpl.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.catalog.*;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.repository.catalog.CatalogQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogServiceImpl implements CatalogService {

  private final CatalogQueryRepository repo;

  @Override
  public Page<CatalogCompetencyDto> searchCompetencies(String q, UUID curriculumId, Pageable pageable) {
    return repo.searchCompetencies(q, curriculumId, pageable);
  }

  @Override
  public Page<CatalogStandardDto> searchStandards(String q, UUID curriculumId, UUID competencyId, Pageable pageable) {
    return repo.searchStandards(q, curriculumId, competencyId, pageable);
  }

  @Override
  public Page<CatalogObjectiveDto> searchObjectives(String q, UUID curriculumId, UUID competencyId, UUID standardId,
      Pageable pageable) {
    return repo.searchObjectives(q, curriculumId, competencyId, standardId, pageable);
  }

  @Override
  public Page<CatalogExerciseDto> searchExercises(
      String q,
      UUID curriculumId,
      UUID competencyId,
      UUID standardId,
      UUID objectiveId,
      Exercise.Difficulty difficulty,
      Date from,
      Date to,
      Pageable pageable) {
    return repo.searchExercises(q, curriculumId, competencyId, standardId, objectiveId, difficulty, from, to, pageable);
  }
}
