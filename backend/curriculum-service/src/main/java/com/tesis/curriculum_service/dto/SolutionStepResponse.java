package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de salida que representa un paso de solución de un ejercicio,
 * incluyendo datos de auditoría.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "SolutionStepResponse", description = "Un paso de solución de un ejercicio, con su número de orden, explicación y metadatos")
public class SolutionStepResponse {

  @Schema(description = "ID único del paso", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID id;

  @Schema(description = "Número del paso dentro de la solución", example = "1")
  private Integer stepNumber;

  @Schema(description = "Texto explicativo de este paso", example = "Factoriza la ecuación en (x−2)(x−3)=0")
  private String explanation;

  @Schema(description = "ID del ejercicio asociado", example = "9f8a8f4c-b8dd-489a-bf89-123456789abc")
  private UUID exerciseId;

  @Schema(description = "Fecha de creación", example = "2025-07-12T15:30:00")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha de última actualización", example = "2025-07-13T12:45:20")
  private LocalDateTime updatedAt;

  @Schema(description = "¿Está activo?", example = "true")
  private Boolean active;

  @Schema(description = "Fecha de eliminación lógica", example = "2025-07-14T11:22:00")
  private LocalDateTime deletedAt;

  @Schema(description = "Usuario que creó el paso", example = "admin@colegio.edu.pe")
  private String createdBy;

  @Schema(description = "Usuario que actualizó el paso", example = "admin@colegio.edu.pe")
  private String updatedBy;

  @Schema(description = "Usuario que eliminó el paso", example = "admin@colegio.edu.pe")
  private String deletedBy;
}
