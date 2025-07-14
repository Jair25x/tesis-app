package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de CompetencyService usando JPA.
 * Soporta soft-delete en cascada (standards + learning objectives)
 * y reactivación en cascada.
 */
@Service
@RequiredArgsConstructor
public class CompetencyServiceImpl implements CompetencyService {

  private final CompetencyRepository competencyRepo;
  private final CurriculumRepository curriculumRepo;
  private final StandardService standardService;

  @Override
  @Transactional
  public CompetencyResponse create(UUID curriculumId, CompetencyRequest req) {
    // Validamos y recuperamos el Curriculum
    Curriculum curriculum = curriculumRepo.findById(curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", curriculumId));

    Competency c = Competency.builder()
        .name(req.getName())
        .description(req.getDescription())
        .code(req.getCode())
        .curriculum(curriculum)
        .build();

    Competency saved = competencyRepo.save(c);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<CompetencyResponse> getAllByCurriculum(UUID curriculumId) {
    // Verificamos existencia de Curriculum
    if (!curriculumRepo.existsById(curriculumId)) {
      throw new ResourceNotFoundException("Curriculum", "id", curriculumId);
    }
    return competencyRepo.findByCurriculumId(curriculumId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CompetencyResponse getById(UUID curriculumId, UUID id) {
    Competency c = competencyRepo
        .findByIdAndCurriculumId(id, curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", id));
    return toDto(c);
  }

  @Override
  @Transactional
  public CompetencyResponse update(UUID curriculumId, UUID id, CompetencyRequest req) {
    Competency c = competencyRepo
        .findByIdAndCurriculumId(id, curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", id));

    c.setName(req.getName());
    c.setDescription(req.getDescription());
    c.setCode(req.getCode());
    Competency updated = competencyRepo.save(c);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID curriculumId, UUID id) {
    Competency c = competencyRepo
        .findByIdAndCurriculumId(id, curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", id));

    // Borrado lógico en cascada de estándares (y sus learning objectives)
    c.getStandards().forEach(std -> standardService.delete(curriculumId, c.getId(), std.getId()));
    competencyRepo.delete(c);
  }

  @Override
  @Transactional
  public void reactivate(UUID curriculumId, UUID competencyId) {
    // 1. Reactivar la Competency (inactiva)
    Competency c = competencyRepo
        .findIncludingInactiveByIdAndCurriculumId(competencyId, curriculumId)
        .orElseThrow(() -> new ResourceNotFoundException("Competency", "id", competencyId));

    c.setActive(true);
    c.setDeletedAt(null);
    competencyRepo.save(c);

    // 2. Reactivar en cascada cada Standard
    c.getStandards().forEach(std -> standardService.reactivate(curriculumId, competencyId, std.getId()));
  }

  // --------------------------------------------------
  // Mapeo interno: entidad → DTO
  // --------------------------------------------------
  private CompetencyResponse toDto(Competency c) {
    return CompetencyResponse.builder()
        .id(c.getId())
        .name(c.getName())
        .description(c.getDescription())
        .code(c.getCode())
        .curriculumId(c.getCurriculum() != null ? c.getCurriculum().getId() : null)
        .createdAt(c.getCreatedAt())
        .updatedAt(c.getUpdatedAt())
        .active(c.getActive())
        .build();
  }
}
