package com.tesis.assessment_service.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.tesis.assessment_service.dto.request.TemplateItemRequest;
import com.tesis.assessment_service.dto.request.TemplateRequest;
import com.tesis.assessment_service.dto.response.TemplateItemResponse;
import com.tesis.assessment_service.dto.response.TemplateResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.exception.NotFoundException;
import com.tesis.assessment_service.model.AssessmentTemplate;
import com.tesis.assessment_service.model.AssessmentTemplateItem;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.repository.AssessmentTemplateRepository;
import com.tesis.assessment_service.service.TemplateService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TemplateServiceImpl implements TemplateService {

  private final AssessmentTemplateRepository templateRepo;

  @Override
  public TemplateResponse createTemplate(UUID ownerId, TemplateRequest request) {
    if (ownerId == null)
      throw new BadRequestException("ownerId requerido");
    if (request == null)
      throw new BadRequestException("request requerido");
    if (request.items() == null || request.items().isEmpty()) {
      throw new BadRequestException("La plantilla debe incluir al menos un ítem");
    }

    // Crear plantilla
    AssessmentTemplate t = AssessmentTemplate.builder()
        .ownerUuid(ownerId)
        .title(request.title())
        .curriculumId(request.curriculumId())
        .configJson(request.config()) // JsonNode → JSONB
        .build();

    // Construir ítems con defaults y posiciones 1..N
    List<AssessmentTemplateItem> newItems = buildItemsWithDefaults(t, request.items());

    // Agregar a la colección administrada (NO setItems)
    t.getItems().addAll(newItems);

    // Guardar por cascada
    templateRepo.save(t);

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
    if (request == null)
      throw new BadRequestException("request requerido");

    AssessmentTemplate t = templateRepo.findWithItemsById(templateId)
        .orElseThrow(() -> new NotFoundException("Plantilla no encontrada"));

    if (!t.getOwnerUuid().equals(requesterId)) {
      throw new ForbiddenException("No eres dueño de esta plantilla");
    }

    // Campos simples
    t.setTitle(request.title());
    t.setCurriculumId(request.curriculumId());
    t.setConfigJson(request.config()); // JsonNode → JSONB

    // Reemplazo TOTAL de ítems de forma segura para orphanRemoval:
    // 1) limpiar colección administrada
    t.getItems().clear(); // ← esto genera los deletes por orphanRemoval

    // 2) reconstruir y agregar al MISMO List administrado
    List<AssessmentTemplateItem> rebuilt = buildItemsWithDefaults(t, request.items());
    t.getItems().addAll(rebuilt);

    // 3) no hace falta save explícito a items (cascada)
    // templateRepo.save(t); // opcional; como está managed, se flush-ea al commit

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

  /**
   * Construye items garantizando:
   * - points >= 1 (default 1 si null/invalid)
   * - position re-secuenciada 1..N en el orden recibido (ignoramos posiciones
   * ausentes)
   * - gradingMode default = AUTO si null
   * - setea la relación bidireccional (item.setTemplate(template))
   */
  private List<AssessmentTemplateItem> buildItemsWithDefaults(
      AssessmentTemplate template,
      List<TemplateItemRequest> reqItems) {

    if (reqItems == null || reqItems.isEmpty()) {
      throw new BadRequestException("La plantilla debe incluir al menos un ítem");
    }

    List<AssessmentTemplateItem> tmp = new ArrayList<>(reqItems.size());

    for (TemplateItemRequest it : reqItems) {
      int points = (it.points() != null && it.points() >= 1) ? it.points() : 1;
      GradingMode mode = (it.gradingMode() != null) ? it.gradingMode() : GradingMode.AUTO;

      AssessmentTemplateItem entity = AssessmentTemplateItem.builder()
          .template(template) // ← dueño
          .objectiveId(it.objectiveId())
          .exerciseId(it.exerciseId())
          .points(points)
          .gradingMode(mode)
          .build();

      tmp.add(entity);
    }

    // Re-secuenciar posiciones 1..N en el orden recibido
    for (int i = 0; i < tmp.size(); i++) {
      tmp.get(i).setPosition(i + 1);
    }

    return tmp;
  }

  private TemplateResponse toResponse(AssessmentTemplate t, boolean withItems) {
    List<TemplateItemResponse> items = (withItems && t.getItems() != null)
        ? t.getItems().stream()
            .sorted(Comparator.comparingInt(AssessmentTemplateItem::getPosition))
            .map(i -> new TemplateItemResponse(
                i.getId(),
                i.getObjectiveId(),
                i.getExerciseId(),
                i.getPoints(),
                i.getPosition(),
                i.getGradingMode()))
            .toList()
        : List.of();

    JsonNode cfg = t.getConfigJson(); // JsonNode directo
    return new TemplateResponse(
        t.getId(),
        t.getOwnerUuid(),
        t.getTitle(),
        t.getCurriculumId(),
        cfg,
        items,
        t.getCreatedAt(),
        t.getUpdatedAt());
  }
}
