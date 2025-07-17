package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta tras guardar un intento de ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Respuesta del sistema después de registrar un intento de ejercicio")
public class ExerciseAttemptResponse {

    @Schema(description = "ID del intento registrado", example = "1")
    private Long id;

    @Schema(description = "UUID del ejercicio al que se intentó responder", example = "f3c1a8d2-5cfa-4f22-bbb6-3b8d3e0e2abc")
    private UUID exerciseId;

    @Schema(description = "Indica si la respuesta fue correcta", example = "true")
    private boolean correct;

    @Schema(description = "Cantidad de pistas utilizadas", example = "1")
    private int hintsUsed;

    @Schema(description = "Tiempo que tardó el estudiante (en milisegundos)", example = "18000")
    private long timeSpent;

    @Schema(description = "Respuesta enviada por el estudiante", example = "40")
    private String submittedAnswer;

    @Schema(description = "Fecha y hora del intento", example = "2025-07-17T10:23:45")
    private LocalDateTime attemptedAt;
}
