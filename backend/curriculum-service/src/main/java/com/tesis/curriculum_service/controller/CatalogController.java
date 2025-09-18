// src/main/java/com/tesis/curriculum_service/controller/CatalogController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.catalog.*;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.UUID;

@RestController
@RequestMapping("/api/curricula/catalog")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','TEACHER')") // ajusta si quieres solo ADMIN
public class CatalogController {

  private final CatalogService catalog;

  @GetMapping("/competencies")
  @Operation(summary = "Buscar competencias globalmente (solo activos)")
  public Page<CatalogCompetencyDto> competencies(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UUID curriculumId,
      @Parameter(hidden = true) @PageableDefault(sort = "name") Pageable pageable) {
    return catalog.searchCompetencies(q, curriculumId, pageable);
  }

  @GetMapping("/standards")
  @Operation(summary = "Buscar estándares globalmente (solo activos)")
  public Page<CatalogStandardDto> standards(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UUID curriculumId,
      @RequestParam(required = false) UUID competencyId,
      @Parameter(hidden = true) @PageableDefault(sort = "name") Pageable pageable) {
    return catalog.searchStandards(q, curriculumId, competencyId, pageable);
  }

  @GetMapping("/objectives")
  @Operation(summary = "Buscar objetivos de aprendizaje globalmente (solo activos)")
  public Page<CatalogObjectiveDto> objectives(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UUID curriculumId,
      @RequestParam(required = false) UUID competencyId,
      @RequestParam(required = false) UUID standardId,
      @Parameter(hidden = true) @PageableDefault(sort = "code") Pageable pageable) {
    return catalog.searchObjectives(q, curriculumId, competencyId, standardId, pageable);
  }

  @GetMapping("/exercises")
  @Operation(summary = "Buscar ejercicios globalmente (solo activos)")
  public Page<CatalogExerciseDto> exercises(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) UUID curriculumId,
      @RequestParam(required = false) UUID competencyId,
      @RequestParam(required = false) UUID standardId,
      @RequestParam(required = false) UUID objectiveId,
      @RequestParam(required = false) Exercise.Difficulty difficulty,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date to,
      @Parameter(hidden = true) @PageableDefault(sort = "createdAt", size = 20) Pageable pageable) {
    return catalog.searchExercises(q, curriculumId, competencyId, standardId, objectiveId, difficulty, from, to,
        pageable);
  }
}
