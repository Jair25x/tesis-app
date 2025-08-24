package com.tesis.assessment_service.dto.common;

import com.fasterxml.jackson.databind.JsonNode;

/** Envoltorio para respuestas flexibles del alumno. */
public record AnswerPayload(JsonNode value) {
}
