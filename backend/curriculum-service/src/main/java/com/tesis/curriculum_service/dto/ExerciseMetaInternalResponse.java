// src/main/java/com/tesis/curriculum_service/dto/ExerciseMetaInternalResponse.java
package com.tesis.curriculum_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

/**
 * Metadatos ligeros de un ejercicio para consumo S2S.
 * NO expone enunciado, hints ni respuestas.
 */
@Schema(
    name = "ExerciseMetaInternalResponse",
    description = "Metadatos jerárquicos y de dificultad de un ejercicio (uso S2S interno)."
)
public record ExerciseMetaInternalResponse(
    UUID exerciseId,
    UUID learningObjectiveId,
    UUID standardId,
    UUID competencyId,
    UUID curriculumId,
    String difficulty,      // BASIC/INTERMEDIATE/ADVANCED → o el enum.name()
    Boolean active,
    Boolean diagnostic
) {}
