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
 * Implementación del servicio de pasos de solución.
 * Incluye CRUD, soft-delete, reactivación y auditoría.
 */
@Service
@RequiredArgsConstructor
public class SolutionStepServiceImpl implements SolutionStepService {

  private final SolutionStepRepository stepRepo;
  private final ExerciseRepository exerciseRepo;

  @Override
  @Transactional
  public SolutionStepResponse create(UUID exerciseId, SolutionStepRequest request) {
    Exercise exercise = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    SolutionStep step = SolutionStep.builder()
        .stepNumber(request.getStepNumber())
        .explanation(request.getExplanation())
        .exercise(exercise)
        .build();

    SolutionStep saved = stepRepo.save(step);
    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<SolutionStepResponse> getAllByExercise(UUID exerciseId) {
    if (!exerciseRepo.existsById(exerciseId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }

    return stepRepo.findActiveByExerciseId(exerciseId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public List<SolutionStepResponse> getAllIncludingInactive(UUID exerciseId) {
    if (!exerciseRepo.existsById(exerciseId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }

    return stepRepo.findAllByExerciseId(exerciseId).stream()
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
  public SolutionStepResponse update(UUID exerciseId, UUID id, SolutionStepRequest request) {
    SolutionStep step = stepRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));

    step.setStepNumber(request.getStepNumber());
    step.setExplanation(request.getExplanation());

    SolutionStep updated = stepRepo.save(step);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID exerciseId, UUID id) {
    SolutionStep step = stepRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));
    stepRepo.delete(step); // soft-delete activado con @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID exerciseId, UUID id) {
    SolutionStep step = stepRepo.findIncludingInactiveByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("SolutionStep", "id", id));

    step.setActive(true);
    step.setDeletedAt(null);
    step.setDeletedBy(null);
    step.setUpdatedAt(LocalDateTime.now());

    stepRepo.save(step);
  }

  // --------------------------------------------------
  // Helper para mapear entidad a DTO
  // --------------------------------------------------
  private SolutionStepResponse toDto(SolutionStep s) {
    return SolutionStepResponse.builder()
        .id(s.getId())
        .stepNumber(s.getStepNumber())
        .explanation(s.getExplanation())
        .exerciseId(s.getExercise().getId())
        .createdAt(s.getCreatedAt())
        .updatedAt(s.getUpdatedAt())
        .active(s.getActive())
        .deletedAt(s.getDeletedAt())
        .createdBy(s.getCreatedBy())
        .updatedBy(s.getUpdatedBy())
        .deletedBy(s.getDeletedBy())
        .build();
  }
}
