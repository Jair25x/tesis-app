package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.service.ExerciseService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Endpoints S2S SOLO para microservicios (no para usuarios finales).
 * Ruta separada /internal/** para poder bloquear desde gateway/firewall.
 */
@Hidden
@RestController
@RequestMapping("/internal/curricula/exercises")
@RequiredArgsConstructor
public class InternalExerciseController {

  private final ExerciseRepository exerciseRepository;
  private final ExerciseService exerciseService;
  private final ObjectMapper objectMapper;

  @Operation(summary = "[INTERNAL] Verificar respuesta por exerciseId (S2S)")
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping("/{exerciseId}/check")
  public ResponseEntity<CheckAnswerResponse> checkInternal(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody Map<String, Object> body) throws ResourceNotFoundException {

    Exercise ex = exerciseRepository.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

    var lo = ex.getLearningObjective();
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    JsonNode answerNode = objectMapper.valueToTree(body.getOrDefault("answer", Map.of()));

    CheckAnswerRequest req = CheckAnswerRequest.builder()
        .answer(answerNode)
        .build();

    CheckAnswerResponse result = exerciseService.checkAnswer(
        cur.getId(), comp.getId(), std.getId(), lo.getId(), ex.getId(), req);

    return ResponseEntity.ok(result);
  }
}
