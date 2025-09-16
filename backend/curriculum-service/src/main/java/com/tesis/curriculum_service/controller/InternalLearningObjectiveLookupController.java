// src/main/java/com/tesis/curriculum_service/controller/InternalLearningObjectiveLookupController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Hidden
@RestController
@RequestMapping("/internal/learning-objectives")
@RequiredArgsConstructor
public class InternalLearningObjectiveLookupController {

  private final LearningObjectiveRepository repo;

  public record ObjLite(UUID id, String code, String name, String grade) {}

  @Operation(summary = "[INTERNAL] Lista objetivos (opcionalmente por grado)")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping
  public ResponseEntity<List<ObjLite>> list(
      @RequestParam(required = false) String grade,
      @RequestParam(defaultValue = "20") @Min(1) int limit
  ) {
    int lim = Math.min(Math.max(limit, 1), 200);
    List<LearningObjective> found;
    if (grade != null && !grade.isBlank()) {
      found = repo.findTopByGrade(grade.trim(), lim);
    } else {
      found = repo.findRecent(lim);
    }
    List<ObjLite> out = new ArrayList<>();
    for (LearningObjective lo : found) {
      String g = lo.getStandard() != null && lo.getStandard().getCompetency() != null
          && lo.getStandard().getCompetency().getCurriculum() != null
          ? lo.getStandard().getCompetency().getCurriculum().getGrade()
          : null;
      out.add(new ObjLite(lo.getId(), lo.getCode(), lo.getName(), g));
    }
    return ResponseEntity.ok(out);
  }

  @Operation(summary = "[INTERNAL] Lookup de objetivo por código (activo)")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/lookup-by-code")
  public ResponseEntity<?> lookupByCode(@RequestParam String code) {
    return repo.findActiveByCode(code)
        .map(lo -> {
          var std = lo.getStandard();
          var comp = std.getCompetency();
          var cur = comp.getCurriculum();
          String grade = (cur != null) ? cur.getGrade() : null;
          return ResponseEntity.ok(Map.of(
              "id", lo.getId(),
              "code", lo.getCode(),
              "name", lo.getName(),
              "grade", grade
          ));
        })
        .orElse(ResponseEntity.notFound().build());
  }
}
