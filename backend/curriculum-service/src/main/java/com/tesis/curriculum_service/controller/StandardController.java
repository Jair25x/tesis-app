package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.StandardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Standards", description = "Gestión de estándares por currículo y competencia")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards")
@RequiredArgsConstructor
public class StandardController {

    private final StandardService standardService;

    @Operation(summary = "Listar estándares", description = "Obtiene estándares por competencia con filtro opcional por estado (active, inactive, all).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente", content = @Content(schema = @Schema(implementation = StandardResponse.class))),
            @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<StandardResponse>> listByCompetency(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @RequestParam(name = "status", defaultValue = "active") String status)
            throws ResourceNotFoundException {

        List<StandardResponse> standards = standardService.getAllByCompetency(curriculumId, competencyId, status);
        return ResponseEntity.ok(standards);
    }

    @Operation(summary = "Obtener estándar", description = "Recupera un estándar por su ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estándar encontrado", content = @Content(schema = @Schema(implementation = StandardResponse.class))),
            @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse> getOne(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @PathVariable UUID id) throws ResourceNotFoundException {

        return ResponseEntity.ok(standardService.getById(curriculumId, competencyId, id));
    }

    @Operation(summary = "Crear estándar", description = "Crea un nuevo estándar.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Estándar creado correctamente", content = @Content(schema = @Schema(implementation = StandardResponse.class))),
            @ApiResponse(responseCode = "404", description = "Currículo o competencia no encontrados"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping
    public ResponseEntity<StandardResponse> create(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @Valid @RequestBody StandardRequest request) throws ResourceNotFoundException {

        StandardResponse created = standardService.create(curriculumId, competencyId, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar estándar", description = "Actualiza un estándar existente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estándar actualizado correctamente", content = @Content(schema = @Schema(implementation = StandardResponse.class))),
            @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse> update(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @PathVariable UUID id,
            @Valid @RequestBody StandardRequest request) throws ResourceNotFoundException {

        return ResponseEntity.ok(standardService.update(curriculumId, competencyId, id, request));
    }

    @Operation(summary = "Eliminar estándar", description = "Elimina lógicamente un estándar.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Estándar eliminado correctamente"),
            @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @PathVariable UUID id) throws ResourceNotFoundException {

        standardService.delete(curriculumId, competencyId, id);
    }

    @Operation(summary = "Reactivar estándar", description = "Restaura un estándar eliminado lógicamente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estándar reactivado correctamente"),
            @ApiResponse(responseCode = "404", description = "Currículo, competencia o estándar no encontrados"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivate(
            @PathVariable UUID curriculumId,
            @PathVariable UUID competencyId,
            @PathVariable UUID id) throws ResourceNotFoundException {

        standardService.reactivate(curriculumId, competencyId, id);
        return ResponseEntity.ok().build();
    }
}
