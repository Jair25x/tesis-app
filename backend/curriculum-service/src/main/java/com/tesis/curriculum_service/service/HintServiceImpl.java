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
  public HintResponse create(UUID exerciseId, HintRequest req) {
    Exercise ex = exerciseRepo.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise", "id", exerciseId));

    Hint saved = hintRepo.save(Hint.builder()
        .hintText(req.getHintText())
        .cost(req.getCost())
        .exercise(ex)
        .build());

    return toDto(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public List<HintResponse> getAllByExercise(UUID exerciseId) {
    verifyExerciseExists(exerciseId);
    return hintRepo.findByExerciseIdOrderByCostAsc(exerciseId)
        .stream().map(this::toDto).toList();
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
  public HintResponse update(UUID exerciseId, UUID id, HintRequest req) {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));

    hint.setHintText(req.getHintText());
    hint.setCost(req.getCost());
    return toDto(hintRepo.save(hint));
  }

  @Override
  @Transactional
  public void delete(UUID exerciseId, UUID id) {
    Hint hint = hintRepo.findByIdAndExerciseId(id, exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Hint", "id", id));
    hintRepo.delete(hint); // gracias a @SQLDelete → soft-delete
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

  /* helpers */
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
        .build();
  }
}
