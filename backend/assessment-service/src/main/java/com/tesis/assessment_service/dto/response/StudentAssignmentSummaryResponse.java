package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.AssignmentState;
import com.tesis.assessment_service.model.enums.AssignmentType;
import com.tesis.assessment_service.model.enums.SubmissionStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StudentAssignmentSummaryResponse(
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
                Integer attemptsUsed,
                boolean canStart,
                boolean started,
                boolean submitted,
                // opcionales:
                UUID lastSubmissionId,
                SubmissionStatus lastStatus,
                UUID classroomId,
                String classroomName) {
}
