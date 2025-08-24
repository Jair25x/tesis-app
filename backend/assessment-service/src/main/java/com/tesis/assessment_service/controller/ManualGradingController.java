package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.GradeItemRequest;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.service.GradingService;
import com.tesis.assessment_service.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/assessments", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Manual Grading", description = "Calificación manual de ítems")
public class ManualGradingController {

  private final GradingService gradingService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Calificar manualmente un ítem", description = "Permite marcar correcto/incorrecto, asignar score y feedback.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = SubmissionDetailResponse.class))),
      @ApiResponse(responseCode = "403", description = "Prohibido"),
      @ApiResponse(responseCode = "404", description = "No encontrado")
  })
  @PostMapping(path = "/submissions/{submissionId}/items/{itemId}/grade", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<SubmissionDetailResponse> grade(@PathVariable UUID submissionId,
      @PathVariable UUID itemId,
      @Valid @RequestBody GradeItemRequest request,
      Authentication auth) {
    UUID teacherId = currentUserId(auth);
    return ResponseEntity.ok(gradingService.gradeItem(submissionId, itemId, teacherId, request));
  }
}
