package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AssignmentSummaryResponse(
                UUID id,
                UUID templateId,
                String templateTitle,
                AssignmentScope scope,
                AssignmentType type,
                AssignmentState state,
                OffsetDateTime windowStart,
                OffsetDateTime windowEnd,
                Integer timeLimitSec,
                Integer attemptsAllowed,
                UUID classroomId,
                String classroomName, // <--- NUEVO (opcional)
                UUID createdByUserId,
                OffsetDateTime createdAt,
                OffsetDateTime updatedAt) {
}
