package com.tesis.curriculum_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear o actualizar un Currículo.
 * Se valida automáticamente con @Valid en el controlador.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurriculumRequest {

  @NotBlank(message = "El nombre del currículo no puede estar vacío")
  @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
  private String name;

  @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
  private String description;

  @NotBlank(message = "El código del currículo es obligatorio")
  @Size(max = 50, message = "El código no puede exceder 50 caracteres")
  private String code;

  @NotBlank(message = "El grado es obligatorio")
  @Size(max = 100, message = "El grado no puede exceder 100 caracteres")
  private String grade;
}
