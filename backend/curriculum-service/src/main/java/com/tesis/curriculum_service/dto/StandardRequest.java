package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "StandardRequest", description = "Datos necesarios para crear o actualizar un estándar dentro de una competencia")
public class StandardRequest {

  @Schema(description = "Nombre o título breve del estándar", example = "Ecuaciones Lineales")
  @NotBlank
  private String name;

  @Schema(description = "Descripción detallada del estándar", example = "Resolver ecuaciones de primer grado con una incógnita")
  @NotBlank
  private String description;

  @Schema(description = "Código único del estándar", example = "STD-ALG-01")
  @NotBlank
  private String code;
}
