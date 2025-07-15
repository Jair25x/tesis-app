// src/main/java/com/tesis/curriculum_service/controller/ExerciseController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseRequest;
import com.tesis.curriculum_service.dto.ExerciseResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.ExerciseService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
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

@Tag(name = "Exercises", description = "Operaciones CRUD sobre ejercicios matemáticos")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/competencies/{competencyId}/standards/{standardId}/learning-objectives/{learningObjectiveId}/exercises")
@RequiredArgsConstructor
public class ExerciseController {

  private final ExerciseService exerciseService;

  @Operation(summary = "Listar ejercicios")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado de ejercicios obtenido", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ExerciseResponse.class)))),
      @ApiResponse(responseCode = "404", description = "Objetivo de aprendizaje no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<ExerciseResponse>> listAll(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId) throws ResourceNotFoundException {

    List<ExerciseResponse> list = exerciseService.getAllByLearningObjective(learningObjectiveId);
    return ResponseEntity.ok(list);
  }

  @Operation(summary = "Obtener un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio encontrado", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<ExerciseResponse> getOne(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    ExerciseResponse dto = exerciseService.getById(learningObjectiveId, id);
    return ResponseEntity.ok(dto);
  }

  @Operation(summary = "Crear un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Ejercicio creado correctamente", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Objetivo de aprendizaje no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PostMapping
  public ResponseEntity<ExerciseResponse> create(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @Valid @RequestBody ExerciseRequest request) throws ResourceNotFoundException {

    ExerciseResponse created = exerciseService.create(learningObjectiveId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio actualizado correctamente", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PutMapping("/{id}")
  public ResponseEntity<ExerciseResponse> update(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id,
      @Valid @RequestBody ExerciseRequest request) throws ResourceNotFoundException {

    ExerciseResponse updated = exerciseService.update(learningObjectiveId, id, request);
    return ResponseEntity.ok(updated);
  }

  @Operation(summary = "Eliminar un ejercicio (soft-delete)")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Ejercicio eliminado correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    exerciseService.delete(learningObjectiveId, id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Reactivar un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio reactivado correctamente"),
      @ApiResponse(responseCode = "404", description = "Ejercicio u objetivo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    exerciseService.reactivate(learningObjectiveId, id);
    return ResponseEntity.ok().build();
  }

  @Operation(summary = "Verificar respuesta del estudiante")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Respuesta evaluada correctamente", content = @Content(schema = @Schema(implementation = CheckAnswerResponse.class))),
      @ApiResponse(responseCode = "400", description = "Respuesta inválida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
  @PostMapping("/{exerciseId}/check")
  public ResponseEntity<CheckAnswerResponse> checkAnswer(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID exerciseId,
      @Valid @RequestBody CheckAnswerRequest request) {

    CheckAnswerResponse result = exerciseService.checkAnswer(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        request);
    return ResponseEntity.ok(result);
  }
}
