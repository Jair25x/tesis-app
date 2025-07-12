package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.HintRequest;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.Hint;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.HintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación de {@link HintService} usando JPA.
 */
@Service
@RequiredArgsConstructor
public class HintServiceImpl implements HintService {

  private final HintRepository hintRepo;
  private final ExerciseRepository exerciseRepo;

  @Override
  @Transactional
  public HintResponse create(UUID exerciseId, HintRequest request) throws ResourceNotFoundException {
    // 1. Validar existencia del ejercicio
    Exercise exercise = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    // 2. Construir y persistir la nueva pista
    Hint hint = Hint.builder()
        .hintText(request.getHintText())
        .cost(request.getCost())
        .exercise(exercise)
        .build();
    Hint saved = hintRepo.save(hint);

    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<HintResponse> getAllByExercise(UUID exerciseId) throws ResourceNotFoundException {
    // Verificar que el ejercicio exista
    if (!exerciseRepo.existsById(exerciseId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }
    return hintRepo.findByExerciseId(exerciseId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public HintResponse getById(UUID exerciseId, UUID id) throws ResourceNotFoundException {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));
    return toDto(hint);
  }

  @Override
  @Transactional
  public HintResponse update(UUID exerciseId, UUID id, HintRequest request) throws ResourceNotFoundException {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));

    hint.setHintText(request.getHintText());
    hint.setCost(request.getCost());
    // updatedAt no existe en el modelo; si lo añadieras, se actualiza en @PreUpdate
    Hint updated = hintRepo.save(hint);
    return toDto(updated);
  }

  @Override
  @Transactional
  public void delete(UUID exerciseId, UUID id) throws ResourceNotFoundException {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));
    hintRepo.delete(hint);
  }

  // --------------------------------------------------
  // Mapeo interno: entidad → DTO
  // --------------------------------------------------
  private HintResponse toDto(Hint h) {
    return HintResponse.builder()
        .id(h.getId())
        .hintText(h.getHintText())
        .cost(h.getCost())
        .exerciseId(h.getExercise().getId())
        .createdAt(h.getCreatedAt())
        .updatedAt(h.getUpdatedAt())
        .build();
  }
}
