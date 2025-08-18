package com.tesis.classroom_service.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "ClassroomSummaryDto")
public class ClassroomSummaryDto {

  @Schema(description = "ID del aula")
  private UUID id;

  @Schema(description = "Nombre")
  private String name;

  @Schema(description = "Descripción")
  private String description;

  @Schema(description = "Grado")
  private String grade;

  @Schema(description = "Asignatura")
  private String subject;

  @Schema(description = "Número de miembros")
  private int membersCount;

  @Schema(description = "Estado (soft delete)")
  private boolean active;
}
