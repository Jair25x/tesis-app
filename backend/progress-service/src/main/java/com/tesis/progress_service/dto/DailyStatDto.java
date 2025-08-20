package com.tesis.progress_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "DailyStatDto", description = "Métricas diarias")
public class DailyStatDto {

  @Schema(description = "Fecha (UTC, YYYY-MM-DD)")
  private LocalDate date;

  @Schema(description = "Intentos totales del día")
  private int attempts;

  @Schema(description = "Respuestas correctas del día")
  private int correct;

  @Schema(description = "Alumnos activos (con ≥1 intento) ese día. Solo aplica a series de aula.")
  private Integer activeStudents; // opcional; en series por estudiante puede venir null
}
