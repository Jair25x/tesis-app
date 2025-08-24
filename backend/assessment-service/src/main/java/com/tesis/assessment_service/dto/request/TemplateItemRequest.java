package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.model.enums.GradingMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Ítem de plantilla: objetivo, ejercicio, puntos, posición, modo de
 * calificación.
 */
public record TemplateItemRequest(
    @NotNull UUID objectiveId,
    @NotNull UUID exerciseId,
    @Min(1) int points,
    @Min(1) int position,
    GradingMode gradingMode // opcional: si null, backend inferirá AUTO/MANUAL
) {
}
