// src/main/java/com/tesis/progress_service/dto/StudentOverviewDto.java
package com.tesis.progress_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "StudentOverviewDto", description = "Resumen de progreso por estudiante")
public class StudentOverviewDto {
  private UUID studentId;
  private OverviewDto overview;
}
