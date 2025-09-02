package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.AssignmentSearchCriteria;
import com.tesis.assessment_service.dto.response.AssignmentSummaryResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.exception.ErrorResponse;
import com.tesis.assessment_service.exception.ForbiddenException;
import com.tesis.assessment_service.repository.spec.AssignmentSpecifications;
import com.tesis.assessment_service.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@Tag(name = "Assignments (Query)", description = "Listado paginado y filtrado de asignaciones")
@RestController
@RequestMapping("/api/assessments/assignments")
@RequiredArgsConstructor
public class AssignmentQueryController {

  private final AssignmentService assignmentService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Listar asignaciones (docente/admin)", description = """
      Devuelve un page de asignaciones.
      Filtros soportados: state, type, scope, classroomId, templateId, windowFrom, windowTo.
      Filtros de creador:
        - createdBy=me       -> filtra por el usuario del token
        - createdByUserId=UUID -> ADMIN: cualquiera; no-admin: sólo el propio
      Si no se especifica filtro de creador:
        - ADMIN: ve todas
        - TEACHER: ve sólo las suyas (compatibilidad con comportamiento previo)
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AssignmentSummaryResponse.class))))
  @ApiResponse(responseCode = "400", description = "Parámetros inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
  @GetMapping
  public ResponseEntity<Page<AssignmentSummaryResponse>> list(
      @Parameter(description = "Estado: DRAFT|PUBLISHED|CLOSED") @RequestParam(required = false) String state,
      @Parameter(description = "Tipo: DIAGNOSTIC|FORMATIVE|SUMMATIVE") @RequestParam(required = false) String type,
      @Parameter(description = "Ámbito: CLASSROOM|PUBLIC") @RequestParam(required = false) String scope,
      @Parameter(description = "Filtra por aula") @RequestParam(required = false) UUID classroomId,
      @Parameter(description = "Filtra por plantilla") @RequestParam(required = false) UUID templateId,
      @Parameter(description = "Ventana desde (ISO-8601)") @RequestParam(required = false) String windowFrom,
      @Parameter(description = "Ventana hasta (ISO-8601)") @RequestParam(required = false) String windowTo,
      // nuevos filtros de creador
      @Parameter(description = "Filtra por creador lógico del token (me)") @RequestParam(name = "createdBy", required = false) Optional<String> createdBy,
      @Parameter(description = "Filtra por creador específico (UUID)") @RequestParam(name = "createdByUserId", required = false) Optional<UUID> createdByUserId,
      // paging/sort vía Pageable (ej. ?page=0&size=20&sort=createdAt,desc)
      @ParameterObject Pageable pageable,
      Authentication auth) {

    var c = new AssignmentSearchCriteria();
    c.state = AssignmentSpecifications.parseState(state);
    c.type = AssignmentSpecifications.parseType(type);
    c.scope = AssignmentSpecifications.parseScope(scope);
    c.classroomId = classroomId;
    c.templateId = templateId;
    c.windowFrom = AssignmentSpecifications.parseDate(windowFrom);
    c.windowTo = AssignmentSpecifications.parseDate(windowTo);

    // createdBy=me tiene prioridad si viene
    c.createdByMe = createdBy.map(v -> "me".equalsIgnoreCase(v)).orElse(null);
    c.createdByUserId = createdByUserId.orElse(null);

    // Seguridad: no-admin no puede pedir createdByUserId distinto a sí mismo
    boolean isAdmin = auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_ADMIN".equalsIgnoreCase(a.getAuthority()));
    UUID me = currentUserId(auth);
    if (!isAdmin && c.createdByUserId != null && !me.equals(c.createdByUserId)) {
      throw new ForbiddenException("No estás autorizado a consultar asignaciones de otros usuarios");
    }

    Page<AssignmentSummaryResponse> page = assignmentService.search(c, pageable);
    return ResponseEntity.ok(page);
  }
}
