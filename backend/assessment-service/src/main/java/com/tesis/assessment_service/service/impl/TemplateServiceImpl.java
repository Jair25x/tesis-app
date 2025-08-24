package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.assessment_service.dto.request.TemplateItemRequest;
import com.tesis.assessment_service.dto.request.TemplateRequest;
import com.tesis.assessment_service.dto.response.TemplateItemResponse;
import com.tesis.assessment_service.dto.response.TemplateResponse;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.exception.NotFoundException;
import com.tesis.assessment_service.model.AssessmentTemplate;
import com.tesis.assessment_service.model.AssessmentTemplateItem;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.repository.AssessmentTemplateItemRepository;
import com.tesis.assessment_service.repository.AssessmentTemplateRepository;
import com.tesis.assessment_service.service.TemplateService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TemplateServiceImpl implements TemplateService {

  private final AssessmentTemplateRepository templateRepo;
  private final AssessmentTemplateItemRepository itemRepo;
  private final ObjectMapper mapper;

  @Override
  public TemplateResponse createTemplate(UUID ownerId, TemplateRequest request) {
    AssessmentTemplate t = AssessmentTemplate.builder()
        .ownerUuid(ownerId)
        .title(request.title())
        .curriculumId(request.curriculumId())
        .configJson(jsonToString(request.config()))
        .build();
    templateRepo.save(t);

    List<AssessmentTemplateItem> items = request.items().stream()
        .sorted(Comparator.comparingInt(TemplateItemRequest::position))
        .map(it -> AssessmentTemplateItem.builder()
            .template(t)
            .objectiveId(it.objectiveId())
            .exerciseId(it.exerciseId())
            .points(Math.max(it.points(), 1))
            .position(Math.max(it.position(), 1))
            .gradingMode(it.gradingMode() == null ? GradingMode.AUTO : it.gradingMode())
            .build())
        .toList();
    itemRepo.saveAll(items);
    t.setItems(items);

    return toResponse(t, true);
  }

  @Override
  public TemplateResponse getTemplate(UUID templateId) {
    AssessmentTemplate t = templateRepo.findWithItemsById(templateId)
        .orElseThrow(() -> new NotFoundException("Plantilla no encontrada"));
    return toResponse(t, true);
  }

  @Override
  public TemplateResponse updateTemplate(UUID templateId, UUID requesterId, TemplateRequest request) {
    AssessmentTemplate t = templateRepo.findWithItemsById(templateId)
        .orElseThrow(() -> new NotFoundException("Plantilla no encontrada"));
    if (!t.getOwnerUuid().equals(requesterId)) {
      throw new ForbiddenException("No eres dueño de esta plantilla");
    }
    t.setTitle(request.title());
    t.setCurriculumId(request.curriculumId());
    t.setConfigJson(jsonToString(request.config()));

    // Reemplazo total de items (simple y seguro)
    itemRepo.deleteAll(t.getItems());
    List<AssessmentTemplateItem> items = request.items().stream()
        .sorted(Comparator.comparingInt(TemplateItemRequest::position))
        .map(it -> AssessmentTemplateItem.builder()
            .template(t)
            .objectiveId(it.objectiveId())
            .exerciseId(it.exerciseId())
            .points(Math.max(it.points(), 1))
            .position(Math.max(it.position(), 1))
            .gradingMode(it.gradingMode() == null ? GradingMode.AUTO : it.gradingMode())
            .build())
        .toList();
    itemRepo.saveAll(items);
    t.setItems(items);
    return toResponse(t, true);
  }

  @Override
  public void deleteTemplate(UUID templateId, UUID requesterId) {
    AssessmentTemplate t = templateRepo.findById(templateId)
        .orElseThrow(() -> new NotFoundException("Plantilla no encontrada"));
    if (!t.getOwnerUuid().equals(requesterId)) {
      throw new ForbiddenException("No eres dueño de esta plantilla");
    }
    templateRepo.delete(t);
  }

  // ---- helpers

  private TemplateResponse toResponse(AssessmentTemplate t, boolean withItems) {
    List<TemplateItemResponse> items = (withItems && t.getItems() != null)
        ? t.getItems().stream()
            .sorted(Comparator.comparingInt(AssessmentTemplateItem::getPosition))
            .map(i -> new TemplateItemResponse(
                i.getId(), i.getObjectiveId(), i.getExerciseId(),
                i.getPoints(), i.getPosition(), i.getGradingMode()))
            .toList()
        : List.of();
    JsonNode cfg = stringToJson(t.getConfigJson());
    return new TemplateResponse(
        t.getId(), t.getOwnerUuid(), t.getTitle(), t.getCurriculumId(),
        cfg, items, t.getCreatedAt(), t.getUpdatedAt());
  }

  private String jsonToString(JsonNode node) {
    try {
      return node == null ? null : mapper.writeValueAsString(node);
    } catch (Exception e) {
      throw new IllegalArgumentException("config inválido", e);
    }
  }

  private JsonNode stringToJson(String s) {
    try {
      return s == null ? null : mapper.readTree(s);
    } catch (Exception e) {
      return null;
    }
  }
}
