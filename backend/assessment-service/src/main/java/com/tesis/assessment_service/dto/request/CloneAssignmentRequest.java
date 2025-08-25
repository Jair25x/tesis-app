package com.tesis.assessment_service.dto.request;

import com.tesis.assessment_service.model.enums.AssignmentScope;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Parámetros opcionales para clonar una asignación. */
public record CloneAssignmentRequest(
    AssignmentScope scope, // si null, se conserva el scope del origen
    UUID classroomId, // si scope=CLASSROOM y null => error
    OffsetDateTime windowStart, // overrides si no null
    OffsetDateTime windowEnd, // overrides si no null
    Integer timeLimitSec, // overrides si no null
    Integer attemptsAllowed // overrides si no null
) {
}
