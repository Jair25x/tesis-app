package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.AssignmentSearchCriteria;
import com.tesis.assessment_service.dto.response.AssignmentSummaryResponse;
import com.tesis.assessment_service.exception.ErrorResponse;
import com.tesis.assessment_service.repository.spec.AssignmentSpecifications;
import com.tesis.assessment_service.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Assignments (Query)", description = "Listado paginado y filtrado de asignaciones")
@RestController
@RequestMapping("/api/assessments/assignments")
@RequiredArgsConstructor
public class AssignmentQueryController {

  private final AssignmentService assignmentService;

  @Operation(summary = "Listar asignaciones (docente/admin)", description = """
      Devuelve un page de asignaciones. Por defecto, para docentes devuelve solo las
      creadas por el usuario autenticado (mineOnly=true). Para admin, puede pedir todo con mineOnly=false.
      Filtros soportados: state, type, scope, classroomId, templateId, windowFrom, windowTo.
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
      @Parameter(description = "Solo mis asignaciones (default true)") @RequestParam(required = false) Boolean mineOnly,
      @ParameterObject Pageable pageable) {
    var c = new AssignmentSearchCriteria();
    c.state = AssignmentSpecifications.parseState(state);
    c.type = AssignmentSpecifications.parseType(type);
    c.scope = AssignmentSpecifications.parseScope(scope);
    c.classroomId = classroomId;
    c.templateId = templateId;
    c.windowFrom = AssignmentSpecifications.parseDate(windowFrom);
    c.windowTo = AssignmentSpecifications.parseDate(windowTo);
    c.mineOnly = mineOnly;

    Page<AssignmentSummaryResponse> page = assignmentService.search(c, pageable);
    return ResponseEntity.ok(page);
  }
}
