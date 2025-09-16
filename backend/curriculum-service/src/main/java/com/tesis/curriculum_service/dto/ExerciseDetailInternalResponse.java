package com.tesis.curriculum_service.dto;

import java.util.List;
import java.util.UUID;

/** Respuesta ligera para RAG (uso interno S2S). */
public record ExerciseDetailInternalResponse(
    UUID exerciseId,
    UUID objectiveId,
    String difficulty, // EASY|MEDIUM|HARD
    String title, // derivado del enunciado
    String statement, // enunciado plano (sin HTML)
    List<String> hints, // solo el texto
    List<String> solutionSteps // explicaciones ordenadas
) {
}
