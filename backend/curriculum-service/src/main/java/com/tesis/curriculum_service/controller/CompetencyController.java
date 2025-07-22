package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.service.CompetencyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controlador REST para gestionar Competencies dentro de un Curriculum.
 */
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies")
@RequiredArgsConstructor
@Tag(name = "Competency", description = "Operaciones CRUD sobre competencias educativas")
public class CompetencyController {

  private final CompetencyService service;

  @Operation(summary = "Crear nueva competencia")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Competencia creada"),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<CompetencyResponse> create(
      @PathVariable UUID curriculumId,
      @RequestBody CompetencyRequest req) {
    return ResponseEntity.ok(service.create(curriculumId, req));
  }

  @Operation(summary = "Listar todas las competencias de un currículo")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado de competencias"),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<CompetencyResponse>> list(
      @PathVariable UUID curriculumId,
      @RequestParam(name = "status", defaultValue = "active") String status) {
    return switch (status.toLowerCase()) {
      case "all" -> ResponseEntity.ok(service.getAllIncludingInactiveByCurriculum(curriculumId));
      case "inactive" -> ResponseEntity.ok(service.getAllInactiveByCurriculum(curriculumId));
      case "active" -> ResponseEntity.ok(service.getAllByCurriculum(curriculumId));
      default -> ResponseEntity.badRequest().build(); // Manejo de error si el status no es válido
    };
  }

  @Operation(summary = "Obtener una competencia por ID")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Competencia encontrada"),
      @ApiResponse(responseCode = "404", description = "Competencia o currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<CompetencyResponse> getOne(
      @PathVariable UUID curriculumId,
      @PathVariable UUID id) {
    return ResponseEntity.ok(service.getById(curriculumId, id));
  }

  @Operation(summary = "Actualizar una competencia existente")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Competencia actualizada"),
      @ApiResponse(responseCode = "404", description = "Competencia o currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<CompetencyResponse> update(
      @PathVariable UUID curriculumId,
      @PathVariable UUID id,
      @RequestBody CompetencyRequest req) {
    return ResponseEntity.ok(service.update(curriculumId, id, req));
  }

  @Operation(summary = "Borrado lógico de una competencia")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Competencia desactivada"),
      @ApiResponse(responseCode = "404", description = "Competencia o currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID curriculumId,
      @PathVariable UUID id) {
    service.delete(curriculumId, id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Reactivar una competencia desactivada")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Competencia reactivada"),
      @ApiResponse(responseCode = "404", description = "Competencia o currículo no encontrado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(
      @PathVariable UUID curriculumId,
      @PathVariable UUID id) {
    service.reactivate(curriculumId, id);
    return ResponseEntity.noContent().build();
  }
}
