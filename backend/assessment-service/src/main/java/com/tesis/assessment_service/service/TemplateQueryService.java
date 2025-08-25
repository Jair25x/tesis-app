package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.response.PageResponse;
import com.tesis.assessment_service.dto.response.TemplateSummaryDto;
import com.tesis.assessment_service.service.params.TemplateSearchParams;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TemplateQueryService {
  PageResponse<TemplateSummaryDto> searchTemplates(UUID requesterId,
      boolean isAdmin,
      TemplateSearchParams params,
      Pageable pageable);
}
