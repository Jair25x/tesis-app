package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.response.PageResponse;
import com.tesis.assessment_service.dto.response.StudentAssignmentSummaryResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.service.AssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/assessments/my", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Student", description = "Endpoints para estudiantes")
public class StudentController {

  private final AssignmentService assignmentService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Mis evaluaciones", description = "Asignaciones PUBLISHED vigentes con flags canStart/started/submitted")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = PageResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado")
  })
  @GetMapping("/assignments")
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<PageResponse<StudentAssignmentSummaryResponse>> myAssignments(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      Authentication auth) {

    UUID studentId = currentUserId(auth);
    Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 200),
        Sort.by(Sort.Order.asc("windowStart")));
    return ResponseEntity.ok(assignmentService.listMyAssignments(studentId, pageable));
  }
}
