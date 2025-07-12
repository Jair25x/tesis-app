package com.tesis.curriculum_service.controller;

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

  @Operation(summary = "Listar todos los currículos activos", description = "Cualquier usuario autenticado puede acceder.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de currículos activos", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CurriculumResponse.class))))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<CurriculumResponse>> listAll() {
    List<CurriculumResponse> all = curriculumService.getAll();
    return ResponseEntity.ok(all);
  }

  @Operation(summary = "Obtener un currículo por ID", description = "Devuelve un currículo activo por su ID.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo encontrado", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<CurriculumResponse> getById(@PathVariable UUID id) throws ResourceNotFoundException {
    CurriculumResponse dto = curriculumService.getById(id);
    return ResponseEntity.ok(dto);
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
