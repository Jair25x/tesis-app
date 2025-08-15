package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.*;
import com.tesis.progress_service.exception.ErrorResponse;
import com.tesis.progress_service.service.AchievementService;
import com.tesis.progress_service.service.ProgressQueryService;
import com.tesis.progress_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Student Progress", description = "Consultas del estudiante sobre su progreso, racha y logros")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/progress/students/me")
@RequiredArgsConstructor
public class StudentController {

  private final ProgressQueryService progressQueryService;
  private final AchievementService achievementService;

  @Operation(summary = "Resumen del progreso", description = "Estados de objetivos y métricas del día")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = OverviewDto.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/overview")
  public ResponseEntity<OverviewDto> overview() {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(progressQueryService.getOverview(studentId));
  }

  @Operation(summary = "Racha del día", description = "Racha actual, racha más larga y último día de actividad")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = StreakDto.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/streak")
  public ResponseEntity<StreakDto> streak() {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(progressQueryService.getStreak(studentId));
  }

  @Operation(summary = "Logros del estudiante", description = "Listado de logros desbloqueados por el estudiante")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/achievements")
  public ResponseEntity<List<AchievementDto>> achievements() {
    UUID studentId = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(achievementService.listForStudent(studentId));
  }
}
