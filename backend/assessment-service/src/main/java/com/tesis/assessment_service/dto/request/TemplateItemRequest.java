package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.model.enums.GradingMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Ítem de plantilla enviado por el cliente.
 * - points y position son opcionales (Integer). Si vienen null o inválidos, el
 * service asigna defaults.
 * - gradingMode es opcional; si es null, el service asume AUTO.
 */
public record TemplateItemRequest(
        @NotNull UUID objectiveId,
        @NotNull UUID exerciseId,
        @Min(1) Integer points, // opcional; default=1 si null o <1
        @Min(1) Integer position, // opcional; el service re-secuencia 1..N si viene null/<1
        GradingMode gradingMode // opcional; default=AUTO si null
) {
}
