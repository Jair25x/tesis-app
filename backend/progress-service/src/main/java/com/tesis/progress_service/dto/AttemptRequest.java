package com.tesis.progress_service.dto;

import com.tesis.progress_service.model.enums.AttemptSource;
import jakarta.validation.constraints.NotNull;
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

  // Metadatos del ejercicio (útiles para analítica rápida y evitar otro lookup)
  private String templateType; // opcional si el frontend lo envía
  private String difficulty; // opcional

  @Builder.Default
  private AttemptSource source = AttemptSource.PRACTICE; // PRACTICE o ASSESSMENT

  private String sessionId; // p.ej. sesión de práctica o evaluación
  private UUID sourceRefId; // opcional: assessmentId u otro origen

  // Datos de la respuesta del alumno
  private Map<String, Object> answer; // JSON payload
  private Integer durationMs;
  private Integer hintsUsed;
}
