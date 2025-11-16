package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "CheckAnswerResponse", description = "Resultado de la validación de una respuesta.")
public class CheckAnswerResponse {

  @Schema(description = "¿La respuesta global es correcta? Para plantillas con varias sub-preguntas, puede ser true si el puntaje supera un umbral, o false si exige todo correcto.")
  private boolean correct;

  @Schema(description = "Puntaje entre 0 y 1 (opcional si se admite calificación parcial).")
  private Double score;

  @Schema(description = "Resultados por sub-pregunta (si aplica): { \"q1\": true, \"q2\": false }")
  private Map<String, Boolean> questionResults;

  @Schema(description = "Feedback breve para el estudiante. No incluir soluciones completas aquí.")
  private String feedback;

  // ───────────── META OFICIAL PARA TRAZABILIDAD ─────────────

  @Schema(description = "ID oficial del currículo al que pertenece el ejercicio.")
  private UUID curriculumId;

  @Schema(description = "ID oficial del objetivo de aprendizaje al que pertenece el ejercicio.")
  private UUID learningObjectiveId;

  @Schema(description = "Dificultad oficial del ejercicio (p.ej. BASIC, INTERMEDIATE, ADVANCED).")
  private String difficulty;

  @Schema(description = "Puntaje máximo posible para el ejercicio. Por defecto 1.0.")
  private Double maxScore;
}
