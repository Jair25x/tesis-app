package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.Map;

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
}