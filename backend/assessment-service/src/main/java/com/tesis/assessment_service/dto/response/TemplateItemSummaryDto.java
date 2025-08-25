package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.GradingMode;

import java.util.UUID;

public record TemplateItemSummaryDto(
    UUID objectiveId,
    UUID exerciseId,
    GradingMode gradingMode,
    Integer points,
    Integer position) {
}
