// src/main/java/com/tesis/progress_service/controller/InternalAttemptController.java
package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.AttemptEventRequest;
import com.tesis.progress_service.service.AttemptsService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Rutas S2S (bloquear en gateway). */
@Hidden
@RestController
@RequestMapping("/internal/progress/attempts")
@RequiredArgsConstructor
public class InternalAttemptController {

  private final AttemptsService attemptsService;

  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping
  public ResponseEntity<Void> submitInternal(@Valid @RequestBody AttemptEventRequest req) {
    attemptsService.recordAttemptEvent(req.getStudentId(), req);
    return ResponseEntity.noContent().build();
  }
}
