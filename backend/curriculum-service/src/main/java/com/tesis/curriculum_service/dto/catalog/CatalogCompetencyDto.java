// src/main/java/com/tesis/curriculum_service/dto/catalog/CatalogCompetencyDto.java
package com.tesis.curriculum_service.dto.catalog;

import java.util.UUID;

public record CatalogCompetencyDto(
    UUID id,
    String code,
    String name,
    String description,
    UUID curriculumId,
    String curriculumName) {
}
