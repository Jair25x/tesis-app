package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
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

  @Operation(summary = "Verificar respuesta por exerciseId (ruta corta)")
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
  @PostMapping("/{exerciseId}/check")
  public ResponseEntity<CheckAnswerResponse> checkByExerciseId(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody Map<String, Object> body) throws ResourceNotFoundException {

    CheckAnswerRequest req = buildCheckAnswerRequest(objectMapper, body);

    CheckAnswerResponse result = exerciseService.checkAnswerByExerciseId(exerciseId, req);

    return ResponseEntity.ok(result);
  }

  private CheckAnswerRequest buildCheckAnswerRequest(ObjectMapper mapper, Map<String, Object> body) {
    Object rawAnswer = body.get("answer");
    JsonNode answerNode = (rawAnswer != null)
        ? mapper.valueToTree(rawAnswer)
        : mapper.valueToTree(body);

    return CheckAnswerRequest.builder()
        .answer(answerNode)
        .build();
  }
}
