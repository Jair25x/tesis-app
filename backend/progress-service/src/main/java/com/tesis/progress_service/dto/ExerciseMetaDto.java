// src/main/java/com/tesis/progress_service/dto/ExerciseMetaDto.java
package com.tesis.progress_service.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ExerciseMetaDto(
    UUID exerciseId,
    UUID learningObjectiveId,
    UUID standardId,
    UUID competencyId,
    UUID curriculumId,
    String difficulty,
    Boolean active,
    Boolean diagnostic
) {}
