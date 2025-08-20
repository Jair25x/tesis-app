// src/main/java/com/tesis/classroom_service/dto/response/JoinCodeDto.java
package com.tesis.classroom_service.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "JoinCodeDto")
public class JoinCodeDto {

  @Schema(description = "Código en mayúsculas", example = "ABCD23")
  private String code;

  @Schema(description = "Fecha/hora de expiración (UTC)")
  private OffsetDateTime expiresAt;

  @Schema(description = "Usos máximos permitidos (null = ilimitado)")
  private Integer maxUses;

  @Schema(description = "Usos consumidos")
  private Integer usedCount;

  @Schema(description = "Usos restantes (null si ilimitado)")
  private Integer remainingUses;
}
