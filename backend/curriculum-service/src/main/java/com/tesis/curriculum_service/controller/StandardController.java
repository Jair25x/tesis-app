package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.StandardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content; // Importar para @Content
import io.swagger.v3.oas.annotations.media.Schema; // Importar para @Schema
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity; // Usar ResponseEntity para más control
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // Para validación de DTOs
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@Tag(name = "Standards", description = "Gestión de estándares por currículo y competencia")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards")
@RequiredArgsConstructor
public class StandardController {

    private final StandardService standardService;

    @Operation(summary = "Listar estándares", description = "Obtiene todos los estándares activos de una competencia dentro de un currículo.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente",
                     content = @Content(schema = @Schema(implementation = StandardResponse.class))), // Especificar el tipo de contenido
        @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados")
    })
    @PreAuthorize("isAuthenticated()") // Permite a cualquier usuario autenticado
    @GetMapping
    public ResponseEntity<List<StandardResponse>> listAll( // Usar ResponseEntity
        @PathVariable UUID curriculumId,
        @PathVariable UUID competencyId) throws ResourceNotFoundException {
        List<StandardResponse> standards = standardService.getAllByCompetency(curriculumId, competencyId);
        return ResponseEntity.ok(standards);
    }

    @Operation(summary = "Obtener estándar", description = "Recupera un estándar por su ID dentro de una competencia y currículo.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estándar encontrado",
                     content = @Content(schema = @Schema(implementation = StandardResponse.class))), // Especificar el tipo de contenido
        @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
    })
    @PreAuthorize("isAuthenticated()") // Permite a cualquier usuario autenticado
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse> getOne( // Usar ResponseEntity
        @PathVariable UUID curriculumId,
        @PathVariable UUID competencyId,
        @PathVariable UUID id) throws ResourceNotFoundException {
        StandardResponse standard = standardService.getById(curriculumId, competencyId, id);
        return ResponseEntity.ok(standard);
    }

    @Operation(summary = "Crear estándar", description = "Crea un nuevo estándar en la competencia especificada dentro de un currículo.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Estándar creado correctamente",
                     content = @Content(schema = @Schema(implementation = StandardResponse.class))), // Especificar el tipo de contenido
        @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados"),
        @ApiResponse(responseCode = "403", description = "No autorizado"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos") // Añadir 400 para validación
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<StandardResponse> create( // Usar ResponseEntity
        @PathVariable UUID curriculumId,
        @PathVariable UUID competencyId,
        @Valid @RequestBody StandardRequest request) throws ResourceNotFoundException { // Añadir @Valid
        StandardResponse createdStandard = standardService.create(curriculumId, competencyId, request);
        return new ResponseEntity<>(createdStandard, HttpStatus.CREATED); // Devolver 201 CREATED explícitamente
    }

    @Operation(summary = "Actualizar estándar", description = "Actualiza un estándar existente dentro de una competencia y currículo.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estándar actualizado correctamente",
                     content = @Content(schema = @Schema(implementation = StandardResponse.class))), // Especificar el tipo de contenido
        @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
        @ApiResponse(responseCode = "403", description = "No autorizado"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos") // Añadir 400 para validación
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse> update( // Usar ResponseEntity
        @PathVariable UUID curriculumId,
        @PathVariable UUID competencyId,
        @PathVariable UUID id,
        @Valid @RequestBody StandardRequest request) throws ResourceNotFoundException { // Añadir @Valid
        StandardResponse updatedStandard = standardService.update(curriculumId, competencyId, id, request);
        return ResponseEntity.ok(updatedStandard);
    }

    @Operation(summary = "Eliminar estándar", description = "Borra lógicamente un estándar (soft-delete) dentro de una competencia y currículo.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Estándar eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
        @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Mantener @ResponseStatus para 204
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
    public ResponseEntity<Void> reactivate( // Usar ResponseEntity<Void> para 200 sin cuerpo
        @PathVariable UUID curriculumId,
        @PathVariable UUID competencyId,
        @PathVariable UUID id) throws ResourceNotFoundException {
        standardService.reactivate(curriculumId, competencyId, id);
        return ResponseEntity.ok().build(); // Devolver 200 OK sin cuerpo
    }
}
