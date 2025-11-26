// src/main/java/com/tesis/curriculum_service/dto/TemplateSchema.java
package com.tesis.curriculum_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Esquema de una plantilla de ejercicio.
 *
 * - Para plantillas Mustache (EQUATION_SINGLE_CHOICE) usamos pattern + fields.
 * - Para plantillas "ricas" (FREQUENCY_*, NUMBER_WORDS_*, PLACE_VALUE_*, etc.)
 * el frontend pinta componentes específicos usando "parameters".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateSchema {

  /** Tipo de plantilla (clave estable compartida con el frontend). */
  private TemplateType templateType;

  /** Patrón Mustache (solo aplica a EQUATION_SINGLE_CHOICE si lo usas). */
  private String pattern;

  /** Campos para Mustache (opcional). */
  private List<FieldDescriptor> fields;

  /** Reglas/metadata de validación (opcional y específico por tipo). */
  private JsonNode validation;

  /** Datos de ejemplo de "parameters" para preview/test (opcional). */
  private JsonNode example;

  /** Sugerencias de UI (opcional, el FE puede usarlas o ignorarlas). */
  private JsonNode uiHints;

  public enum TemplateType {
    // Unidad de candados / ecuaciones (ejemplo)
    EQUATION_SINGLE_CHOICE,

    // Tablas de frecuencia (datos e incertidumbre)
    FREQUENCY_TABLE_QA,
    FREQUENCY_TABLE_COMPLETE,

    // NUEVOS (Unidad 1 – 4.º)
    NUMBER_WORDS_BIDIR, // números ↔ palabras en español
    PLACE_VALUE_QA, // valor posicional / descomposición
    BASE_TEN_BLOCKS_QA, // bloques base diez → número
    NUMBER_SEQUENCE_QA // reglas y continuación de secuencias
  }
}
