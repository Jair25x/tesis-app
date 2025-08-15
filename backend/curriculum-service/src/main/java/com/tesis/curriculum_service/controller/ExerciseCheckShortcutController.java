package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.service.ExerciseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Exercises (shortcut)", description = "Ruta corta para validar respuestas por exerciseId")
@RestController
@RequestMapping("/api/curricula/exercises")
@RequiredArgsConstructor
public class ExerciseCheckShortcutController {

  private final ExerciseRepository exerciseRepository;
  private final ExerciseService exerciseService;
  private final ObjectMapper objectMapper;

  @Operation(summary = "Verificar respuesta por exerciseId (ruta corta)")
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
  @PostMapping("/{exerciseId}/check")
  public ResponseEntity<CheckAnswerResponse> checkByExerciseId(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody Map<String, Object> body) throws ResourceNotFoundException {

    Exercise ex = exerciseRepository.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

    var lo = ex.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    Object answerRaw = body.getOrDefault("answer", Map.of());
    JsonNode answerNode = objectMapper.valueToTree(answerRaw);

    CheckAnswerRequest req = CheckAnswerRequest.builder()
        .answer(answerNode)
        .build();

    CheckAnswerResponse result = exerciseService.checkAnswer(
        cur.getId(), comp.getId(), std.getId(), lo.getId(), ex.getId(), req);

    return ResponseEntity.ok(result);
  }
}
