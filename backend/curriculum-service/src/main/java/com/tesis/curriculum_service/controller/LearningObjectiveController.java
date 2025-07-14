package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.LearningObjectiveService;
import io.swagger.v3.oas.annotations.Operation;
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

/**
 * Controlador REST para gestionar Objetivos de Aprendizaje
 * asociados a un Estándar dentro de una Competencia y Currículo.
 */
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives")
@RequiredArgsConstructor
public final class LearningObjectiveController {

  private final LearningObjectiveService loService;

  @Operation(summary = "Listar objetivos de aprendizaje", description = "Obtiene todos los objetivos activos de un estándar dentro de una competencia.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<LearningObjectiveResponse>> listAll(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId) throws ResourceNotFoundException {
    List<LearningObjectiveResponse> result = loService.getAllByStandard(curriculumId, competencyId, standardId);
    return ResponseEntity.ok(result);
  }

  @Operation(summary = "Obtener objetivo de aprendizaje", description = "Obtiene un objetivo por su ID dentro de un estándar.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo encontrado", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia, estándar o objetivo no encontrados")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<LearningObjectiveResponse> getOne(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    return ResponseEntity.ok(loService.getById(curriculumId, competencyId, standardId, id));
  }

  @Operation(summary = "Crear objetivo de aprendizaje", description = "Crea un nuevo objetivo en el estándar especificado.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Objetivo creado correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
      @ApiResponse(responseCode = "400", description = "Datos inválidos")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<LearningObjectiveResponse> create(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @Valid @RequestBody LearningObjectiveRequest request) throws ResourceNotFoundException {
    LearningObjectiveResponse created = loService.create(curriculumId, competencyId, standardId, request);
    return new ResponseEntity<>(created, HttpStatus.CREATED);
  }

  @Operation(summary = "Actualizar objetivo de aprendizaje", description = "Actualiza un objetivo existente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo actualizado correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia, estándar o objetivo no encontrados")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<LearningObjectiveResponse> update(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id,
      @Valid @RequestBody LearningObjectiveRequest request) throws ResourceNotFoundException {
    LearningObjectiveResponse updated = loService.update(curriculumId, competencyId, standardId, id, request);
    return ResponseEntity.ok(updated);
  }

  @Operation(summary = "Eliminar objetivo de aprendizaje", description = "Borra lógicamente un objetivo de aprendizaje.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Objetivo eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia, estándar u objetivo no encontrados")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    loService.delete(curriculumId, competencyId, standardId, id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Reactivar objetivo de aprendizaje", description = "Reactiva un objetivo previamente eliminado lógicamente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia, estándar u objetivo no encontrados")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    loService.reactivate(curriculumId, competencyId, standardId, id);
    return ResponseEntity.ok().build();
  }
}
