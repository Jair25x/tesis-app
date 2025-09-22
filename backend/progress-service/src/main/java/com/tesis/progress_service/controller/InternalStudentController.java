// src/main/java/com/tesis/progress_service/controller/InternalStudentController.java
package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.ObjectiveStatsBatchRequest;
import com.tesis.progress_service.dto.ObjectiveStatsResponse;
import com.tesis.progress_service.dto.OverviewDto;
import com.tesis.progress_service.model.StudentObjectiveProgress;
import com.tesis.progress_service.model.enums.ProgressStatus;
import com.tesis.progress_service.repository.AttemptRepository;
import com.tesis.progress_service.repository.StudentObjectiveProgressRepository;
import com.tesis.progress_service.service.ProgressQueryService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Hidden
@RestController
@RequestMapping("/internal/progress/students")
@RequiredArgsConstructor
public class InternalStudentController {

  private final ProgressQueryService progressQueryService;
  private final AttemptRepository attemptRepository;
  private final StudentObjectiveProgressRepository sopRepository;

  // ---------------------------------------------------------------------------
  // 1) Overview interno por studentId (lo consume el Advisor)
  // ---------------------------------------------------------------------------
  @Operation(summary = "[INTERNAL] Overview de un estudiante")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{studentId}/overview")
  public ResponseEntity<OverviewDto> getOverviewInternal(@PathVariable UUID studentId) {
    OverviewDto dto = progressQueryService.getOverviewForStudent(studentId, null);
    return ResponseEntity.ok(dto);
  }

  // ---------------------------------------------------------------------------
  // 2) Stats por objetivo (mínimo viable y tipado)
  // ---------------------------------------------------------------------------
  @Operation(summary = "[INTERNAL] Stats por objetivo de un estudiante")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{studentId}/objectives/{objectiveId}/stats")
  public ResponseEntity<ObjectiveStatsResponse> getObjectiveStatsInternal(
      @PathVariable UUID studentId,
      @PathVariable UUID objectiveId
  ) {
    Map<UUID, Integer> solvedMap = solvedDistinctByObjective(studentId, null);
    int solved = solvedMap.getOrDefault(objectiveId, 0);
    String status = getStatusFor(studentId, objectiveId);

    ObjectiveStatsResponse out = ObjectiveStatsResponse.builder()
        .objectiveId(objectiveId)
        .status(status)
        .solvedDistinct(solved)
        .build();

    return ResponseEntity.ok(out);
  }

  // ---------------------------------------------------------------------------
  // 3) Batch stats por objetivos (eficiencia para el Advisor)
  // ---------------------------------------------------------------------------
  @Operation(summary = "[INTERNAL] Stats por objetivo (batch)")
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping("/{studentId}/objectives/stats:batch")
  public ResponseEntity<List<ObjectiveStatsResponse>> getObjectiveStatsBatch(
      @PathVariable UUID studentId,
      @Valid @RequestBody ObjectiveStatsBatchRequest req
  ) {
    List<UUID> ids = Optional.ofNullable(req.getObjectiveIds()).orElse(List.of());
    if (ids.isEmpty()) return ResponseEntity.ok(List.of());

    Map<UUID, Integer> solvedMap = solvedDistinctByObjective(studentId, null);
    Map<UUID, String> statusById = statusMapFor(studentId);

    List<ObjectiveStatsResponse> out = ids.stream().map(oid ->
        ObjectiveStatsResponse.builder()
            .objectiveId(oid)
            .status(statusById.getOrDefault(oid, "NOT_STARTED"))
            .solvedDistinct(solvedMap.getOrDefault(oid, 0))
            .build()
    ).collect(Collectors.toList());

    return ResponseEntity.ok(out);
  }

  // =============================== Helpers ===============================

  private Map<UUID, Integer> solvedDistinctByObjective(UUID studentId, @Nullable UUID curriculumId) {
    // attemptRepository.distinctCorrectByObjective(studentId, curriculumId)
    // debe devolver rows [objectiveId(UUID), solvedDistinct(Number)]
    List<Object[]> rows = attemptRepository.distinctCorrectByObjective(studentId, curriculumId);
    Map<UUID, Integer> out = new HashMap<>();
    for (Object[] r : rows) {
      UUID oid = (UUID) r[0];
      int v = (r[1] instanceof Number) ? ((Number) r[1]).intValue() : Integer.parseInt(String.valueOf(r[1]));
      out.put(oid, v);
    }
    return out;
  }

  private String getStatusFor(UUID studentId, UUID objectiveId) {
    // Si tienes un método repo directo, úsalo; aquí hacemos un pass simple.
    List<StudentObjectiveProgress> sops = sopRepository.findAllByStudentId(studentId);
    for (StudentObjectiveProgress s : sops) {
      if (objectiveId.equals(s.getLearningObjectiveId())) {
        return mapStatus(s.getStatus());
      }
    }
    return "NOT_STARTED";
  }

  private Map<UUID, String> statusMapFor(UUID studentId) {
    List<StudentObjectiveProgress> sops = sopRepository.findAllByStudentId(studentId);
    Map<UUID, String> out = new HashMap<>();
    for (StudentObjectiveProgress s : sops) {
      UUID oid = s.getLearningObjectiveId();
      if (oid != null) {
        out.put(oid, mapStatus(s.getStatus()));
      }
    }
    return out;
  }

  private static String mapStatus(ProgressStatus st) {
    if (st == null) return "IN_PROGRESS";
    return switch (st) {
      case MASTERED -> "COMPLETED";
      case IN_PROGRESS -> "IN_PROGRESS";
      case NOT_STARTED -> "NOT_STARTED";
      default -> "IN_PROGRESS";
    };
  }
}
