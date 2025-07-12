// src/main/java/com/tesis/curriculum_service/controller/SolutionStepController.java
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Solution Steps", description = "Gestión de pasos de solución de ejercicios")
@RestController
@RequestMapping("/api/exercises/{exerciseId}/solution-steps")
public class SolutionStepController {

  private final SolutionStepService service;

  public SolutionStepController(SolutionStepService service) {
    this.service = service;
  }

  @Operation(summary = "Listar pasos de solución", description = "Obtiene todos los pasos de solución de un ejercicio dado.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente."),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping
  public List<SolutionStepResponse> listAll(
      @PathVariable UUID exerciseId) throws ResourceNotFoundException {
    return service.getAllByExercise(exerciseId);
  }

  @Operation(summary = "Obtener paso de solución", description = "Obtiene un paso de solución específico de un ejercicio.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso encontrado."),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping("/{id}")
  public SolutionStepResponse getOne(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    return service.getById(exerciseId, id);
  }

  @Operation(summary = "Crear paso de solución", description = "Crea un nuevo paso de solución para el ejercicio indicado.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Paso creado correctamente.", content = @Content(schema = @Schema(implementation = SolutionStepResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public SolutionStepResponse create(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody SolutionStepRequest request) throws ResourceNotFoundException {
    return service.create(exerciseId, request);
  }

  @Operation(summary = "Actualizar paso de solución", description = "Modifica un paso de solución existente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso actualizado correctamente.", content = @Content(schema = @Schema(implementation = SolutionStepResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public SolutionStepResponse update(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id,
      @Valid @RequestBody SolutionStepRequest request) throws ResourceNotFoundException {
    return service.update(exerciseId, id, request);
  }

  @Operation(summary = "Eliminar paso de solución", description = "Realiza un borrado lógico (soft-delete) de un paso de solución.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Paso eliminado correctamente."),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    service.delete(exerciseId, id);
  }

  @Operation(summary = "Reactivar paso de solución", description = "Revierte un borrado lógico de un paso de solución.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Paso reactivado correctamente."),
      @ApiResponse(responseCode = "404", description = "Ejercicio o paso no encontrado.", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public void reactivate(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    service.reactivate(exerciseId, id);
  }
}
