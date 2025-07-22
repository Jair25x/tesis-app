package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.HintRequest;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.HintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Hints", description = "Operaciones CRUD sobre pistas asociadas a ejercicios")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives/{learningObjectiveId}/exercises/{exerciseId}/hints")
public class HintController {

  private final HintService hintService;

  public HintController(HintService hintService) {
    this.hintService = hintService;
  }

  @Operation(summary = "Listar pistas por ejercicio", description = "Filtra por estado con status=active|inactive|all (por defecto: active)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pistas listadas correctamente", content = @Content(array = @ArraySchema(schema = @Schema(implementation = HintResponse.class)))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<HintResponse>> listAll(
      @PathVariable UUID exerciseId,
      @RequestParam(defaultValue = "active") String status) {

    return switch (status.toLowerCase()) {
      case "inactive", "all" -> ResponseEntity.ok(hintService.getAllIncludingInactive(exerciseId));
      default -> ResponseEntity.ok(hintService.getAllByExercise(exerciseId));
    };
  }

  @Operation(summary = "Obtener una pista por ID")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pista encontrada", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "404", description = "Pista o ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<HintResponse> getOne(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) {
    return ResponseEntity.ok(hintService.getById(exerciseId, id));
  }

  @Operation(summary = "Crear una nueva pista")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Pista creada correctamente", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<HintResponse> create(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody HintRequest request) {
    HintResponse created = hintService.create(exerciseId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar una pista existente")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pista actualizada correctamente", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Pista o ejercicio no encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<HintResponse> update(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id,
      @Valid @RequestBody HintRequest request) {
    return ResponseEntity.ok(hintService.update(exerciseId, id, request));
  }

  @Operation(summary = "Eliminar una pista (soft delete)")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Pista eliminada correctamente"),
      @ApiResponse(responseCode = "404", description = "Pista o ejercicio no encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    hintService.delete(exerciseId, id);
  }

  @Operation(summary = "Reactivar una pista desactivada")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pista reactivada correctamente"),
      @ApiResponse(responseCode = "404", description = "Pista no encontrada", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(@PathVariable UUID exerciseId, @PathVariable UUID id) {
    hintService.reactivate(exerciseId, id);
    return ResponseEntity.ok().build();
  }
}
