package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseDetailInternalResponse;
import com.tesis.curriculum_service.dto.ExerciseMetaInternalResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.Hint;
import com.tesis.curriculum_service.model.SolutionStep;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.service.ExerciseService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

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

  // ============ NUEVO: detalle para RAG ============
  @Operation(summary = "[INTERNAL] Metadatos jerárquicos del ejercicio (S2S)")
  @PreAuthorize("hasRole('INTERNAL')")
  @Transactional(readOnly = true)
  @GetMapping("/{exerciseId}/meta")
  public ResponseEntity<ExerciseMetaInternalResponse> metaInternal(@PathVariable UUID exerciseId) {

    // Incluye inactivos para soportar intentos históricos
    Exercise ex = exerciseRepository.findByIdIncludingInactive(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

    var lo = ex.getLearningObjective();
    if (lo == null) {
      // Inconsistencia fuerte en datos; mejor fallar
      throw new ResourceNotFoundException("LearningObjective", "exerciseId", exerciseId);
    }
    var std = lo.getStandard();
    var comp = std.getCompetency();
    var cur = comp.getCurriculum();

    ExerciseMetaInternalResponse dto = new ExerciseMetaInternalResponse(
        ex.getId(),
        lo.getId(),
        std.getId(),
        comp.getId(),
        cur.getId(),
        ex.getDifficulty() != null ? ex.getDifficulty().name() : null,
        ex.getActive(),
        ex.isDiagnostic());

    return ResponseEntity.ok(dto);
  }

  @Operation(summary = "[INTERNAL] Detalle para RAG: enunciado plano + hints + pasos (S2S)")
  @PreAuthorize("hasRole('INTERNAL')")
  @Transactional(readOnly = true)
  @GetMapping("/{exerciseId}/detail")
  public ResponseEntity<ExerciseDetailInternalResponse> detailInternal(
      @PathVariable UUID exerciseId) throws ResourceNotFoundException {

    Exercise ex = exerciseRepository.findById(exerciseId)
        .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

    UUID objectiveId = (ex.getLearningObjective() != null) ? ex.getLearningObjective().getId() : null;
    String difficulty = mapDifficultyToAdvisor(ex.getDifficulty());
    String statementPlain = toPlain(ex.getStatement());
    String title = deriveTitle(statementPlain);

    List<String> hints = Optional.ofNullable(ex.getHints())
        .orElse(List.of())
        .stream()
        .map(Hint::getHintText)
        .filter(Objects::nonNull)
        .map(this::toPlain)
        .toList();

    List<String> steps = Optional.ofNullable(ex.getSolutionSteps())
        .orElse(List.of())
        .stream()
        .sorted(Comparator.comparingInt(s -> Optional.ofNullable(s.getStepNumber()).orElse(0)))
        .map(SolutionStep::getExplanation)
        .filter(Objects::nonNull)
        .map(this::toPlain)
        .toList();

    ExerciseDetailInternalResponse dto = new ExerciseDetailInternalResponse(
        ex.getId(), objectiveId, difficulty, title, statementPlain, hints, steps);
    return ResponseEntity.ok(dto);
  }

  // ===== helpers =====

  /**
   * Convierte el enum interno a la etiqueta solicitada por el advisor:
   * EASY|MEDIUM|HARD.
   */
  private String mapDifficultyToAdvisor(Exercise.Difficulty d) {
    if (d == null)
      return null;
    return switch (d) {
      case BASIC -> "EASY";
      case INTERMEDIATE -> "MEDIUM";
      case ADVANCED -> "HARD";
    };
  }

  /** Deriva un título corto desde el statement plano. */
  private String deriveTitle(String statementPlain) {
    if (statementPlain == null)
      return null;
    String oneLine = statementPlain.replaceAll("\\s+", " ").trim();
    return oneLine.length() <= 140 ? oneLine : (oneLine.substring(0, 137) + "…");
  }

  /**
   * Quita etiquetas HTML simples y normaliza espacios (sin dependencias extra).
   */
  private String toPlain(String s) {
    if (s == null)
      return null;
    String noTags = s.replaceAll("<[^>]+>", " ");
    return noTags.replaceAll("\\s+", " ").trim();
  }
}
