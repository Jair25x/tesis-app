// src/main/java/com/tesis/curriculum_service/controller/LearningObjectiveController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.LearningObjectiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar Objetivos de Aprendizaje
 * asociados a un Estándar dentro de una Competencia.
 */
@RestController
@RequestMapping("/api/competencies/{competencyId}/standards/{standardId}/learning-objectives")
public class LearningObjectiveController {

  private final LearningObjectiveService loService;

  public LearningObjectiveController(LearningObjectiveService loService) {
    this.loService = loService;
  }

  @Operation(summary = "Listar objetivos de aprendizaje", description = "Obtiene todos los objetivos activos de un estándar dentro de una competencia.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente."),
      @ApiResponse(responseCode = "404", description = "Competencia o estándar no encontrados.")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public List<LearningObjectiveResponse> listAll(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId) throws ResourceNotFoundException {
    return loService.getAllByStandard(competencyId, standardId);
  }

  @Operation(summary = "Obtener objetivo de aprendizaje", description = "Obtiene un objetivo por su ID dentro de un estándar y competencia.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo encontrado."),
      @ApiResponse(responseCode = "404", description = "Competencia, estándar o objetivo no encontrados.")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public LearningObjectiveResponse getOne(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    return loService.getById(competencyId, standardId, id);
  }

  @Operation(summary = "Crear objetivo de aprendizaje", description = "Crea un nuevo objetivo en el estándar especificado.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Objetivo creado correctamente."),
      @ApiResponse(responseCode = "404", description = "Competencia o estándar no encontrados.")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping
  public LearningObjectiveResponse create(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @RequestBody LearningObjectiveRequest request) throws ResourceNotFoundException {
    return loService.create(competencyId, standardId, request);
  }

  @Operation(summary = "Actualizar objetivo de aprendizaje", description = "Actualiza un objetivo existente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo actualizado correctamente."),
      @ApiResponse(responseCode = "404", description = "Competencia, estándar o objetivo no encontrados.")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public LearningObjectiveResponse update(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id,
      @RequestBody LearningObjectiveRequest request) throws ResourceNotFoundException {
    return loService.update(competencyId, standardId, id, request);
  }

  @Operation(summary = "Eliminar objetivo de aprendizaje", description = "Borra lógicamente un objetivo de aprendizaje.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Objetivo eliminado (soft‐delete)."),
      @ApiResponse(responseCode = "404", description = "Competencia, estándar o objetivo no encontrados.")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  public void delete(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    loService.delete(competencyId, standardId, id);
  }

  @Operation(summary = "Reactivar objetivo de aprendizaje", description = "Reactiva un objetivo previamente borrado lógicamente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo reactivado correctamente."),
      @ApiResponse(responseCode = "404", description = "Competencia, estándar o objetivo no encontrados.")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping("/{id}/reactivate")
  public void reactivate(
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    loService.reactivate(competencyId, standardId, id);
  }
}
