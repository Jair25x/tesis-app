package com.tesis.classroom_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "CreateClassroomRequest")
public class CreateClassroomRequest {

  @NotBlank
  @Size(max = 120)
  @Schema(description = "Nombre del aula", example = "6to A - Matemática")
  private String name;

  @Size(max = 2000)
  @Schema(description = "Descripción opcional", example = "Aula principal del turno mañana")
  private String description;

  @Size(max = 20)
  @Schema(description = "Grado opcional", example = "6to")
  private String grade;

  @Size(max = 50)
  @Schema(description = "Asignatura opcional", example = "Matemática")
  private String subject;
}
