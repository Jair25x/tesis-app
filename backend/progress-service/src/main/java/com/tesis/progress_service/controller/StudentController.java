// src/main/java/com/tesis/progress_service/controller/StudentController.java
package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.*;
import com.tesis.progress_service.exception.ErrorResponse;
import com.tesis.progress_service.service.AchievementService;
import com.tesis.progress_service.service.ProgressQueryService;
import com.tesis.progress_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

  @Operation(summary = "Resumen del progreso", description = "Estados de objetivos y métricas del día (opcional por currículo)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = OverviewDto.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos suficientes", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/overview")
  public ResponseEntity<OverviewDto> overview(
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId
  ) {
    return ResponseEntity.ok(progressQueryService.getOverview(curriculumId));
  }

  @Operation(summary = "Racha del día", description = "Racha actual y más larga")
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

  @Operation(summary = "Logros del estudiante", description = "Listado de logros desbloqueados")
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

  @Operation(summary = "Serie diaria de MIS intentos", description = """
      Devuelve la serie diaria de intentos/correctos para el usuario autenticado.
      Parámetros:
      - curriculumId (UUID, opcional)
      - range: today | 7d | 14d (por defecto 7d)
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DailyStatDto.class))))
  @ApiResponse(responseCode = "401", description = "No autorizado")
  @GetMapping("/series")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  public ResponseEntity<List<DailyStatDto>> mySeries(
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId,
      @RequestParam(name = "range", required = false, defaultValue = "7d") String range
  ) {
    var me = SecurityUtils.getCurrentUserIdOrThrow();
    var series = progressQueryService.getDailySeriesForStudent(me, curriculumId, range);
    return ResponseEntity.ok(series);
  }

  @Operation(summary = "Estados por objetivo", description = """
      Devuelve el estado de cada objetivo de aprendizaje del estudiante autenticado.
      Parámetros:
      - curriculumId (UUID, opcional): si no se envía, devuelve estados de todos los currículos.
      Respuesta:
      - objectiveId: UUID (String)
      - status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED"
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array =
      @ArraySchema(schema = @Schema(implementation = ObjectiveStatusDto.class))))
  @ApiResponse(responseCode = "401", description = "No autorizado")
  @GetMapping("/objectives/status")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  public ResponseEntity<List<ObjectiveStatusDto>> myObjectiveStatuses(
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId
  ) {
    var items = progressQueryService.getMyObjectiveStatuses(curriculumId);
    return ResponseEntity.ok(items);
  }

  // ===== NUEVO ENDPOINT =====
  @Operation(summary = "Cobertura por objetivo", description = """
      Para el alumno autenticado, devuelve por cada objetivo:
      - solvedDistinct: ejercicios distintos correctos dentro del OA
      - totalExercises: total de ejercicios activos del OA
      Parámetros:
      - curriculumId (UUID, opcional): límite por currículo.
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array =
      @ArraySchema(schema = @Schema(implementation = ObjectiveCoverageDto.class))))
  @ApiResponse(responseCode = "401", description = "No autorizado")
  @GetMapping("/objectives/coverage")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  public ResponseEntity<List<ObjectiveCoverageDto>> myCoverage(
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId
  ) {
    UUID me = SecurityUtils.getCurrentUserIdOrThrow();
    var data = progressQueryService.getObjectiveCoverage(me, curriculumId);
    return ResponseEntity.ok(data);
  }
}
