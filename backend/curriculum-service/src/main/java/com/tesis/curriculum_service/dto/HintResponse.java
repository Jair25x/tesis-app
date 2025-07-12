// src/main/java/com/tesis/curriculum_service/dto/HintResponse.java
package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de salida que representa una pista (Hint) de un ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "HintResponse", description = "Detalle de una pista de un ejercicio")
public class HintResponse {

  @Schema(description = "ID único de la pista", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID id;

  @Schema(description = "Texto de la pista", example = "Recuerda usar la propiedad distributiva")
  private String hintText;

  @Schema(description = "Coste en puntos al solicitar esta pista", example = "5")
  private Integer cost;

  @Schema(description = "ID del ejercicio asociado", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID exerciseId;

  @Schema(description = "Fecha de creación", example = "2025-07-12T15:30:00")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha de última actualización", example = "2025-07-13T12:45:20")
  private LocalDateTime updatedAt;
}
