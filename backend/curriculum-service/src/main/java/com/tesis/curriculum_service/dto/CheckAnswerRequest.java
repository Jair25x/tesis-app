package com.tesis.curriculum_service.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(name = "CheckAnswerRequest", description = "Respuesta del estudiante para validar un ejercicio. Estructura flexible según el templateType.")
public class CheckAnswerRequest {

  @Schema(description = """
      Estructura de la respuesta del estudiante.
      Ejemplos:
      - Single choice: { "value": "Cantar" }
      - Numérica: { "value": 40 }
      - Múltiples sub-preguntas: { "answers": { "q1": "Ajedrez", "q2": 40 } }
      - Geometría (puntos): { "point": [3, 0] }
      """)
  @NotNull
  private JsonNode answer;
}