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
import java.util.UUID;

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
            .uiHints(schema.getUiHints())
            .build())
        .collect(Collectors.toList());
    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Obtener esquema por tipo", description = "Devuelve el esquema completo del tipo indicado. Solo ADMIN/TEACHER.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = TemplateSchemaResponse.class))),
      @ApiResponse(responseCode = "404", description = "No encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "400", description = "Tipo inválido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @GetMapping("/{type}")
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  public ResponseEntity<?> getByType(@PathVariable UUID curriculumId,
      @PathVariable String type) {
    // Binding tolerante: case-insensitive y guiones/barras bajas
    TemplateType parsed;
    try {
      String norm = type.trim().toUpperCase(Locale.ROOT).replace('-', '_');
      parsed = TemplateType.valueOf(norm);
    } catch (Exception ex) {
      return ResponseEntity.badRequest().body(
          new ErrorResponse("Tipo de plantilla inválido: '" + type + "'.", 400, System.currentTimeMillis()));
    }

    return templateService.schemaFor(parsed)
        .map(schema -> TemplateSchemaResponse.builder()
            .type(schema.getTemplateType())
            .description(generateDescription(schema.getTemplateType()))
            .example(schema.getExample())
            .uiHints(schema.getUiHints())
            .build())
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.status(404).body(
            new ErrorResponse("Template type '" + parsed + "' not found.", 404, System.currentTimeMillis())));
  }

  private String generateDescription(TemplateType type) {
    // Siempre cubrir TODOS los enums + default
    return switch (type) {
      case EQUATION_SINGLE_CHOICE -> "Ecuación simple con opciones (Mustache + opciones).";
      case FREQUENCY_TABLE_QA -> "Tabla de frecuencias con preguntas asociadas (moda/total/etc.).";
      case FREQUENCY_TABLE_COMPLETE -> "Completar celdas faltantes en una tabla de frecuencias.";
      case NUMBER_WORDS_BIDIR -> "Conversión entre número en cifras ↔ número en palabras (es-PE).";
      case PLACE_VALUE_QA -> "Valor posicional y descomposición en base 10.";
      case BASE_TEN_BLOCKS_QA -> "Bloques base diez (centenas/decenas/unidades) → número.";
      case NUMBER_SEQUENCE_QA -> "Patrones numéricos y secuencias con espacios a completar.";
      default -> "Plantilla no documentada.";
    };
  }
}
