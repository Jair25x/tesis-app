package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.repository.StandardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link LearningObjectiveService}.
 * Gestiona los objetivos de aprendizaje con validación de jerarquía completa.
 */
@Service
@RequiredArgsConstructor
public class LearningObjectiveServiceImpl implements LearningObjectiveService {

  private final LearningObjectiveRepository loRepo;
  private final StandardRepository standardRepo;
  private final CompetencyRepository compRepo;
  private final CurriculumRepository curriculumRepo;

  /*-------------------------------------------------------
   * CREATE
   *-----------------------------------------------------*/
  @Override
  @Transactional
  public LearningObjectiveResponse create(UUID curriculumId, UUID competencyId, UUID standardId,
      LearningObjectiveRequest req) throws ResourceNotFoundException {

    Standard std = validateHierarchy(curriculumId, competencyId, standardId);

    LearningObjective lo = LearningObjective.builder()
        .name(req.getName())
        .description(req.getDescription())
        .code(req.getCode())
        .standard(std)
        .build();

    return toDto(loRepo.save(lo));
  }

  /*-------------------------------------------------------
   * READ – List & Get
   *-----------------------------------------------------*/
  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getAllByStandard(UUID curriculumId, UUID competencyId, UUID standardId)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    return loRepo.findActiveByStandardId(standardId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getAllInactive(UUID curriculumId, UUID competencyId, UUID standardId)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    return loRepo.findInactiveByStandardId(standardId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getAllIncludingInactive(UUID curriculumId, UUID competencyId, UUID standardId)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    return loRepo.findAllByStandardIdIncludingInactive(standardId)
        .stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public LearningObjectiveResponse getById(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    return toDto(lo);
  }

  /*-------------------------------------------------------
   * UPDATE
   *-----------------------------------------------------*/
  @Override
  @Transactional
  public LearningObjectiveResponse update(UUID curriculumId, UUID competencyId, UUID standardId, UUID id,
      LearningObjectiveRequest req) throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    lo.setName(req.getName());
    lo.setDescription(req.getDescription());
    lo.setCode(req.getCode());

    return toDto(loRepo.save(lo));
  }

  /*-------------------------------------------------------
   * DELETE (soft-delete)
   *-----------------------------------------------------*/
  @Override
  @Transactional
  public void delete(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    loRepo.delete(lo); // Soft-delete aplicado por @SQLDelete
  }

  /*-------------------------------------------------------
   * REACTIVATE
   *-----------------------------------------------------*/
  @Override
  @Transactional
  public void reactivate(UUID curriculumId, UUID competencyId, UUID standardId, UUID id)
      throws ResourceNotFoundException {

    validateHierarchy(curriculumId, competencyId, standardId);

    LearningObjective lo = loRepo.findIncludingInactiveByIdAndStandardId(id, standardId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    lo.setActive(true);
    lo.setDeletedAt(null);
    lo.setUpdatedAt(LocalDateTime.now());

    loRepo.save(lo);
  }

  /*-------------------------------------------------------
   * Helpers
   *-----------------------------------------------------*/

  private Standard validateHierarchy(UUID curriculumId, UUID competencyId, UUID standardId)
      throws ResourceNotFoundException {

    Curriculum curriculum = curriculumRepo.findById(curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", curriculumId));

    Competency competency = compRepo.findById(competencyId)
        .filter(c -> c.getCurriculum().getId().equals(curriculum.getId()))
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", competencyId));

    return standardRepo.findById(standardId)
        .filter(s -> s.getCompetency().getId().equals(competency.getId()))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", standardId));
  }

  private LearningObjectiveResponse toDto(LearningObjective lo) {
    return LearningObjectiveResponse.builder()
        .id(lo.getId())
        .name(lo.getName())
        .description(lo.getDescription())
        .code(lo.getCode())
        .curriculumId(lo.getStandard().getCompetency().getCurriculum().getId())
        .competencyId(lo.getStandard().getCompetency().getId())
        .standardId(lo.getStandard().getId())
        .standardName(lo.getStandard().getName())
        .createdAt(lo.getCreatedAt())
        .updatedAt(lo.getUpdatedAt())
        .active(lo.getActive())
        .build();
  }
}
