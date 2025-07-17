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

/**
 * Endpoint para registrar y consultar intentos de ejercicios por los
 * estudiantes.
 */
@RestController
@RequestMapping("/api/curricula/attempts")
@Tag(name = "Exercise Attempts", description = "Registro de intentos de ejercicios por los estudiantes")
@RequiredArgsConstructor
public class ExerciseAttemptController {

  private final ExerciseAttemptService attemptService;

  @Operation(summary = "Registrar un intento de ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Intento registrado correctamente", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @PostMapping
  public ResponseEntity<ExerciseAttemptResponse> saveAttempt(
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId,
      @Valid @RequestBody ExerciseAttemptRequest request) {

    ExerciseAttemptResponse response = attemptService.saveAttempt(userId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @Operation(summary = "Listar intentos del usuario autenticado")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Intentos obtenidos correctamente", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "401", description = "Usuario no autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<ExerciseAttemptResponse>> getUserAttempts(
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId) {

    List<ExerciseAttemptResponse> attempts = attemptService.getAttemptsByUser(userId);
    return ResponseEntity.ok(attempts);
  }

  @Operation(summary = "Listar intentos del usuario autenticado sobre un ejercicio específico")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Intentos encontrados", content = @Content(schema = @Schema(implementation = ExerciseAttemptResponse.class))),
      @ApiResponse(responseCode = "400", description = "ID de ejercicio inválido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "Usuario no autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/exercise/{exerciseId}")
  public ResponseEntity<List<ExerciseAttemptResponse>> getAttemptsByExercise(
      @PathVariable UUID exerciseId,
      @Parameter(hidden = true) @RequestHeader("x-user-id") Long userId) {

    List<ExerciseAttemptResponse> attempts = attemptService.getAttemptsByExerciseAndUser(exerciseId, userId);
    return ResponseEntity.ok(attempts);
  }
}
