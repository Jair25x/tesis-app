package com.tesis.classroom_service.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "GenerateJoinCodeRequest")
public class GenerateJoinCodeRequest {

  @Min(1)
  @Schema(description = "Tiempo de vida del código en minutos (default: 1440 = 24h)", example = "60")
  private Integer ttlMinutes;

  @Positive
  @Schema(description = "Usos máximos permitidos (null = ilimitado)", example = "30")
  private Integer maxUses;
}
