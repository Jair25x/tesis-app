package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.service.ExerciseService;
import com.tesis.curriculum_service.exception.ErrorResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curricula/exercises/diagnostic")
@RequiredArgsConstructor
@Tag(name = "Diagnostic Exercises", description = "Ejercicios del test diagnóstico para estudiantes")
public class DiagnosticExerciseController {

  private final ExerciseService exerciseService;

  @Operation(summary = "Obtener ejercicios diagnósticos", description = "Lista de ejercicios marcados como diagnósticos y activos")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ExerciseResponse.class)))),
      @ApiResponse(responseCode = "403", description = "No autorizado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<ExerciseResponse>> getAllDiagnosticExercises() {
    List<ExerciseResponse> list = exerciseService.getAllDiagnosticExercises();
    return ResponseEntity.ok(list);
  }

}
