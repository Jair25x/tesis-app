package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.StandardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link StandardService} usando JPA.
 */
@Service
@RequiredArgsConstructor
public class StandardServiceImpl implements StandardService {

  private final StandardRepository standardRepo;
  private final CompetencyRepository competencyRepo;

  @Override
  @Transactional
  public StandardResponse create(UUID curriculumId, UUID competencyId, StandardRequest request)
      throws ResourceNotFoundException {
    // Validamos Competency dentro del Curriculum
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

    Standard saved = standardRepo.save(std);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllByCompetency(UUID curriculumId, UUID competencyId)
      throws ResourceNotFoundException {
    // Validamos Competency dentro del Curriculum
    if (!competencyRepo.existsById(competencyId)
        || !competencyRepo.findById(competencyId)
            .filter(c -> c.getCurriculum().getId().equals(curriculumId))
            .isPresent()) {
      throw new ResourceNotFoundException("Competency", "id", competencyId);
    }
    return standardRepo.findByCompetencyId(competencyId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public StandardResponse getById(UUID curriculumId, UUID competencyId, UUID id)
      throws ResourceNotFoundException {
    Standard std = standardRepo
        .findByIdAndCompetencyId(id, competencyId)
        .filter(s -> s.getCompetency().getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", id));
    return toDto(std);
  }

  @Override
  @Transactional
  public StandardResponse update(UUID curriculumId, UUID competencyId, UUID id, StandardRequest request)
      throws ResourceNotFoundException {
    // Validación análoga a getById
    Standard std = standardRepo
        .findByIdAndCompetencyId(id, competencyId)
        .filter(s -> s.getCompetency().getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", id));

    std.setName(request.getName());
    std.setDescription(request.getDescription());
    std.setCode(request.getCode());
    Standard updated = standardRepo.save(std);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID curriculumId, UUID competencyId, UUID id)
      throws ResourceNotFoundException {
    Standard std = standardRepo
        .findByIdAndCompetencyId(id, competencyId)
        .filter(s -> s.getCompetency().getCurriculum().getId().equals(curriculumId))
        .orElseThrow(() -> new ResourceNotFoundException("Standard", "id", id));

    standardRepo.delete(std); // soft-delete via @SQLDelete
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
