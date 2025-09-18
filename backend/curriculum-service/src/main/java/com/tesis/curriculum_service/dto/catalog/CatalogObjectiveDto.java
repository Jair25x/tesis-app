// src/main/java/com/tesis/curriculum_service/dto/catalog/CatalogObjectiveDto.java
package com.tesis.curriculum_service.dto.catalog;

import java.util.UUID;

public record CatalogObjectiveDto(
    UUID id,
    String code,
    String name,
    String description,
    UUID curriculumId,
    String curriculumName,
    UUID competencyId,
    String competencyName,
    UUID standardId,
    String standardName) {
}
