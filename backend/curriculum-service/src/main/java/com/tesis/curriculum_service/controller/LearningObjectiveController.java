package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.LearningObjectiveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar Objetivos de Aprendizaje.
 */
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives")
@RequiredArgsConstructor
public class LearningObjectiveController {

  private final LearningObjectiveService loService;

  @Operation(summary = "Listar objetivos de aprendizaje", description = "Obtiene todos los objetivos de un estándar dentro de una competencia. Filtra por estado si se indica.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<LearningObjectiveResponse>> listAll(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @Parameter(description = "Estado del objetivo: active, inactive o all", example = "active") @RequestParam(name = "status", defaultValue = "active") String status)
      throws ResourceNotFoundException {

    List<LearningObjectiveResponse> result;

    switch (status.toLowerCase()) {
      case "all" -> result = loService.getAllIncludingInactive(curriculumId, competencyId, standardId);
      case "inactive" -> result = loService.getAllInactive(curriculumId, competencyId, standardId);
      default -> result = loService.getAllByStandard(curriculumId, competencyId, standardId);
    }

    return ResponseEntity.ok(result);
  }

  @Operation(summary = "Obtener objetivo de aprendizaje por ID", description = "Obtiene un objetivo dentro del estándar especificado.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo encontrado", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia, estándar u objetivo no encontrados")
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

  @Operation(summary = "Crear objetivo de aprendizaje", description = "Crea un nuevo objetivo dentro de un estándar.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Objetivo creado correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
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

  @Operation(summary = "Actualizar objetivo de aprendizaje", description = "Modifica un objetivo existente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Objetivo actualizado correctamente", content = @Content(schema = @Schema(implementation = LearningObjectiveResponse.class))),
      @ApiResponse(responseCode = "404", description = "Objetivo o jerarquía no encontrados")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<LearningObjectiveResponse> update(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID id,
      @Valid @RequestBody LearningObjectiveRequest request) throws ResourceNotFoundException {
    return ResponseEntity.ok(loService.update(curriculumId, competencyId, standardId, id, request));
  }

  @Operation(summary = "Eliminar objetivo de aprendizaje (soft delete)", description = "Elimina lógicamente un objetivo (no borra de la base de datos).")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Objetivo o jerarquía no encontrados")
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

  @Operation(summary = "Reactivar objetivo de aprendizaje", description = "Rehabilita un objetivo que fue desactivado previamente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Objetivo o jerarquía no encontrados")
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
