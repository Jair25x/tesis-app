package com.tesis.assessment_service.dto.response;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Detalle de plantilla. */
public record TemplateResponse(
    UUID id,
    UUID ownerUuid,
    String title,
    UUID curriculumId,
    JsonNode config,
    List<TemplateItemResponse> items,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {
}
