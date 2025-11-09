// src/main/java/com/tesis/progress_service/dto/AttemptEventRequest.java
package com.tesis.progress_service.dto;

import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/** Evento S2S desde assessment-service. */
@Data
public class AttemptEventRequest {

  @NotNull
  private UUID studentId;
  @NotNull
  private UUID curriculumId;
  @NotNull
  private UUID exerciseId;
  @NotNull
  private UUID objectiveId;

  private String source; // "ASSESSMENT" u otro
  private Boolean correct; // puede venir null
  private BigDecimal normalizedScore; // 0..1 (preferido)
  private Integer awardedPoints; // puntos logrados
  private Integer maxPoints; // puntos máximos
  private ObjectNode metadata; // assignmentId, submissionId, submissionItemId, etc.
}
