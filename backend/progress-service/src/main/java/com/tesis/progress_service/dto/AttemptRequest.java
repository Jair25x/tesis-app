package com.tesis.progress_service.dto;

import com.tesis.progress_service.model.enums.AttemptSource;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptRequest {

  @NotNull
  private UUID curriculumId;
  @NotNull
  private UUID learningObjectiveId;
  @NotNull
  private UUID exerciseId;

  // Metadatos del ejercicio
  @Size(max = 64, message = "templateType excede 64 caracteres")
  private String templateType;

  @Size(max = 32, message = "difficulty excede 32 caracteres")
  private String difficulty;

  @Builder.Default
  private AttemptSource source = AttemptSource.PRACTICE;

  @Size(max = 128, message = "sessionId excede 128 caracteres")
  private String sessionId;

  private UUID sourceRefId; // assessmentId u otro origen

  // Datos de la respuesta del alumno
  private Map<String, Object> answer;
  private Integer durationMs;
  private Integer hintsUsed;
}
