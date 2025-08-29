package com.tesis.assessment_service.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/** Crear/actualizar plantilla de evaluación. */
public record TemplateRequest(
        @NotBlank String title,
        @NotNull UUID curriculumId,
        @NotEmpty @Valid List<TemplateItemRequest> items,
        JsonNode config // {shuffle, showFeedback, allowHints, ...}
) {
}
