package com.tesis.curriculum_service.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear o actualizar una Competency.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(
  name = "CompetencyRequest",
  description = "Datos necesarios para crear o actualizar una competencia dentro de un currículo"
)
public class CompetencyRequest {

  @Schema(
    description = "Nombre de la competencia",
    example = "Álgebra Básica"
  )
  @NotBlank
  private String name;

  @Schema(
    description = "Descripción detallada de la competencia",
    example = "Comprender y aplicar las operaciones básicas de álgebra"
  )
  @NotBlank
  private String description;

  @Schema(
    description = "Código único de la competencia",
    example = "COMP-ALG-01"
  )
  @NotBlank
  private String code;

  @Schema(
    description = "ID del currículo al que pertenece esta competencia",
    example = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  )
  @NotNull
  private UUID curriculumId;
}
