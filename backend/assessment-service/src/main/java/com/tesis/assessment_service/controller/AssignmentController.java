package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.AssignmentRequest;
import com.tesis.assessment_service.dto.request.CloneAssignmentRequest;
import com.tesis.assessment_service.dto.response.*;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/assessments/assignments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Asignaciones de evaluaciones a aulas o públicas")
public class AssignmentController {

  private final AssignmentService assignmentService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Crear asignación")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Creado", content = @Content(schema = @Schema(implementation = AssignmentResponse.class))),
      @ApiResponse(responseCode = "400", description = "Petición inválida"),
      @ApiResponse(responseCode = "403", description = "Prohibido")
  })
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<AssignmentResponse> create(@Valid @RequestBody AssignmentRequest request,
      Authentication auth) {
    UUID userId = currentUserId(auth);
    AssignmentResponse resp = assignmentService.createAssignment(userId, request);
    return ResponseEntity.created(URI.create("/api/assessments/assignments/" + resp.id())).body(resp);
  }

  @Operation(summary = "Publicar asignación", description = "Transición DRAFT → PUBLISHED")
  @PostMapping("/{id}/publish")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<AssignmentResponse> publish(@PathVariable UUID id, Authentication auth) {
    UUID userId = currentUserId(auth);
    return ResponseEntity.ok(assignmentService.publish(id, userId));
  }

  @Operation(summary = "Cerrar asignación", description = "Transición PUBLISHED → CLOSED")
  @PostMapping("/{id}/close")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<AssignmentResponse> close(@PathVariable UUID id, Authentication auth) {
    UUID userId = currentUserId(auth);
    return ResponseEntity.ok(assignmentService.close(id, userId));
  }

  @Operation(summary = "Clonar asignación", description = "Crea una nueva asignación DRAFT basada en otra")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Creado", content = @Content(schema = @Schema(implementation = AssignmentResponse.class))),
      @ApiResponse(responseCode = "400", description = "Petición inválida"),
      @ApiResponse(responseCode = "403", description = "Prohibido"),
      @ApiResponse(responseCode = "404", description = "No encontrada")
  })
  @PostMapping(path = "/{id}/clone", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<AssignmentResponse> clone(@PathVariable UUID id,
      @RequestBody(required = false) CloneAssignmentRequest req,
      Authentication auth) {
    UUID userId = currentUserId(auth);
    AssignmentResponse resp = assignmentService.cloneAssignment(id, userId, req);
    return ResponseEntity.created(URI.create("/api/assessments/assignments/" + resp.id())).body(resp);
  }

  @Operation(summary = "Overview de la asignación")
  @GetMapping("/{id}/overview")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<OverviewResponse> overview(@PathVariable UUID id, Authentication auth) {
    UUID userId = currentUserId(auth);
    return ResponseEntity.ok(assignmentService.getOverview(id, userId));
  }

  @Operation(summary = "Listado de submissions de una asignación (paginado)")
  @GetMapping("/{id}/submissions")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<PageResponse<SubmissionSummaryDto>> listSubmissions(
      @PathVariable UUID id,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam Optional<String> status) {

    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200),
        Sort.by(Sort.Order.desc("createdAt")));
    return ResponseEntity.ok(assignmentService.listSubmissions(id, status, pageable));
  }
}
