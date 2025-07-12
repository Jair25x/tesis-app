// src/main/java/com/tesis/curriculum_service/controller/StandardController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.StandardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Standards", description = "Gestión de estándares por currículo y competencia")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards")
public class StandardController {

  private final StandardService standardService;

  public StandardController(StandardService standardService) {
    this.standardService = standardService;
  }

  @Operation(summary = "Listar estándares", description = "Obtiene todos los estándares activos de una competencia dentro de un currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public List<StandardResponse> listAll(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId) throws ResourceNotFoundException {
    return standardService.getAllByCompetency(curriculumId, competencyId);
  }

  @Operation(summary = "Obtener estándar", description = "Recupera un estándar por su ID dentro de una competencia y currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Estándar encontrado"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public StandardResponse getOne(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    return standardService.getById(curriculumId, competencyId, id);
  }

  @Operation(summary = "Crear estándar", description = "Crea un nuevo estándar en la competencia especificada dentro de un currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Estándar creado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados"),
      @ApiResponse(responseCode = "403", description = "No autorizado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping
  public StandardResponse create(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @RequestBody StandardRequest request) throws ResourceNotFoundException {
    return standardService.create(curriculumId, competencyId, request);
  }

  @Operation(summary = "Actualizar estándar", description = "Actualiza un estándar existente dentro de una competencia y currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Estándar actualizado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
      @ApiResponse(responseCode = "403", description = "No autorizado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public StandardResponse update(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID id,
      @RequestBody StandardRequest request) throws ResourceNotFoundException {
    return standardService.update(curriculumId, competencyId, id, request);
  }

  @Operation(summary = "Eliminar estándar", description = "Borra lógicamente un estándar (soft-delete) dentro de una competencia y currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Estándar eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
      @ApiResponse(responseCode = "403", description = "No autorizado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  public void delete(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    standardService.delete(curriculumId, competencyId, id);
  }

  @Operation(summary = "Reactivar estándar", description = "Revierte el borrado lógico de un estándar dentro de una competencia y currículo.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Estándar reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
      @ApiResponse(responseCode = "403", description = "No autorizado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping("/{id}/reactivate")
  public void reactivate(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    standardService.reactivate(curriculumId, competencyId, id);
  }
}
