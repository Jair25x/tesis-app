package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CheckAnswerRequest;
import com.tesis.curriculum_service.dto.CheckAnswerResponse;
import com.tesis.curriculum_service.dto.ExerciseAdminResponse;
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

  @Operation(summary = "Listar ejercicios por objetivo")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado obtenido", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ExerciseResponse.class)))),
      @ApiResponse(responseCode = "404", description = "Objetivo de aprendizaje no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<ExerciseResponse>> listAll(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @RequestParam(defaultValue = "active") String status) throws ResourceNotFoundException {

    List<ExerciseResponse> list;

    switch (status.toLowerCase()) {
      case "inactive":
        list = exerciseService.getAllByLearningObjectiveInactive(
            curriculumId, competencyId, standardId, learningObjectiveId);
        break;
      case "all":
        list = exerciseService.getAllByLearningObjectiveIncludingInactive(
            curriculumId, competencyId, standardId, learningObjectiveId);
        break;
      default: // "active"
        list = exerciseService.getAllByLearningObjective(
            curriculumId, competencyId, standardId, learningObjectiveId);
    }

    return ResponseEntity.ok(list);
  }

  @Operation(summary = "Obtener un ejercicio específico (vista student)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio encontrado", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  public ResponseEntity<ExerciseResponse> getOne(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    ExerciseResponse response = exerciseService.getById(
        curriculumId, competencyId, standardId, learningObjectiveId, id);
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Obtener un ejercicio (vista admin/teacher)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio encontrado (admin)"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @GetMapping("/{id}/admin")
  public ResponseEntity<ExerciseAdminResponse> getOneAdmin(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    ExerciseAdminResponse response = exerciseService.getByIdAdmin(
        curriculumId, competencyId, standardId, learningObjectiveId, id);
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Crear un nuevo ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Ejercicio creado", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
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

    ExerciseResponse created = exerciseService.create(
        curriculumId, competencyId, standardId, learningObjectiveId, request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @Operation(summary = "Actualizar un ejercicio existente")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio actualizado", content = @Content(schema = @Schema(implementation = ExerciseResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
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

    ExerciseResponse updated = exerciseService.update(
        curriculumId, competencyId, standardId, learningObjectiveId, id, request);
    return ResponseEntity.ok(updated);
  }

  @Operation(summary = "Eliminar lógicamente un ejercicio")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Ejercicio eliminado"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    exerciseService.delete(curriculumId, competencyId, standardId, learningObjectiveId, id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Reactivar un ejercicio eliminado")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ejercicio reactivado"),
      @ApiResponse(responseCode = "404", description = "Ejercicio no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @PatchMapping("/{id}/reactivate")
  public ResponseEntity<Void> reactivate(
      @PathVariable UUID curriculumId,
      @PathVariable UUID competencyId,
      @PathVariable UUID standardId,
      @PathVariable UUID learningObjectiveId,
      @PathVariable UUID id) throws ResourceNotFoundException {

    exerciseService.reactivate(curriculumId, competencyId, standardId, learningObjectiveId, id);
    return ResponseEntity.ok().build();
  }

  @Operation(summary = "Verificar la respuesta de un estudiante")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Respuesta evaluada", content = @Content(schema = @Schema(implementation = CheckAnswerResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
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
      @Valid @RequestBody CheckAnswerRequest request) throws ResourceNotFoundException {

    CheckAnswerResponse result = exerciseService.checkAnswer(
        curriculumId, competencyId, standardId, learningObjectiveId, exerciseId, request);
    return ResponseEntity.ok(result);
  }

}
