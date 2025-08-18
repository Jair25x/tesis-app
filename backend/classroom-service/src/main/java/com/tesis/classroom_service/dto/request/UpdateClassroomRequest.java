package com.tesis.classroom_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "UpdateClassroomRequest")
public class UpdateClassroomRequest {

  @Size(max = 120)
  @Schema(description = "Nuevo nombre (opcional)")
  private String name;

  @Size(max = 2000)
  @Schema(description = "Nueva descripción (opcional)")
  private String description;

  @Size(max = 20)
  @Schema(description = "Nuevo grado (opcional)")
  private String grade;

  @Size(max = 50)
  @Schema(description = "Nueva asignatura (opcional)")
  private String subject;

  @Schema(description = "Activar/desactivar el aula (soft delete lógico)")
  private Boolean active;
}
