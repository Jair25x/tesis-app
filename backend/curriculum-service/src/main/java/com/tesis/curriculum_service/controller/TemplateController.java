package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.TemplateSchema;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.dto.TemplateSchemaResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.service.template.ExerciseTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.media.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "Templates", description = "Plantillas parametrizables para generación de ejercicios")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/exercise-templates")
@RequiredArgsConstructor
public class TemplateController {

  private final ExerciseTemplateService templateService;

  @Operation(summary = "Listar plantillas disponibles", description = "Devuelve los esquemas de plantilla disponibles. Solo ADMIN/TEACHER.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TemplateSchemaResponse.class)))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  public ResponseEntity<List<TemplateSchemaResponse>> listAll(@PathVariable UUID curriculumId) {
    List<TemplateSchema> schemas = templateService.listAll();
    List<TemplateSchemaResponse> response = schemas.stream()
        .map(schema -> TemplateSchemaResponse.builder()
            .type(schema.getTemplateType())
            .description(generateDescription(schema.getTemplateType()))
            .example(schema.getExample())
            .uiHints(schema.getUiHints()) // puede ser null
            .build())
        .collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Obtener esquema por tipo", description = "Devuelve el esquema completo del tipo indicado. Solo ADMIN/TEACHER.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = TemplateSchemaResponse.class))),
      @ApiResponse(responseCode = "404", description = "No encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @GetMapping("/{type}")
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  public ResponseEntity<?> getByType(@PathVariable UUID curriculumId,
      @PathVariable TemplateType type) {
    return templateService.schemaFor(type)
        .map(schema -> TemplateSchemaResponse.builder()
            .type(schema.getTemplateType())
            .description(generateDescription(schema.getTemplateType()))
            .example(schema.getExample())
            .uiHints(schema.getUiHints())
            .build())
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.status(404).body(
            new ErrorResponse("Template type '" + type + "' not found.", 404, System.currentTimeMillis())));
  }

  private String generateDescription(TemplateType type) {
    return switch (type) {
      case EQUATION_SINGLE_CHOICE -> "Ecuación simple con opciones (Mustache + opciones).";
      case FREQUENCY_TABLE_QA -> "Tabla de frecuencias con preguntas asociadas (moda/total/etc.).";
      case FREQUENCY_TABLE_COMPLETE -> "Completar celdas faltantes en una tabla de frecuencias.";
    };
  }
}
