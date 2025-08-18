package com.tesis.classroom_service.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(name = "ErrorResponse", description = "Estructura estándar de error")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

  @Schema(example = "Mensaje de error")
  private String message;

  @Schema(example = "400")
  private int status;

  @Schema(example = "1734012345678")
  private long timestamp;
}
