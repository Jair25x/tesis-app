package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.HintRequest;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.HintService;
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

@Tag(name = "Hints", description = "Operaciones CRUD sobre pistas asociadas a ejercicios")
@RestController
@RequestMapping("/api/exercises/{exerciseId}/hints")
public class HintController {

  private final HintService hintService;

  public HintController(HintService hintService) {
    this.hintService = hintService;
  }

  @Operation(summary = "Listar pistas", description = "Obtiene todas las pistas de un ejercicio dado.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado de pistas obtenido correctamente", content = @Content(array = @ArraySchema(schema = @Schema(implementation = HintResponse.class)))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<HintResponse>> listAll(
      @PathVariable UUID exerciseId) throws ResourceNotFoundException {
    List<HintResponse> hints = hintService.getAllByExercise(exerciseId);
    return ResponseEntity.ok(hints);
  }

  @Operation(summary = "Obtener pista", description = "Recupera una pista por su ID dentro de un ejercicio.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pista encontrada", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio o pista no encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<HintResponse> getOne(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    HintResponse hint = hintService.getById(exerciseId, id);
    return ResponseEntity.ok(hint);
  }

  @Operation(summary = "Crear pista", description = "Crea una nueva pista para el ejercicio especificado.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Pista creada correctamente", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<HintResponse> create(
      @PathVariable UUID exerciseId,
      @Valid @RequestBody HintRequest request) throws ResourceNotFoundException {
    HintResponse created = hintService.create(exerciseId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar pista", description = "Actualiza una pista existente del ejercicio.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Pista actualizada correctamente", content = @Content(schema = @Schema(implementation = HintResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio o pista no encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<HintResponse> update(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id,
      @Valid @RequestBody HintRequest request) throws ResourceNotFoundException {
    HintResponse updated = hintService.update(exerciseId, id, request);
    return ResponseEntity.ok(updated);
  }

  @Operation(summary = "Eliminar pista", description = "Elimina una pista (soft-delete) del ejercicio.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Pista eliminada correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio o pista no encontrados", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  public void delete(
      @PathVariable UUID exerciseId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    hintService.delete(exerciseId, id);
  }
}
