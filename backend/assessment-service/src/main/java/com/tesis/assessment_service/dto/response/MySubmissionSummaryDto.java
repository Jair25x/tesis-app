package com.tesis.assessment_service.dto.response;

import com.tesis.assessment_service.model.enums.AssignmentScope;
import com.tesis.assessment_service.model.enums.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class MySubmissionSummaryDto {
  private UUID submissionId;
  private UUID assignmentId;
  private String templateTitle; // nullable
  private Integer attemptNo; // nullable
  private SubmissionStatus status; // IN_PROGRESS | SUBMITTED | GRADED | CANCELED
  private BigDecimal score; // nullable
  private BigDecimal maxScore; // nullable
  private OffsetDateTime startedAt; // nullable
  private OffsetDateTime submittedAt; // nullable
  private OffsetDateTime gradedAt; // nullable
  private AssignmentScope scope; // PUBLIC | CLASSROOM
  private String classroomName; // nullable (placeholder, se puede poblar luego)
}
