// src/main/java/com/tesis/curriculum_service/dto/TemplateSchema.java
package com.tesis.curriculum_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Esquema de una plantilla de ejercicio.
 * - Para plantillas Mustache (EQUATION_SINGLE_CHOICE) usamos pattern + fields.
 * - Para plantillas ricas (FREQUENCY_*) el frontend pinta componentes
 * específicos con "parameters".
 */
@Data
@Builder
public class TemplateSchema {

  private TemplateType templateType;

  /** Patrón Mustache (solo aplica a EQUATION_SINGLE_CHOICE si lo usas) */
  private String pattern;

  /** Campos para Mustache (opcional) */
  private List<FieldDescriptor> fields;

  /** Reglas/metadata de validación (opcional y específico por tipo) */
  private JsonNode validation;

  /** Datos de ejemplo de "parameters" para preview/test (opcional) */
  private JsonNode example;

  /** Sugerencias de UI (opcional) */
  private JsonNode uiHints;

  public enum TemplateType {
    EQUATION_SINGLE_CHOICE,
    FREQUENCY_TABLE_QA,
    FREQUENCY_TABLE_COMPLETE
  }
}