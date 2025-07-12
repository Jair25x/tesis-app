// src/main/java/com/tesis/curriculum_service/dto/HintRequest.java
package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de petición para crear o actualizar una pista (Hint).
 * El ID del ejercicio se toma de la ruta REST, no del body.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "HintRequest", description = "Datos para crear o actualizar una pista de un ejercicio")
public class HintRequest {

  @NotBlank
  @Schema(description = "Texto de la pista", example = "Recuerda usar la propiedad distributiva")
  private String hintText;

  @Min(0)
  @Schema(description = "Coste en puntos al solicitar esta pista", example = "5")
  private Integer cost;
}
