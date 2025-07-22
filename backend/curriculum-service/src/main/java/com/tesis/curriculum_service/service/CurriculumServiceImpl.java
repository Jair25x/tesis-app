package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumFullResponse;
import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.exception.BadRequestException;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import com.tesis.curriculum_service.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link CurriculumService} usando JPA.
 * Implementa CRUD con borrado lógico (soft-delete).
 */
@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {

  private final CurriculumRepository repository;

  /**
   * Crea un nuevo currículo y devuelve su DTO.
   */
  @Override
  @Transactional
  public CurriculumResponse create(CurriculumRequest request) {
    Curriculum entity = Curriculum.builder()
        .code(request.getCode())
        .name(request.getName())
        .description(request.getDescription())
        .grade(request.getGrade())
        .build();

    Curriculum saved = repository.save(entity);
    return toDto(saved);
  }

  /**
   * Recupera todos los currículos activos e inactivas.
   */
  public List<CurriculumResponse> getAll(String filter) {
    List<Curriculum> list;

    switch (filter.toLowerCase()) {
      case "active" -> list = repository.findAllActive();
      case "inactive" -> list = repository.findAllInactive();
      default -> list = repository.findAllIncludingInactive(); // incluye todos
    }

    return list.stream()
        .sorted(Comparator.comparing(Curriculum::getActive).reversed()) // activos primero
        .map(this::toDto)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getAllIncludingInactive() {
    return repository.findAllIncludingInactive().stream()
        .map(this::toDto)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getAllActive() {
    return repository.findAllActive().stream()
        .map(this::toDto)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getAllInactive() {
    return repository.findAllInactive().stream()
        .map(this::toDto)
        .toList();
  }

  /**
   * Recupera un currículo por ID o lanza ResourceNotFoundException.
   */
  @Override
  @Transactional(readOnly = true)
  public CurriculumResponse getById(UUID id) {
    Curriculum entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));
    return toDto(entity);
  }

  /**
   * Actualiza un currículo existente o lanza ResourceNotFoundException.
   */
  @Override
  @Transactional
  public CurriculumResponse update(UUID id, CurriculumRequest request) {
    Curriculum entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));

    entity.setCode(request.getCode());
    entity.setName(request.getName());
    entity.setDescription(request.getDescription());
    entity.setGrade(request.getGrade());
    // updatedAt se actualiza vía @PreUpdate en la entidad

    Curriculum updated = repository.save(entity);
    return toDto(updated);
  }

  /**
   * Borra lógicamente un currículo o lanza ResourceNotFoundException.
   */
  @Override
  @Transactional
  public void delete(UUID id) {
    Curriculum entity = repository.findIncludingInactiveById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));

    // Asignar el usuario que realiza la eliminación lógica
    entity.setDeletedBy(SecurityUtils.getCurrentUsername().orElse("system"));

    // Guardamos el estado con deletedBy antes de ejecutar el soft-delete
    repository.save(entity);

    // Ejecuta el @SQLDelete → active = false, deleted_at = now
    repository.delete(entity);
  }

  @Override
  @Transactional
  public void reactivate(UUID id) {
    Curriculum curriculum = repository.findIncludingInactiveById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));

    if (Boolean.TRUE.equals(curriculum.getActive())) {
      throw new BadRequestException("El currículo ya está activo.");
    }

    curriculum.setActive(true);
    curriculum.setDeletedAt(null);
    repository.save(curriculum); // Actualiza estado
  }

  @Override
  @Transactional(readOnly = true)
  public CurriculumFullResponse getCurriculumFull(UUID id) {
    Curriculum cur = repository.findFullById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));

    return CurriculumFullResponse.builder()
        .id(cur.getId())
        .code(cur.getCode())
        .name(cur.getName())
        .description(cur.getDescription())
        .grade(cur.getGrade())
        .competencies(cur.getCompetencies().stream().map(comp -> CurriculumFullResponse.CompetencyNode.builder()
            .id(comp.getId())
            .code(comp.getCode())
            .name(comp.getName())
            .standards(comp.getStandards().stream().map(std -> CurriculumFullResponse.StandardNode.builder()
                .id(std.getId())
                .code(std.getCode())
                .name(std.getName())
                .learningObjectives(std.getLearningObjectives().stream()
                    .map(lo -> CurriculumFullResponse.LearningObjectiveNode.builder()
                        .id(lo.getId())
                        .code(lo.getCode())
                        .name(lo.getName())
                        .exercises(lo.getExercises().stream().map(ex -> CurriculumFullResponse.ExerciseLeaf.builder()
                            .id(ex.getId())
                            .statement(ex.getStatement())
                            .difficulty(ex.getDifficulty().name())
                            .build()).toList())
                        .build())
                    .toList())
                .build()).toList())
            .build()).toList())
        .build();
  }

  // ——————————————————————————————————————————————————————————————
  // Mapeo interno: entidad → DTO
  // ——————————————————————————————————————————————————————————————
  private CurriculumResponse toDto(Curriculum c) {
    return CurriculumResponse.builder()
        .id(c.getId())
        .code(c.getCode())
        .name(c.getName())
        .description(c.getDescription())
        .grade(c.getGrade())
        .createdAt(c.getCreatedAt())
        .updatedAt(c.getUpdatedAt())
        .active(c.getActive())
        .createdBy(c.getCreatedBy())
        .updatedBy(c.getUpdatedBy())
        .deletedBy(c.getDeletedBy())
        .deletedAt(c.getDeletedAt())
        .build();
  }
}
