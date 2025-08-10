package com.tesis.curriculum_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateSchemaResponse {
  private TemplateType type;
  private String description;
  private JsonNode example;
  private JsonNode uiHints; // opcional
}
