// src/main/java/com/tesis/curriculum_service/dto/catalog/CatalogExerciseDto.java
package com.tesis.curriculum_service.dto.catalog;

import java.util.UUID;

public record CatalogExerciseDto(
    UUID id,
    String type,
    String difficulty, // Enum como texto
    String statementPreview,
    UUID curriculumId,
    String curriculumName,
    UUID competencyId,
    String competencyName,
    UUID standardId,
    String standardName,
    UUID objectiveId,
    String objectiveName) {
}
