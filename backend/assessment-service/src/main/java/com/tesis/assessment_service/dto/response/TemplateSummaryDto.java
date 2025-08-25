package com.tesis.assessment_service.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TemplateSummaryDto(
    UUID id,
    String title,
    UUID curriculumId,
    UUID ownerUuid,
    int itemsCount,
    boolean hasManualItems,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<TemplateItemSummaryDto> itemSummaries // null si no se pidió includeItemSummaries
) {
}
