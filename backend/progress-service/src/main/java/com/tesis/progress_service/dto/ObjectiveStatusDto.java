package com.tesis.progress_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Respuesta simple para FE: estado por objetivo del alumno autenticado. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObjectiveStatusDto {
    private String objectiveId;   // UUID como String para simplificar FE
    private String status;        // "COMPLETED" | "IN_PROGRESS" | (opcional) "NOT_STARTED"
}
