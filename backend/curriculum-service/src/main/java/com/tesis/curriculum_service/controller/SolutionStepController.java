package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.SolutionStepRequest;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.service.SolutionStepService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Solution Steps", description = "Gestión de pasos de solución asociados a ejercicios de aprendizaje")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives/{learningObjectiveId}/exercises/{exerciseId}/solution-steps")
@RequiredArgsConstructor
public class SolutionStepController {

  private final SolutionStepService service;

  @Operation(summary = "Listar pasos activos de solución de un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pasos encontrados exitosamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<SolutionStepResponse>> listAll(@PathVariable UUID exerciseId) {
    return ResponseEntity.ok(service.getAllByExercise(exerciseId));
  }

  @Operation(summary = "Listar todos los pasos (activos e inactivos) de un ejercicio", description = "Solo accesible para administradores o docentes")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pasos listados exitosamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @GetMapping("/all")
  public ResponseEntity<List<SolutionStepResponse>> listAllIncludingInactive(@PathVariable UUID exerciseId) {
    return ResponseEntity.ok(service.getAllIncludingInactive(exerciseId));
  }

  @Operation(summary = "Obtener un paso de solución específico por ID")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso encontrado correctamente"),
      @ApiResponse(responseCode = "404", description = "Paso o ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<SolutionStepResponse> getOne(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    return ResponseEntity.ok(service.getById(exerciseId, id));
  }

  @Operation(summary = "Crear un nuevo paso de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Paso creado exitosamente", content = @Content(schema = @Schema(implementation = SolutionStepResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<SolutionStepResponse> create(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody SolutionStepRequest request) {
    SolutionStepResponse created = service.create(exerciseId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar un paso de solución existente")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso actualizado exitosamente"),
      @ApiResponse(responseCode = "404", description = "Paso o ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<SolutionStepResponse> update(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id,
      @Valid @RequestBody SolutionStepRequest request) {
    return ResponseEntity.ok(service.update(exerciseId, id, request));
  }

  @Operation(summary = "Eliminar (soft-delete) un paso de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Paso eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Paso o ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    service.delete(exerciseId, id);
  }

  @Operation(summary = "Reactivar un paso de solución previamente eliminado")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso reactivado exitosamente"),
      @ApiResponse(responseCode = "404", description = "Paso no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    service.reactivate(exerciseId, id);
    return ResponseEntity.ok().build();
  }
}
