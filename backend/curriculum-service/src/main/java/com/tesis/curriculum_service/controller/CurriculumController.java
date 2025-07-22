package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CurriculumFullResponse;
import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.CurriculumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Curriculum", description = "Operaciones CRUD sobre currículos escolares")
@RestController
@RequestMapping("/api/curricula")
public class CurriculumController {

  private final CurriculumService curriculumService;

  public CurriculumController(CurriculumService curriculumService) {
    this.curriculumService = curriculumService;
  }

  @Operation(summary = "Crear un nuevo currículo", description = "Solo ADMIN o TEACHER pueden crear nuevos currículos.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Currículo creado correctamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<CurriculumResponse> create(@Valid @RequestBody CurriculumRequest request) {
    CurriculumResponse created = curriculumService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Listar currículos por estado", description = "Permite listar currículos activos, inactivos o todos. Por defecto se listan todos.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de currículos encontrados", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = CurriculumResponse.class)))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado: el usuario no está autenticado o no tiene permisos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<CurriculumResponse>> listAll(
      @RequestParam(name = "status", defaultValue = "all") String status) {
    List<CurriculumResponse> result = switch (status.toLowerCase()) {
      case "active" -> curriculumService.getAllActive();
      case "inactive" -> curriculumService.getAllInactive();
      default -> curriculumService.getAllIncludingInactive();
    };

    return ResponseEntity.ok(result);
  }

  @Operation(summary = "Obtener un currículo por ID", description = "Devuelve un currículo simple o completo según el parámetro includeFull.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo encontrado", content = {
          @Content(schema = @Schema(oneOf = { CurriculumResponse.class, CurriculumFullResponse.class }))
      }),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<?> getCurriculum(
      @PathVariable UUID id,
      @RequestParam(defaultValue = "false") boolean includeFull) throws ResourceNotFoundException {

    if (includeFull) {
      return ResponseEntity.ok(curriculumService.getCurriculumFull(id));
    } else {
      return ResponseEntity.ok(curriculumService.getById(id));
    }
  }

  @Operation(summary = "Actualizar un currículo", description = "Solo ADMIN o TEACHER pueden modificar currículos.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo actualizado correctamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<CurriculumResponse> update(
      @PathVariable UUID id,
      @Valid @RequestBody CurriculumRequest request) throws ResourceNotFoundException {
    CurriculumResponse updated = curriculumService.update(id, request);
    return ResponseEntity.ok(updated);
  }

  @Operation(summary = "Eliminar un currículo (soft delete)", description = "Solo ADMIN puede eliminar currículos.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Currículo eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) throws ResourceNotFoundException {
    curriculumService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Reactivar un currículo", description = "Solo ADMIN puede reactivar un currículo previamente eliminado.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasRole('ADMIN')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(@PathVariable UUID id) throws ResourceNotFoundException {
    curriculumService.reactivate(id);
    return ResponseEntity.ok().build();
  }

}
