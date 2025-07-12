package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.ExerciseRequest;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.ExerciseService;
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

@Tag(name = "Exercises", description = "Operaciones CRUD sobre ejercicios matemáticos")
@RestController
@RequestMapping("/api/learning-objectives/{learningObjectiveId}/exercises")
public class ExerciseController {

  private final ExerciseService exerciseService;

  public ExerciseController(ExerciseService exerciseService) {
    this.exerciseService = exerciseService;
  }

  @Operation(summary = "Listar ejercicios", description = "Obtiene todos los ejercicios activos de un objetivo de aprendizaje.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado de ejercicios obtenido", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ExerciseResponse.class)))),
      @ApiResponse(responseCode = "404", description = "Objetivo de aprendizaje no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public List<ExerciseResponse> listAll(
      @PathVariable UUID learningObjectiveId) throws ResourceNotFoundException {
    return exerciseService.getAllByLearningObjective(learningObjectiveId);
  }

  @Operation(summary = "Obtener un ejercicio", description = "Obtiene un ejercicio por su ID dentro de un objetivo de aprendizaje.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio encontrado", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ExerciseResponse getOne(
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    return exerciseService.getById(learningObjectiveId, id);
  }

  @Operation(summary = "Crear un ejercicio", description = "Crea un nuevo ejercicio dentro de un objetivo de aprendizaje.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Ejercicio creado correctamente", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Objetivo de aprendizaje no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.CREATED)
  @PostMapping
  public ExerciseResponse create(
      @PathVariable UUID learningObjectiveId,
      @Valid @RequestBody ExerciseRequest request) throws ResourceNotFoundException {
    return exerciseService.create(learningObjectiveId, request);
  }

  @Operation(summary = "Actualizar un ejercicio", description = "Modifica los datos de un ejercicio existente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio actualizado correctamente", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ExerciseResponse update(
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id,
      @Valid @RequestBody ExerciseRequest request) throws ResourceNotFoundException {
    return exerciseService.update(learningObjectiveId, id, request);
  }

  @Operation(summary = "Eliminar un ejercicio (soft-delete)", description = "Marca un ejercicio como inactivo. También elimina en cascada pistas y pasos de solución.")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Ejercicio eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @DeleteMapping("/{id}")
  public void delete(
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    exerciseService.delete(learningObjectiveId, id);
  }

  @Operation(summary = "Reactivar un ejercicio", description = "Vuelve a activar un ejercicio que fue eliminado lógicamente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {
    exerciseService.reactivate(learningObjectiveId, id);
    return ResponseEntity.ok().build();
  }
}
