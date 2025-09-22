package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.AttemptRequest;
import com.tesis.progress_service.dto.AttemptResponse;
import com.tesis.progress_service.exception.ErrorResponse;
import com.tesis.progress_service.service.AttemptsService;
import com.tesis.progress_service.util.SecurityUtils;
import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Attempts", description = "Registro de intentos del estudiante y actualización de progreso/racha/logros")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/progress/attempts")
@RequiredArgsConstructor
public class AttemptController {

  private final AttemptsService attemptsService;

  @Operation(summary = "Registrar un intento", description = "Evalúa la respuesta con curriculum-service, persiste el intento y actualiza el progreso.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Intento registrado correctamente", content = @Content(schema = @Schema(implementation = AttemptResponse.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @Timed(value = "progress_attempts_endpoint_seconds", description = "POST /api/progress/attempts latency")
  @PostMapping
  public ResponseEntity<AttemptResponse> submit(@Valid @RequestBody AttemptRequest req) {
    var studentId = SecurityUtils.getCurrentUserIdOrThrow();
    var resp = attemptsService.recordAttempt(studentId, req);
    return ResponseEntity.ok(resp);
  }
}
