// src/main/java/com/tesis/curriculum_service/dto/StandardResponse.java
package com.tesis.curriculum_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "StandardResponse", description = "Información detallada de un estándar de aprendizaje")
public class StandardResponse {

  @Schema(description = "Identificador único del estándar", example = "7c3e4a85-6789-1234-abcd-9f8e7d6c5b4a")
  private UUID id;

  @Schema(description = "Nombre o título breve del estándar", example = "Ecuaciones Lineales")
  private String name;

  @Schema(description = "Descripción detallada del estándar", example = "Resolver ecuaciones de primer grado con una incógnita")
  private String description;

  @Schema(description = "Código único del estándar", example = "STD-ALG-01")
  private String code;

  @Schema(description = "ID de la competencia a la que pertenece este estándar", example = "5b2d3f74-1234-4a2b-9cde-1a2b3c4d5e6f")
  private UUID competencyId;

  @Schema(description = "Fecha y hora de creación del estándar", example = "2025-07-12T10:15:30.000")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha y hora de la última actualización", example = "2025-07-13T14:20:45.000")
  private LocalDateTime updatedAt;

  @Schema(description = "Indica si el estandar está activo")
  private Boolean active;
}
