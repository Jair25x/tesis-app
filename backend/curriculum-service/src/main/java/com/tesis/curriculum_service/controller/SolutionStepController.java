package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.SolutionStepRequest;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.SolutionStepService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Solution Steps", description = "Gestión de pasos de solución de ejercicios")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives/{learningObjectiveId}/exercises/{exerciseId}/solution-steps")
public class SolutionStepController {

  private final SolutionStepService service;

  public SolutionStepController(SolutionStepService service) {
    this.service = service;
  }

  @Operation(summary = "Listar pasos de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<SolutionStepResponse>> listAll(@PathVariable UUID exerciseId) {
    return ResponseEntity.ok(service.getAllByExercise(exerciseId));
  }

  @Operation(summary = "Obtener paso de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso encontrado"),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<SolutionStepResponse> getOne(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    return ResponseEntity.ok(service.getById(exerciseId, id));
  }

  @Operation(summary = "Crear paso de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Paso creado correctamente", content = @Content(schema = @Schema(implementation = SolutionStepResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<SolutionStepResponse> create(@PathVariable UUID exerciseId,
      @Valid @RequestBody SolutionStepRequest request) {
    SolutionStepResponse created = service.create(exerciseId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar paso de solución")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso actualizado correctamente", content = @Content(schema = @Schema(implementation = SolutionStepResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<SolutionStepResponse> update(@PathVariable UUID exerciseId, @PathVariable UUID id,
      @Valid @RequestBody SolutionStepRequest request) {
    return ResponseEntity.ok(service.update(exerciseId, id, request));
  }

  @Operation(summary = "Eliminar paso de solución (soft-delete)")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Paso eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    service.delete(exerciseId, id);
  }

  @Operation(summary = "Reactivar paso de solución eliminado")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Paso no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    service.reactivate(exerciseId, id);
    return ResponseEntity.ok().build();
  }
}
