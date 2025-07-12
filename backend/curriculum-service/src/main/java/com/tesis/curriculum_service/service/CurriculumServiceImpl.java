package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
   * Recupera todos los currículos activos.
   */
  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getAll() {
    return repository.findAll().stream()
        .map(this::toDto)
        .collect(Collectors.toList());
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
    Curriculum entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));
    repository.delete(entity); // aplica soft-delete @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID id) {
    // 1) Recupera incluso los soft-deleted (puedes usar tu repositorio o un método
    // custom)
    Curriculum entity = repository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Curriculum", "id", id));
    // 2) Reactiva el registro
    entity.setActive(true);
    entity.setDeletedAt(null);
    // 3) Persiste el cambio
    repository.save(entity);
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
        .build();
  }
}
