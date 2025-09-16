// src/main/java/com/tesis/curriculum_service/controller/InternalExerciseLookupController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Hidden
@RestController
@RequestMapping("/internal/curricula/exercises")
@RequiredArgsConstructor
public class InternalExerciseLookupController {

  private final ExerciseRepository exerciseRepository;

  public record ExerciseLite(UUID id, String difficulty) {
  }

  @Operation(summary = "[INTERNAL] Lookup de ejercicios por IDs (id + difficulty)")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/lookup")
  public ResponseEntity<List<ExerciseLite>> lookupByIds(@RequestParam @NotBlank String ids) {
    // ids = "uuid,uuid,uuid"
    List<UUID> list = Arrays.stream(ids.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(UUID::fromString)
        .distinct()
        .limit(200) // hard limit para evitar abusos
        .toList();

    if (list.isEmpty())
      return ResponseEntity.ok(List.of());

    List<Exercise> found = exerciseRepository.findAllById(list);

    List<ExerciseLite> out = found.stream()
        .map(e -> new ExerciseLite(e.getId(), e.getDifficulty() == null ? null : e.getDifficulty().name()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(out);
  }
}
