package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.GradingMode;

import java.util.UUID;

/** Ítem de plantilla (respuesta). */
public record TemplateItemResponse(
    UUID id,
    UUID objectiveId,
    UUID exerciseId,
    int points,
    int position,
    GradingMode gradingMode) {
}
