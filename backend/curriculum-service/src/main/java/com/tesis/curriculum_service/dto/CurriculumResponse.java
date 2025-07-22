package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "CurriculumResponse", description = "Representación de un currículo con sus metadatos")
public class CurriculumResponse {

  @Schema(description = "Identificador único del currículo", example = "3fa85f64-5717-4562-b3fc-2c963f66afa6")
  private UUID id;

  @Schema(description = "Nombre del currículo", example = "Matemáticas Básicas")
  private String name;

  @Schema(description = "Descripción opcional del currículo", example = "Currículo de matemáticas para 1er grado")
  private String description;

  @Schema(description = "Código único del currículo", example = "CURR-MAT-1")
  private String code;

  @Schema(description = "Grado escolar al que aplica", example = "1er grado")
  private String grade;

  @Schema(description = "Fecha y hora de creación del registro")
  private LocalDateTime createdAt;

  @Schema(description = "Fecha y hora de la última actualización")
  private LocalDateTime updatedAt;

  @Schema(description = "Indica si el currículo está activo")
  private Boolean active;

  @Schema(description = "Usuario que creó el currículo", example = "admin")
  private String createdBy;

  @Schema(description = "Usuario que actualizó por última vez el currículo", example = "admin")
  private String updatedBy;

  @Schema(description = "Usuario que eliminó (lógicamente) el currículo, si aplica", example = "admin")
  private String deletedBy;

  @Schema(description = "Fecha de eliminación lógica, si aplica")
  private LocalDateTime deletedAt;
}
