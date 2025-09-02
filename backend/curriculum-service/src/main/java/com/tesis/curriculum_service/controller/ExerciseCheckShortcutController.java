package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseResponse;
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

@Tag(name = "Exercises (shortcut)", description = "Ruta corta por exerciseId para runtime (GET y CHECK)")
@RestController
@RequestMapping("/api/curricula/exercises")
@RequiredArgsConstructor
public class ExerciseCheckShortcutController {

  private final ExerciseRepository exerciseRepository;
  private final ExerciseService exerciseService;
  private final ObjectMapper objectMapper;

  @Operation(summary = "Obtener ejercicio por ID (vista student). Soporta ?mode=exam o header X-Exam-Mode")
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{exerciseId}")
  public ResponseEntity<ExerciseResponse> getByExerciseId(
      @PathVariable UUID exerciseId,
      @RequestParam(name = "mode", required = false, defaultValue = "normal") String mode,
      @RequestHeader(name = "X-Exam-Mode", required = false) String examHeader) throws ResourceNotFoundException {

    boolean examMode = "exam".equalsIgnoreCase(mode) || (examHeader != null && !examHeader.isBlank());
    ExerciseResponse resp = exerciseService.getByIdFlat(exerciseId, examMode);
    return ResponseEntity.ok(resp);
  }

  @Operation(summary = "Verificar respuesta por exerciseId (ruta corta) [público]")
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

    // Esperamos { "answer": ... } ; si no viene, se usa {} (evita NPE)
    JsonNode answerNode = objectMapper.valueToTree(body.getOrDefault("answer", Map.of()));

    CheckAnswerRequest req = CheckAnswerRequest.builder()
        .answer(answerNode)
        .build();

    CheckAnswerResponse result = exerciseService.checkAnswer(
        cur.getId(), comp.getId(), std.getId(), lo.getId(), ex.getId(), req);

    return ResponseEntity.ok(result);
  }
}
