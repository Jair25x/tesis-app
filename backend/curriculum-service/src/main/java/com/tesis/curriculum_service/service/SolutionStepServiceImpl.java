// src/main/java/com/tesis/curriculum_service/service/SolutionStepServiceImpl.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.SolutionStepRequest;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.SolutionStep;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.SolutionStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link SolutionStepService} usando JPA.
 * Soporta soft-delete y reactivación.
 */
@Service
@RequiredArgsConstructor
public class SolutionStepServiceImpl implements SolutionStepService {

  private final SolutionStepRepository stepRepo;
  private final ExerciseRepository exerciseRepo;

  @Override
  @Transactional
  public SolutionStepResponse create(UUID exerciseId, SolutionStepRequest req) {
    // 1. Validar existencia de ejercicio
    Exercise ex = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    // 2. Construir y guardar
    SolutionStep step = SolutionStep.builder()
        .stepNumber(req.getStepNumber())
        .explanation(req.getExplanation())
        .exercise(ex)
        .build();

    SolutionStep saved = stepRepo.save(step);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<SolutionStepResponse> getAllByExercise(UUID exerciseId) {
    // Verificar ejercicio
    if (!exerciseRepo.existsById(exerciseId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }
    return stepRepo.findByExerciseIdOrderByStepNumberAsc(exerciseId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public SolutionStepResponse getById(UUID exerciseId, UUID id) {
    SolutionStep step = stepRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));
    return toDto(step);
  }

  @Override
  @Transactional
  public SolutionStepResponse update(UUID exerciseId, UUID id, SolutionStepRequest req) {
    SolutionStep step = stepRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));

    step.setStepNumber(req.getStepNumber());
    step.setExplanation(req.getExplanation());
    // updatedAt se fija en @PreUpdate
    SolutionStep updated = stepRepo.save(step);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID exerciseId, UUID id) {
    SolutionStep step = stepRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));
    stepRepo.delete(step); // soft-delete via @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID exerciseId, UUID id) {
    // Permite recuperar registros inactivos
    SolutionStep step = stepRepo.findIncludingInactiveByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));

    step.setActive(true);
    step.setDeletedAt(null);
    step.setUpdatedAt(LocalDateTime.now());
    stepRepo.save(step);
  }

  // --------------------------------------------------
  // Helper: entidad → DTO
  // --------------------------------------------------
  private SolutionStepResponse toDto(SolutionStep s) {
    return SolutionStepResponse.builder()
        .id(s.getId())
        .stepNumber(s.getStepNumber())
        .explanation(s.getExplanation())
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .build();
  }
}
