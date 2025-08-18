package com.tesis.classroom_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "JoinRequest")
public class JoinRequest {

  @NotBlank
  @Size(min = 6, max = 12)
  @Pattern(regexp = "^[A-Z0-9]+$", message = "El código debe ser alfanumérico en mayúsculas (A-Z, 0-9)")
  @Schema(description = "Código de ingreso en mayúsculas", example = "ABCD23")
  private String code;
}
