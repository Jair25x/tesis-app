package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Detalle de asignación. */
public record AssignmentResponse(
    UUID id,
    UUID templateId,
    AssignmentScope scope,
    AssignmentType type,
    UUID classroomId,
    AssignmentState state,
    OffsetDateTime windowStart,
    OffsetDateTime windowEnd,
    Integer timeLimitSec,
    Integer attemptsAllowed,
    UUID createdByUserId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt) {
}
