package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Crear asignación de evaluación. */
public record AssignmentRequest(
    @NotNull UUID templateId,
    @NotNull AssignmentScope scope,
    UUID classroomId, // requerido si scope=CLASSROOM
    AssignmentType type, // opcional (default FORMATIVE)
    OffsetDateTime windowStart, // opcional
    OffsetDateTime windowEnd, // opcional
    @Min(1) Integer timeLimitSec, // opcional
    @Min(1) Integer attemptsAllowed // opcional (default 1)
) {
}
