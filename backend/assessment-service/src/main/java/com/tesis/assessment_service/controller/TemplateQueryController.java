package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.response.PageResponse;
import com.tesis.assessment_service.dto.response.TemplateSummaryDto;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.service.TemplateQueryService;
import com.tesis.assessment_service.service.params.TemplateSearchParams;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/assessments/templates", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Templates (query)", description = "Listado y filtros de plantillas de evaluaciones")
public class TemplateQueryController {

  private final TemplateQueryService templateQueryService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  private boolean isAdmin(Authentication auth) {
    return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
  }

  @Operation(summary = "Listar plantillas (paginado, con filtros)", description = """
      Filtros soportados: mineOnly, curriculumId, title (contains/ilike), updatedFrom, updatedTo.
      Soporta page/size/sort (por ejemplo sort=updatedAt,desc).
      Si includeItemSummaries=true, cada fila incluye el arreglo itemSummaries[].
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TemplateSummaryDto.class))))
  @GetMapping
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<PageResponse<TemplateSummaryDto>> list(
      @RequestParam(required = false) Boolean mineOnly,
      @RequestParam(required = false) UUID curriculumId,
      @RequestParam(required = false) String title,
      @RequestParam(required = false) String updatedFrom,
      @RequestParam(required = false) String updatedTo,
      @RequestParam(defaultValue = "false") boolean includeItemSummaries,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String sort,
      Authentication auth) {

    UUID requesterId = currentUserId(auth);
    boolean admin = isAdmin(auth);

    // mineOnly por defecto: si es TEACHER y no envió, true; si ADMIN y no envió,
    // false
    boolean mineOnlyEffective = mineOnly != null ? mineOnly : !admin;

    // Sort
    Sort sortSpec = Sort.by(Sort.Order.desc("updatedAt"));
    if (sort != null && !sort.isBlank()) {
      // ejemplo: "updatedAt,desc" o "title,asc"
      String[] parts = sort.split(",");
      String prop = parts[0].trim();
      if (!prop.isBlank()) {
        if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
          sortSpec = Sort.by(Sort.Order.asc(prop));
        } else {
          sortSpec = Sort.by(Sort.Order.desc(prop));
        }
      }
    }
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200), sortSpec);

    // Parse de fechas (acepta OffsetDateTime ISO; se normaliza a LocalDateTime)
    java.time.LocalDateTime from = null, to = null;
    try {
      if (updatedFrom != null && !updatedFrom.isBlank()) {
        from = OffsetDateTime.parse(updatedFrom).toLocalDateTime();
      }
      if (updatedTo != null && !updatedTo.isBlank()) {
        to = OffsetDateTime.parse(updatedTo).toLocalDateTime();
      }
    } catch (DateTimeParseException e) {
      throw new BadRequestException("updatedFrom/updatedTo deben ser ISO-8601, e.g., 2025-08-24T10:00:00Z");
    }

    TemplateSearchParams params = TemplateSearchParams.builder()
        .mineOnly(mineOnlyEffective)
        .curriculumId(curriculumId)
        .title(title)
        .updatedFrom(from)
        .updatedTo(to)
        .includeItemSummaries(includeItemSummaries)
        .build();

    return ResponseEntity.ok(templateQueryService.searchTemplates(requesterId, admin, params, pageable));
  }
}
