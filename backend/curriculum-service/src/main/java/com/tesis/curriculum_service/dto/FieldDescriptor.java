// src/main/java/com/tesis/curriculum_service/dto/FieldDescriptor.java
package com.tesis.curriculum_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Describe una variable que aparece en el patrón Mustache:
 * - name: nombre de la variable (p.ej. "a", "b").
 * - type: tipo de dato esperado.
 * - min/max: rango si es numérico.
 * - choices: lista de opciones si es de selección.
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FieldDescriptor {

  @Schema(description = "Nombre de la variable en la plantilla (ej. 'a', 'b')", example = "a")
  @NotNull
  private String name;

  @Schema(description = "Tipo de la variable", example = "NUMBER")
  @NotNull
  private FieldType type;

  @Schema(description = "Valor mínimo permitido (solo para type=NUMBER)", example = "1")
  @Min(0)
  private Integer min;

  @Schema(description = "Valor máximo permitido (solo para type=NUMBER)", example = "10")
  @Min(0)
  private Integer max;

  @Schema(description = "Opciones permitidas (solo para type=CHOICE)", example = "[\"Rojo\",\"Verde\",\"Azul\"]")
  @Size(min = 1)
  private List<String> choices;

  /**
   * Tipos de dato que admite una variable de plantilla.
   */
  @Schema(description = "Tipos de campo permitidos en la plantilla")
  public enum FieldType {
    /** Número entero dentro de [min..max]. */
    NUMBER,
    /** Selección única de entre un conjunto de valores. */
    CHOICE,
    /** Cadena de texto libre. */
    TEXT
  }
}
