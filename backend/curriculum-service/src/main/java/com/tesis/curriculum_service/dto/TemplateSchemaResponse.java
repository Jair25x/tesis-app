package com.tesis.curriculum_service.dto;

import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TemplateSchemaResponse {
  private TemplateType type;
  private String description;
  private String example;
}
