package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.service.OutboxResendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin Outbox", description = "Herramientas administrativas para reintentos de Outbox")
@RestController
@RequestMapping("/api/assessments/admin/outbox")
@RequiredArgsConstructor
public class AdminOutboxController {

  private final OutboxResendService service;

  @Operation(summary = "Reintentar outbox hacia progress-service (una pasada)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Procesado")
  })
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/progress/retry")
  public ResponseEntity<Map<String, Object>> retryProgress(@RequestParam(defaultValue = "50") int limit) {
    int processed = service.resendProgressOnce(limit);
    return ResponseEntity.ok(Map.of("processed", processed));
  }

  @Operation(summary = "Reintentar outbox hacia ai-advisor-service (una pasada)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Procesado")
  })
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/advisor/retry")
  public ResponseEntity<Map<String, Object>> retryAdvisor(@RequestParam(defaultValue = "50") int limit) {
    int processed = service.resendAdvisorOnce(limit);
    return ResponseEntity.ok(Map.of("processed", processed));
  }
}
