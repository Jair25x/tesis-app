// src/main/java/com/tesis/progress_service/dto/ObjectiveCoverageDto.java
package com.tesis.progress_service.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ObjectiveCoverageDto {
  private UUID objectiveId;
  private int solvedDistinct;  // ejercicios distintos correctos por OA
  private int totalExercises;  // total ejercicios activos del OA (curriculum-service)
}
