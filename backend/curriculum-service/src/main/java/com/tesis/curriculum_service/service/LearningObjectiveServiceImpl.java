// src/main/java/com/tesis/curriculum_service/service/LearningObjectiveServiceImpl.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository;
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
 * Implementación de {@link LearningObjectiveService} usando JPA.
 * Soporta soft‐delete y reactivación en cascada.
 */
@Service
@RequiredArgsConstructor
public class LearningObjectiveServiceImpl implements LearningObjectiveService {

  private final LearningObjectiveRepository loRepo;
  private final StandardRepository standardRepo;
  private final CompetencyRepository compRepo;

  @Override
  @Transactional
  public LearningObjectiveResponse create(UUID competencyId,
      UUID standardId,
      LearningObjectiveRequest req)
      throws ResourceNotFoundException {
    // 1) Verificar Competency
    Competency comp = compRepo.findById(competencyId)
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", competencyId));

    // 2) Verificar Standard dentro de esa Competency
    Standard std = standardRepo.findById(standardId)
        .filter(s -> s.getCompetency().getId().equals(competencyId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", standardId));

    // 3) Mapear y guardar
    LearningObjective lo = LearningObjective.builder()
        .name(req.getName())
        .description(req.getDescription())
        .code(req.getCode())
        .standard(std)
        .build();
    LearningObjective saved = loRepo.save(lo);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getAllByStandard(UUID competencyId,
      UUID standardId)
      throws ResourceNotFoundException {
    // Validar existencia de Standard bajo Competency
    if (!compRepo.existsById(competencyId) ||
        !standardRepo.findById(standardId)
            .filter(s -> s.getCompetency().getId().equals(competencyId))
            .isPresent()) {
      throw new ResourceNotFoundException("Standard", "id", standardId);
    }
    return loRepo.findByStandardId(standardId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public LearningObjectiveResponse getById(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException {
    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .filter(o -> o.getStandard().getCompetency().getId().equals(competencyId))
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));
    return toDto(lo);
  }

  @Override
  @Transactional
  public LearningObjectiveResponse update(UUID competencyId,
      UUID standardId,
      UUID id,
      LearningObjectiveRequest req)
      throws ResourceNotFoundException {
    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .filter(o -> o.getStandard().getCompetency().getId().equals(competencyId))
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    lo.setName(req.getName());
    lo.setDescription(req.getDescription());
    lo.setCode(req.getCode());
    // updatedAt se actualiza en @PreUpdate
    LearningObjective updated = loRepo.save(lo);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException {
    LearningObjective lo = loRepo.findByIdAndStandardId(id, standardId)
        .filter(o -> o.getStandard().getCompetency().getId().equals(competencyId))
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));
    // Hibernate aplicará soft-delete (@SQLDelete)
    loRepo.delete(lo);
  }

  @Override
  @Transactional
  public void reactivate(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException {
    LearningObjective lo = loRepo.findIncludingInactiveByIdAndStandardId(id, standardId)
        .filter(o -> o.getStandard().getCompetency().getId().equals(competencyId))
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", id));

    lo.setActive(true);
    lo.setDeletedAt(null);
    lo.setUpdatedAt(LocalDateTime.now());
    loRepo.save(lo);
  }

  // ----------------------------
  // Mapeo entidad → DTO
  // ----------------------------
  private LearningObjectiveResponse toDto(LearningObjective lo) {
    return LearningObjectiveResponse.builder()
        .id(lo.getId())
        .name(lo.getName())
        .description(lo.getDescription())
        .code(lo.getCode())
        .createdAt(lo.getCreatedAt())
        .updatedAt(lo.getUpdatedAt())
        .active(lo.getActive())
        .build();
  }
}
