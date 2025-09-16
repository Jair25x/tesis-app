package com.tesis.curriculum_service.dto;

import java.util.UUID;

public record ObjectiveExerciseLiteResponse(
    UUID exerciseId,
    UUID objectiveId,
    String difficulty, // mapeado a EASY|MEDIUM|HARD para el advisor
    String title // derivado de statement
) {
}
