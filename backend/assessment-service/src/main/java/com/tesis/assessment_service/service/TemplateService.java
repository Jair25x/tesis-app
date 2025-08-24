package com.tesis.assessment_service.service;

import com.tesis.assessment_service.dto.request.TemplateRequest;
import com.tesis.assessment_service.dto.response.TemplateResponse;

import java.util.UUID;

public interface TemplateService {

  TemplateResponse createTemplate(UUID ownerId, TemplateRequest request);

  TemplateResponse getTemplate(UUID templateId);

  TemplateResponse updateTemplate(UUID templateId, UUID requesterId, TemplateRequest request);

  void deleteTemplate(UUID templateId, UUID requesterId);
}
