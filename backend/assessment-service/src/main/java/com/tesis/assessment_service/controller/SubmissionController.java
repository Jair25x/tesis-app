package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.SubmitRequest;
import com.tesis.assessment_service.dto.response.StartResponse;
import com.tesis.assessment_service.dto.response.SubmissionDetailResponse;
import com.tesis.assessment_service.dto.response.SubmitResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.service.SubmissionService;
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
@Tag(name = "Submissions", description = "Flujo de inicio, envío y detalle de envíos")
public class SubmissionController {

  private final SubmissionService submissionService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Iniciar evaluación", description = "Idempotente. Devuelve el submission IN_PROGRESS con los ítems del intento.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = StartResponse.class))),
      @ApiResponse(responseCode = "403", description = "Fuera de ventana o no miembro"),
      @ApiResponse(responseCode = "409", description = "Ya enviado previamente")
  })
  @PostMapping("/assignments/{assignmentId}/start")
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<StartResponse> start(@PathVariable UUID assignmentId, Authentication auth) {
    UUID studentId = currentUserId(auth);
    return ResponseEntity.ok(submissionService.start(assignmentId, studentId));
  }

  @Operation(summary = "Enviar respuestas (one-shot)", description = "Corrige AUTO, deja MANUAL pendiente; calcula puntajes y registra en progress-service.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = SubmitResponse.class))),
      @ApiResponse(responseCode = "403", description = "Fuera de ventana o no miembro"),
      @ApiResponse(responseCode = "409", description = "Submission ya fue enviado")
  })
  @PostMapping(path = "/submissions/{submissionId}/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('STUDENT')")
  public ResponseEntity<SubmitResponse> submit(@PathVariable UUID submissionId,
      @Valid @RequestBody SubmitRequest request,
      Authentication auth) {
    UUID studentId = currentUserId(auth);
    return ResponseEntity.ok(submissionService.submit(submissionId, studentId, request));
  }

  @Operation(summary = "Detalle de submission", description = "Si asTeacher=true requiere rol docente/admin y pertenecer al aula de la asignación.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = SubmissionDetailResponse.class))),
      @ApiResponse(responseCode = "403", description = "Prohibido"),
      @ApiResponse(responseCode = "404", description = "No encontrado")
  })
  @GetMapping("/submissions/{submissionId}")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  public ResponseEntity<SubmissionDetailResponse> detail(@PathVariable UUID submissionId,
      @RequestParam(defaultValue = "false") boolean asTeacher,
      Authentication auth) {
    UUID requesterId = currentUserId(auth);
    return ResponseEntity.ok(submissionService.getDetail(submissionId, requesterId, asTeacher));
  }
}
