package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.dto.common.FeedbackPayload;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Calificación manual de un ítem. */
public record GradeItemRequest(
    @NotNull Boolean correct,
    @NotNull @Min(0) BigDecimal score,
    FeedbackPayload feedback) {
}
