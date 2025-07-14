// src/main/java/com/tesis/curriculum_service/dto/TemplateSchema.java
package com.tesis.curriculum_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Define el esquema de una plantilla de ejercicio:
 * - templateType: tipo de plantilla (ver {@link TemplateType}).
 * - pattern: cadena Mustache con variables {{…}}.
 * - fields: descriptores de cada variable esperada.
 */
@Data
@Builder
public class TemplateSchema {
  private TemplateType templateType;
  private String pattern;
  private List<FieldDescriptor> fields;

  /**
   * Los tipos de plantilla disponibles, agrupados por categoría.
   */
  public enum TemplateType {
    // 1. TABLAS Y PATRONES
    TBL_MATCH,
    PATTERN_FORMATION,
    // Templates adicionales
    /**
     * Plantilla para analizar moda en tablas de frecuencia.
     */
    FREQUENCY_ANALYSIS,

    /**
     * Plantilla para calcular el total en tablas de frecuencia.
     */
    FREQUENCY_TOTAL,
    // 2. MÚLTIPLOS Y DIVISORES
    MULTIPLES_SEARCH,
    DIVISORS_SEARCH,
    GCD_FIND,
    MULT_DIV_CHALLENGE,
    // 3. PROBABILIDAD Y ESTADÍSTICA
    BASIC_PROB_DECISION,
    BAR_GRAPH_READING,
    STATISTICAL_GRAPH,
    // 4. ÁREAS Y VÓLÚMENES
    PRISM_CONSTRUCTION,
    CYLINDER_VOLUME,
    RECT_TRIANGLE_AREA,
    PARALLELOGRAM_AREA,
    PERIMETER_AREA_RELATION,
    // 5. OPERACIONES BÁSICAS Y DECIMALES
    BASIC_OPERATIONS,
    DECIMAL_COMPARISON,
    UNIT_VALUE,
    PERCENTAGE_FRACTION,
    // 6. FIGURAS Y PROPORCIONALIDAD
    SHAPE_IDENTIFICATION,
    PROPORTIONALITY,
    SCALE_UP_DOWN,
    RATIO_SPLIT,
    // 7. ECUACIONES E INECUACIONES
    EQUATION_SOLVE,
    INEQUATION_SOLVE
  }
}
