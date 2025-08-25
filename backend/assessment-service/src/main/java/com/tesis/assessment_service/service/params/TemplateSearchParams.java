package com.tesis.assessment_service.service.params;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TemplateSearchParams {
  private Boolean mineOnly;
  private UUID curriculumId;
  private String title;
  private LocalDateTime updatedFrom;
  private LocalDateTime updatedTo;
  private Boolean includeItemSummaries;
}
