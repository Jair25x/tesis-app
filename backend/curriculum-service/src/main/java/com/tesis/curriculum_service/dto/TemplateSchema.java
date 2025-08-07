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
   * Tipos de plantilla disponibles, organizados por competencia matemática.
   */
  public enum TemplateType {

    // === COMPETENCIA: RESOLUCIÓN DE PROBLEMAS DE CANTIDAD ===
    BASIC_OPERATIONS, // Ejercicios de suma, resta, multiplicación, división
    UNIT_VALUE, // Ejercicios con valores unitarios (como el de las cajas de candados)
    FRACTION_PROBLEM_SOLVING, // Problemas con fracciones
    DECIMAL_COMPARISON, // Comparar decimales
    MULTIPLES_AND_FACTORS, // Problemas sobre MCM y mcd
    WORD_PROBLEM_EQUATION, // Problemas que se traducen en ecuaciones simples

    // === COMPETENCIA: REGULARIDAD, EQUIVALENCIA Y CAMBIO ===
    PATTERN_FORMATION, // Formación de patrones en espiral o secuencia
    PROPORTIONALITY, // Razones y proporciones
    SCALE_UP_DOWN, // Escalamiento
    RATIO_SPLIT, // División en razón

    // === COMPETENCIA: GESTIÓN DE DATOS E INCERTIDUMBRE ===
    TBL_MATCH, // Relacionar datos en tablas
    FREQUENCY_ANALYSIS, // Análisis de moda y frecuencia
    FREQUENCY_TOTAL, // Cálculo de totales en tabla
    BAR_GRAPH_READING, // Interpretar gráficos de barras
    BASIC_PROB_DECISION, // Problemas básicos de probabilidad
    PROBABILITY_SINGLE_EVENT, // Eventos simples como lanzar un dado

    // === COMPETENCIA: FORMA, MOVIMIENTO Y LOCALIZACIÓN ===
    SHAPE_IDENTIFICATION, // Identificar figuras planas y sólidas
    PRISM_CONSTRUCTION, // Armado de prismas (como el ejercicio de armar un cubo)
    POSITION_RECOGNITION, // Identificación de posiciones y coordenadas

    // === COMPETENCIA: ECUACIONES E INECUACIONES ===
    EQUATION_SOLVE, // Resolver ecuaciones básicas
    INEQUATION_SOLVE, // Resolver inecuaciones

    // === OTROS (si fueran necesarios en el futuro) ===
    CUSTOM_STATIC_IMAGE_CHOICE, // Plantilla para ejercicios con imagen estática y selección de opción (usado
                                // con pizarra)
    MULT_DIV_CHALLENGE,

    MUSTACHE // Plantilla libre para renderizado dinámico con Mustache
  }
}
