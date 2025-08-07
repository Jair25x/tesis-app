package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.TemplateSchema;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.dto.TemplateSchemaResponse;
import com.tesis.curriculum_service.exception.ErrorResponse;
import com.tesis.curriculum_service.service.template.ExerciseTemplateService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Tag(name = "Templates", description = "Plantillas parametrizables para generación de ejercicios")
@RestController
@RequestMapping("/api/curricula/{curriculumId}/exercise-templates")
@RequiredArgsConstructor
public class TemplateController {

  private final ExerciseTemplateService templateService;

  @Operation(summary = "Listar todas las plantillas", description = "Devuelve la lista completa de esquemas de plantilla disponibles. Solo ADMIN/TEACHER.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Listado de plantillas obtenido correctamente", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TemplateSchemaResponse.class)))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado: el usuario no tiene los roles requeridos")
  })
  @GetMapping
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  public ResponseEntity<List<TemplateSchemaResponse>> listAll(
      @PathVariable UUID curriculumId) {

    List<TemplateSchema> schemas = templateService.listAll();

    List<TemplateSchemaResponse> response = schemas.stream()
        .map(schema -> new TemplateSchemaResponse(
            schema.getTemplateType(),
            generateDescription(schema.getTemplateType()),
            schema.getPattern()))
        .collect(Collectors.toList());

    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Obtener esquema de plantilla por tipo", description = "Busca y devuelve el esquema para un tipo de plantilla concreto. Solo ADMIN/TEACHER.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Esquema de plantilla encontrado", content = @Content(schema = @Schema(implementation = TemplateSchema.class))),
      @ApiResponse(responseCode = "404", description = "Tipo de plantilla no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado: el usuario no tiene los roles requeridos")
  })
  @GetMapping("/{type}")
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  public ResponseEntity<?> getByType(
      @PathVariable UUID curriculumId,
      @PathVariable TemplateType type) {

    return templateService.schemaFor(type)
        .<ResponseEntity<?>>map(ResponseEntity::ok)
        .orElseGet(() -> {
          ErrorResponse err = new ErrorResponse(
              "Template type '" + type + "' not found.",
              HttpStatus.NOT_FOUND.value(),
              System.currentTimeMillis());
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
        });
  }

  private String generateDescription(TemplateType type) {
    // Puedes mejorar esto luego con un Map o enum con descripciones localizadas
    return switch (type) {
      case BASIC_OPERATIONS -> "Operaciones básicas (suma, resta, multiplicación, división)";
      case UNIT_VALUE -> "Problemas con valores unitarios";
      case FRACTION_PROBLEM_SOLVING -> "Resolución de problemas con fracciones";
      case DECIMAL_COMPARISON -> "Comparación de decimales";
      case MULTIPLES_AND_FACTORS -> "Múltiplos y factores (MCM y MCD)";
      case WORD_PROBLEM_EQUATION -> "Problemas que se resuelven con ecuaciones";
      case MUSTACHE -> "Plantilla libre con Mustache";
      default -> type.name().replace("_", " ").toLowerCase();
    };
  }
}
