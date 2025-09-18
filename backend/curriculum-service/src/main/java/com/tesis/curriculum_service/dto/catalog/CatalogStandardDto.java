// src/main/java/com/tesis/curriculum_service/dto/catalog/CatalogStandardDto.java
package com.tesis.curriculum_service.dto.catalog;

import java.util.UUID;

public record CatalogStandardDto(
    UUID id,
    String code,
    String name,
    String description,
    UUID curriculumId,
    String curriculumName,
    UUID competencyId,
    String competencyName) {
}
