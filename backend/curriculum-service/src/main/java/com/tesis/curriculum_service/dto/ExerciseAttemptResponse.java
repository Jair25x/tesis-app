package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta que representa el resultado de registrar un intento de
 * ejercicio.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Respuesta al registrar un intento de ejercicio")
public class ExerciseAttemptResponse {

    @Schema(description = "ID del intento", example = "1")
    private Long id;

    @Schema(description = "UUID del ejercicio relacionado", example = "f3c1a8d2-5cfa-4f22-bbb6-3b8d3e0e2abc")
    private UUID exerciseId;

    @Schema(description = "¿El intento fue correcto?", example = "false")
    private boolean correct;

    @Schema(description = "Pistas usadas", example = "2")
    private int hintsUsed;

    @Schema(description = "Tiempo invertido (milisegundos)", example = "14500")
    private long timeSpent;

    @Schema(description = "Respuesta enviada por el estudiante", example = "25")
    private String submittedAnswer;

    @Schema(description = "Fecha y hora del intento", example = "2025-07-17T10:45:30")
    private LocalDateTime attemptedAt;

    // Opcional: campos de auditoría (si quieres exponerlos)
    @Schema(description = "Creado por", example = "student123")
    private String createdBy;

    @Schema(description = "Fecha de creación", example = "2025-07-17T10:45:30")
    private LocalDateTime createdAt;
}
