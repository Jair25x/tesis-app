package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.SubmissionStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Resumen de submission para listados. */
public record SubmissionSummaryDto(
    UUID submissionId,
    UUID studentId,
    SubmissionStatus status,
    BigDecimal score,
    BigDecimal maxScore,
    OffsetDateTime startedAt,
    OffsetDateTime submittedAt,
    OffsetDateTime gradedAt,
    Integer durationSec,
    Integer attemptNo) {
}
