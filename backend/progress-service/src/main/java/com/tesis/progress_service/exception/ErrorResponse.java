package com.tesis.progress_service.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Schema(name = "ErrorResponse", description = "Estructura estándar de error")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
  @Schema(example = "No autorizado")
  private String message;

  @Schema(example = "401")
  private int status;

  @Schema(example = "1734012345678")
  private long timestamp;
}
