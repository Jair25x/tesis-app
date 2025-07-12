// src/main/java/com/tesis/curriculum_service/service/ExerciseServiceImpl.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.ExerciseRequest;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.SolutionStep;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link ExerciseService} usando JPA.
 */
@Service
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

  private final ExerciseRepository exerciseRepo;
  private final LearningObjectiveRepository loRepo;

  @Override
  @Transactional
  public ExerciseResponse create(UUID loId, ExerciseRequest req) {
    // 1. Verificar existencia del LearningObjective
    LearningObjective lo = loRepo.findById(loId)
        .orElseThrow(() -> new ResourceNotFoundException("LearningObjective", "id", loId));

    // 2. Construir y guardar la entidad
    Exercise ex = Exercise.builder()
        .statement(req.getStatement())
        .difficulty(req.getDifficulty())
        .type(req.getType())
        .learningObjective(lo)
        .build();
    Exercise saved = exerciseRepo.save(ex);

    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ExerciseResponse> getAllByLearningObjective(UUID loId) {
    // Verifica LO
    if (!loRepo.existsById(loId)) {
      throw new ResourceNotFoundException("LearningObjective", "id", loId);
    }
    return exerciseRepo.findByLearningObjectiveId(loId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public ExerciseResponse getById(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    return toDto(ex);
  }

  @Override
  @Transactional
  public ExerciseResponse update(UUID loId, UUID id, ExerciseRequest req) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    ex.setStatement(req.getStatement());
    ex.setDifficulty(req.getDifficulty());
    ex.setType(req.getType());
    // updatedAt se fija en @PreUpdate
    Exercise updated = exerciseRepo.save(ex);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdAndLearningObjectiveId(id, loId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    exerciseRepo.delete(ex); // soft-delete
  }

  @Override
  @Transactional
  public void reactivate(UUID loId, UUID id) {
    Exercise ex = exerciseRepo.findByIdIncludingInactive(id)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", id));
    // Solo si pertenece al LO correcto
    if (!ex.getLearningObjective().getId().equals(loId)) {
      throw new ResourceNotFoundException("Exercise", "id", id);
    }
    ex.setActive(true);
    ex.setDeletedAt(null);
    ex.setUpdatedAt(LocalDateTime.now());
    exerciseRepo.save(ex);
  }

  // --------------------------------------------------
  // Map de entidad → DTO
  // --------------------------------------------------
  private ExerciseResponse toDto(Exercise e) {
    return ExerciseResponse.builder()
        .id(e.getId())
        .statement(e.getStatement())
        .difficulty(e.getDifficulty())
        .type(e.getType())
        .learningObjectiveId(e.getLearningObjective().getId())
        .solutionSteps(
            e.getSolutionSteps().stream()
                .sorted(Comparator.comparingInt(SolutionStep::getStepNumber)) // opcional: asegurar orden
                .map(ss -> SolutionStepResponse.builder()
                    .id(ss.getId())
                    .stepNumber(ss.getStepNumber())
                    .explanation(ss.getExplanation())
                    .createdAt(ss.getCreatedAt())
                    .updatedAt(ss.getUpdatedAt())
                    .build())
                .collect(Collectors.toList()))
        .hints(
            e.getHints().stream()
                .map(h -> HintResponse.builder()
                    .id(h.getId())
                    .hintText(h.getHintText())
                    .cost(h.getCost())
                    .createdAt(h.getCreatedAt())
                    .updatedAt(h.getUpdatedAt())
                    .build())
                .collect(Collectors.toList()))
        .createdAt(e.getCreatedAt())
        .updatedAt(e.getUpdatedAt())
        .active(e.getActive())
        .build();
  }
}
