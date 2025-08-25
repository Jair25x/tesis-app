package com.tesis.assessment_service.service.impl;

import com.tesis.assessment_service.dto.response.PageResponse;
import com.tesis.assessment_service.dto.response.TemplateItemSummaryDto;
import com.tesis.assessment_service.dto.response.TemplateSummaryDto;
import com.tesis.assessment_service.model.AssessmentTemplate;
import com.tesis.assessment_service.model.AssessmentTemplateItem;
import com.tesis.assessment_service.model.enums.GradingMode;
import com.tesis.assessment_service.repository.AssessmentTemplateItemRepository;
import com.tesis.assessment_service.repository.AssessmentTemplateRepository;
import com.tesis.assessment_service.service.TemplateQueryService;
import com.tesis.assessment_service.service.params.TemplateSearchParams;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TemplateQueryServiceImpl implements TemplateQueryService {

  private final AssessmentTemplateRepository templateRepo;
  private final AssessmentTemplateItemRepository itemRepo;

  @Override
  public PageResponse<TemplateSummaryDto> searchTemplates(UUID requesterId,
      boolean isAdmin,
      TemplateSearchParams params,
      Pageable pageable) {
    // Build Specification
    Specification<AssessmentTemplate> spec = (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();

      if (Boolean.TRUE.equals(params.getMineOnly())) {
        predicates.add(cb.equal(root.get("ownerUuid"), requesterId));
      } else if (!isAdmin) {
        // TEACHER no puede ver plantillas de otros si fuerza mineOnly=false
        predicates.add(cb.equal(root.get("ownerUuid"), requesterId));
      }

      if (params.getCurriculumId() != null) {
        predicates.add(cb.equal(root.get("curriculumId"), params.getCurriculumId()));
      }

      if (params.getTitle() != null && !params.getTitle().isBlank()) {
        String pattern = "%" + params.getTitle().trim().toLowerCase() + "%";
        predicates.add(cb.like(cb.lower(root.get("title")), pattern));
      }

      if (params.getUpdatedFrom() != null) {
        predicates.add(cb.greaterThanOrEqualTo(root.get("updatedAt"), params.getUpdatedFrom()));
      }
      if (params.getUpdatedTo() != null) {
        predicates.add(cb.lessThanOrEqualTo(root.get("updatedAt"), params.getUpdatedTo()));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };

    Page<AssessmentTemplate> page = templateRepo.findAll(spec, pageable);

    // Evitar N+1: traer items de todos los templates de la página
    List<UUID> templateIds = page.getContent().stream()
        .map(AssessmentTemplate::getId)
        .toList();

    final Map<UUID, List<AssessmentTemplateItem>> itemsByTemplate;
    if (templateIds.isEmpty()) {
      itemsByTemplate = Collections.emptyMap();
    } else {
      List<AssessmentTemplateItem> allItems = itemRepo.findByTemplate_IdIn(templateIds);
      itemsByTemplate = allItems.stream()
          .collect(Collectors.groupingBy(i -> i.getTemplate().getId()));
    }

    boolean includeSummaries = Boolean.TRUE.equals(params.getIncludeItemSummaries());

    Page<TemplateSummaryDto> mapped = page.map(t -> {
      List<AssessmentTemplateItem> items = itemsByTemplate.getOrDefault(t.getId(), List.of());
      int itemsCount = items.size();
      boolean hasManual = items.stream().anyMatch(i -> i.getGradingMode() == GradingMode.MANUAL);

      List<TemplateItemSummaryDto> itemSummaries = null;
      if (includeSummaries && !items.isEmpty()) {
        itemSummaries = items.stream()
            .sorted(Comparator.comparing(AssessmentTemplateItem::getPosition))
            .map(i -> new TemplateItemSummaryDto(
                i.getObjectiveId(),
                i.getExerciseId(),
                i.getGradingMode(),
                i.getPoints(),
                i.getPosition()))
            .toList();
      }

      return new TemplateSummaryDto(
          t.getId(),
          t.getTitle(),
          t.getCurriculumId(),
          t.getOwnerUuid(),
          itemsCount,
          hasManual,
          t.getCreatedAt(), // LocalDateTime (según tu AuditableEntity)
          t.getUpdatedAt(),
          itemSummaries);
    });

    return PageResponse.of(mapped);
  }
}
