package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.ExerciseAttemptRequest;
import com.tesis.curriculum_service.dto.ExerciseAttemptResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.service.ExerciseAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/curricula/attempts")
@Tag(name = "Exercise Attempts", description = "Registro y consulta de intentos de ejercicios realizados por estudiantes")
@RequiredArgsConstructor
public class ExerciseAttemptController {

  private final ExerciseAttemptService attemptService;

  @Operation(summary = "Registrar un intento de ejercicio", description = "Permite al estudiante registrar su intento de resolver un ejercicio, incluyendo tiempo, pistas usadas y respuesta enviada")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Intento registrado correctamente", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud inválida o datos mal formateados", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PostMapping
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<ExerciseAttemptResponse> saveAttempt(
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId,
      @Valid @RequestBody ExerciseAttemptRequest request) {

    ExerciseAttemptResponse response = attemptService.saveAttempt(userId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Operation(summary = "Obtener todos los intentos del estudiante autenticado", description = "Devuelve la lista completa de intentos registrados por el estudiante actual")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Intentos obtenidos correctamente", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<List<ExerciseAttemptResponse>> getAttemptsByUser(
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId) {

    List<ExerciseAttemptResponse> attempts = attemptService.getAttemptsByUser(userId);
    return ResponseEntity.ok(attempts);
  }

  @Operation(summary = "Obtener intentos por ejercicio", description = "Devuelve todos los intentos realizados por el estudiante actual sobre un ejercicio específico")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Intentos encontrados", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "400", description = "ID de ejercicio inválido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping("/exercise/{exerciseId}")
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<List<ExerciseAttemptResponse>> getAttemptsByExerciseAndUser(
      @PathVariable UUID exerciseId,
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId) {

    List<ExerciseAttemptResponse> attempts = attemptService.getAttemptsByExerciseAndUser(exerciseId, userId);
    return ResponseEntity.ok(attempts);
  }
}
