package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.StandardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StandardServiceImpl implements StandardService {

  private final StandardRepository standardRepo;
  private final CompetencyRepository competencyRepo;
  private final LearningObjectiveService learningObjectiveService;

  @Override
  @Transactional
  public StandardResponse create(UUID curriculumId, UUID competencyId, StandardRequest request)
      throws ResourceNotFoundException {
    Competency comp = competencyRepo
        .findById(competencyId)
        .filter(c -> c.getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", competencyId));

    Standard std = Standard.builder()
        .name(request.getName())
        .description(request.getDescription())
        .code(request.getCode())
        .competency(comp)
        .build();

    return toDto(standardRepo.save(std));
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllByCompetency(UUID curriculumId, UUID competencyId, String status)
      throws ResourceNotFoundException {
    validateCompetencyInCurriculum(curriculumId, competencyId);

    List<Standard> standards;

    switch (status.toLowerCase()) {
      case "active" -> standards = standardRepo.findActiveByCompetencyId(competencyId);
      case "inactive" -> standards = standardRepo.findInactiveByCompetencyId(competencyId);
      case "all" -> standards = standardRepo.findAllByCompetencyIdNative(competencyId);
      default -> throw new IllegalArgumentException("Parámetro 'status' inválido. Usa: active, inactive o all.");
    }

    return standards.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllByCompetency(UUID curriculumId, UUID competencyId)
      throws ResourceNotFoundException {
    return getAllByCompetency(curriculumId, competencyId, "active");
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllInactiveByCompetency(UUID curriculumId, UUID competencyId)
      throws ResourceNotFoundException {
    return getAllByCompetency(curriculumId, competencyId, "inactive");
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllIncludingInactiveByCompetency(UUID curriculumId, UUID competencyId)
      throws ResourceNotFoundException {
    return getAllByCompetency(curriculumId, competencyId, "all");
  }

  @Override
  @Transactional(readOnly = true)
  public StandardResponse getById(UUID curriculumId, UUID competencyId, UUID id)
      throws ResourceNotFoundException {
    Standard std = findValidatedStandard(curriculumId, competencyId, id);
    return toDto(std);
  }

  @Override
  @Transactional
  public StandardResponse update(UUID curriculumId, UUID competencyId, UUID id, StandardRequest request)
      throws ResourceNotFoundException {
    Standard std = findValidatedStandard(curriculumId, competencyId, id);
    std.setName(request.getName());
    std.setDescription(request.getDescription());
    std.setCode(request.getCode());
    return toDto(standardRepo.save(std));
  }

  @Override
  @Transactional
  public void delete(UUID curriculumId, UUID competencyId, UUID id)
      throws ResourceNotFoundException {
    Standard std = findValidatedStandard(curriculumId, competencyId, id);

    // Desactivación manual de los learning objectives
    for (LearningObjective lo : std.getLearningObjectives()) {
      learningObjectiveService.delete(curriculumId, competencyId, std.getId(), lo.getId());
    }

    standardRepo.delete(std); // soft-delete con @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID curriculumId, UUID competencyId, UUID id)
      throws ResourceNotFoundException {
    Standard std = standardRepo
        .findIncludingInactiveByIdAndCompetencyId(id, competencyId)
        .filter(s -> s.getCompetency().getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", id));

    std.setActive(true);
    std.setDeletedAt(null);
    std.setUpdatedAt(LocalDateTime.now());
    standardRepo.save(std);

    // Reactivar los learning objectives asociados
    std.getLearningObjectives()
        .forEach(lo -> learningObjectiveService.reactivate(curriculumId, competencyId, id, lo.getId()));
  }

  // 🔒 Métodos privados de apoyo
  private Standard findValidatedStandard(UUID curriculumId, UUID competencyId, UUID id) {
    return standardRepo
        .findByIdAndCompetencyId(id, competencyId)
        .filter(s -> s.getCompetency().getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", id));
  }

  private void validateCompetencyInCurriculum(UUID curriculumId, UUID competencyId) {
    competencyRepo.findById(competencyId)
        .filter(c -> c.getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", competencyId));
  }

  private StandardResponse toDto(Standard s) {
    return StandardResponse.builder()
        .id(s.getId())
        .name(s.getName())
        .description(s.getDescription())
        .code(s.getCode())
        .competencyId(s.getCompetency().getId())
        .competencyName(s.getCompetency().getName())
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .active(s.getActive())
        .build();
  }
}
