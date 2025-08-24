package com.tesis.assessment_service.dto.common;

import com.fasterxml.jackson.databind.JsonNode;

/** Envoltorio para feedback flexible (auto o manual). */
public record FeedbackPayload(JsonNode value) {
}
