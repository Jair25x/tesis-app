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

/**
 * Implementación del servicio {@link HintService} usando HintRepository con SQL
 * nativo y auditoría.
 */
@Service
@RequiredArgsConstructor
public class HintServiceImpl implements HintService {

  private final HintRepository hintRepo;
  private final ExerciseRepository exerciseRepo;

  @Override
  @Transactional
  public HintResponse create(UUID exerciseId, HintRequest request) {
    Exercise exercise = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    Hint hint = Hint.builder()
        .hintText(request.getHintText())
        .cost(request.getCost())
        .exercise(exercise)
        .build();

    return toDto(hintRepo.save(hint));
  }

  @Override
  @Transactional(readOnly = true)
  public List<HintResponse> getAllByExercise(UUID exerciseId) {
    verifyExerciseExists(exerciseId);
    return hintRepo.findActiveByExerciseId(exerciseId)
        .stream()
        .map(this::toDto)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<HintResponse> getAllIncludingInactive(UUID exerciseId) {
    verifyExerciseExists(exerciseId);
    return hintRepo.findAllByExerciseId(exerciseId)
        .stream()
        .map(this::toDto)
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public HintResponse getById(UUID exerciseId, UUID id) {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));
    return toDto(hint);
  }

  @Override
  @Transactional
  public HintResponse update(UUID exerciseId, UUID id, HintRequest request) {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));

    hint.setHintText(request.getHintText());
    hint.setCost(request.getCost());

    return toDto(hintRepo.save(hint));
  }

  @Override
  @Transactional
  public void delete(UUID exerciseId, UUID id) {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));
    hintRepo.delete(hint); // soft-delete con @SQLDelete
  }

  @Override
  @Transactional
  public void reactivate(UUID exerciseId, UUID id) {
    Hint hint = hintRepo.findByIdIncludingInactive(id)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));

    if (!hint.getExercise().getId().equals(exerciseId)) {
      throw new ResourceNotFoundException("Hint", "exerciseId", exerciseId);
    }

    hint.setActive(true);
    hint.setDeletedAt(null);
    hint.setUpdatedAt(LocalDateTime.now());
    hintRepo.save(hint);
  }

  // ------------------ Helpers ------------------

  private void verifyExerciseExists(UUID exerciseId) {
    if (!exerciseRepo.existsById(exerciseId)) {
      throw new ResourceNotFoundException("Exercise", "id", exerciseId);
    }
  }

  private HintResponse toDto(Hint h) {
    return HintResponse.builder()
        .id(h.getId())
        .hintText(h.getHintText())
        .cost(h.getCost())
        .exerciseId(h.getExercise().getId())
        .createdAt(h.getCreatedAt())
        .updatedAt(h.getUpdatedAt())
        .active(h.getActive())
        .deletedAt(h.getDeletedAt())
        .createdBy(h.getCreatedBy())
        .updatedBy(h.getUpdatedBy())
        .deletedBy(h.getDeletedBy())
        .build();
  }
}
