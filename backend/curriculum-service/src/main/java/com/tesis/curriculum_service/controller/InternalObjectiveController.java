// curriculum-service/src/main/java/com/tesis/curriculum_service/controller/InternalObjectiveController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.ObjectiveExerciseCountsRequest;
import com.tesis.curriculum_service.dto.ObjectiveExerciseCountsResponse;
import com.tesis.curriculum_service.dto.ObjectiveExerciseLiteResponse;
import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Hidden
@Tag(name = "Internal", description = "Endpoints internos para microservicios")
@RestController
@RequestMapping(path = "/internal/objectives")
public class InternalObjectiveController {

  private final ExerciseRepository exerciseRepository;
  private final LearningObjectiveRepository learningObjectiveRepository;

  public InternalObjectiveController(
      ExerciseRepository exerciseRepository,
      LearningObjectiveRepository learningObjectiveRepository) {
    this.exerciseRepository = exerciseRepository;
    this.learningObjectiveRepository = learningObjectiveRepository;
  }

  // ---------------- Ejercicios por objetivo (ligero) ----------------

  @Operation(summary = "Primeros ejercicios por objetivo (ligeros) — uso interno")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{objectiveId}/exercises")
  public ResponseEntity<Map<String, Object>> firstExercisesByObjective(
      @PathVariable UUID objectiveId,
      @RequestParam(defaultValue = "1") int limit,
      @RequestParam(defaultValue = "true") boolean active,
      @RequestParam(required = false) String difficulty, // EASY|MEDIUM|HARD o BASIC|INTERMEDIATE|ADVANCED
      @RequestParam(defaultValue = "false") boolean random,
      @RequestParam(required = false, defaultValue = "desc") String order // asc|desc (por created_at)
  ) {
    int safeLimit = Math.max(1, Math.min(limit, 20));
    String dbDifficulty = mapDifficultyToDb(difficulty); // BASIC|INTERMEDIATE|ADVANCED o null

    List<Exercise> picked;
    if (random) {
      int batchSize = Math.min(5 * safeLimit, 100);
      List<Exercise> batch = exerciseRepository.findForObjectiveOrderByCreatedDesc(
          objectiveId, active, dbDifficulty, batchSize);
      Collections.shuffle(batch);
      picked = batch.stream().limit(safeLimit).toList();
    } else {
      boolean asc = "asc".equalsIgnoreCase(order);
      picked = asc
          ? exerciseRepository.findForObjectiveOrderByCreatedAsc(objectiveId, active, dbDifficulty, safeLimit)
          : exerciseRepository.findForObjectiveOrderByCreatedDesc(objectiveId, active, dbDifficulty, safeLimit);
    }

    List<ObjectiveExerciseLiteResponse> items = picked.stream()
        .map(this::toLite)
        .toList();

    return ResponseEntity.ok(Map.of("items", items));
  }

  // ---------------- Batch: conteo de ejercicios por objetivo (con difficulty)
  // ----------------

  @Operation(summary = "Conteo de ejercicios por objetivo (batch) — uso interno")
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping("/exercise-counts")
  public ResponseEntity<ObjectiveExerciseCountsResponse> exerciseCounts(
      @RequestBody ObjectiveExerciseCountsRequest request) {
    if (request == null || request.getIds() == null || request.getIds().isEmpty()) {
      return ResponseEntity.ok(ObjectiveExerciseCountsResponse.builder().counts(Map.of()).build());
    }

    // active=true por defecto (lo que ves en alumno)
    Boolean active = request.getActive() == null ? Boolean.TRUE : request.getActive();
    // difficulty opcional (BASIC|INTERMEDIATE|ADVANCED)
    String difficulty = normalizeDbDifficulty(request.getDifficulty());

    List<Object[]> rows = exerciseRepository.countByObjectiveIdsWithFilters(request.getIds(), active, difficulty);
    Map<String, Integer> counts = new LinkedHashMap<>();

    for (Object[] r : rows) {
      UUID oid = (UUID) r[0];
      int total = (r[1] instanceof Number) ? ((Number) r[1]).intValue() : Integer.parseInt(String.valueOf(r[1]));
      counts.put(oid.toString(), total);
    }

    // Garantiza salida para todos los IDs (aunque no haya filas)
    for (UUID id : request.getIds()) {
      counts.putIfAbsent(id.toString(), 0);
    }

    return ResponseEntity.ok(ObjectiveExerciseCountsResponse.builder().counts(counts).build());
  }

  // ---------------- Siguiente objetivo por grado (igual que ya tenías)
  // ----------------

  @Operation(summary = "Devuelve el siguiente objetivo programático para grade (orden por code), con fallback si no hay datos")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/next")
  public ResponseEntity<Map<String, Object>> nextObjective(
      @RequestParam String grade,
      @RequestParam(required = false) String subject,
      @RequestParam(required = false) UUID after) {
    String g = normalizeGrade(grade);
    if (g == null) {
      return ResponseEntity.badRequest().body(Map.of("error", "grade inválido"));
    }

    List<LearningObjective> ordered = learningObjectiveRepository.findOrderedByGradeNormalized(g);
    if (ordered.isEmpty()) {
      List<LearningObjective> recent = learningObjectiveRepository.findRecent(1);
      if (recent.isEmpty()) {
        return ResponseEntity.ok(Map.of("found", false));
      }
      LearningObjective target = recent.get(0);
      Map<String, Object> payload = new LinkedHashMap<>();
      payload.put("found", true);
      payload.put("objectiveId", target.getId());
      payload.put("code", target.getCode());
      payload.put("title", target.getName());
      payload.put("grade", g);
      if (subject != null)
        payload.put("subject", subject);
      payload.put("fallback", true);
      return ResponseEntity.ok(payload);
    }

    LearningObjective target;
    if (after == null) {
      target = ordered.get(0);
    } else {
      int idx = -1;
      for (int i = 0; i < ordered.size(); i++) {
        if (ordered.get(i).getId().equals(after)) {
          idx = i;
          break;
        }
      }
      target = (idx >= 0 && idx + 1 < ordered.size()) ? ordered.get(idx + 1) : null;
    }

    if (target == null) {
      return ResponseEntity.ok(Map.of("found", false, "endOfSequence", true));
    }

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("found", true);
    payload.put("objectiveId", target.getId());
    payload.put("code", target.getCode());
    payload.put("title", target.getName());
    payload.put("grade", g);
    if (subject != null)
      payload.put("subject", subject);
    return ResponseEntity.ok(payload);
  }

  @Operation(summary = "Primeros ejercicios por objetivo (shape para duels-service) — uso interno")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{objectiveId}/exercises-for-duels")
  public ResponseEntity<Map<String, Object>> firstExercisesForDuels(
      @PathVariable UUID objectiveId,
      @RequestParam(defaultValue = "3") int limit,
      @RequestParam(defaultValue = "true") boolean active,
      @RequestParam(required = false) String difficulty, // EASY|MEDIUM|HARD|BASIC|INTERMEDIATE|ADVANCED
      @RequestParam(defaultValue = "true") boolean random,
      @RequestParam(required = false, defaultValue = "desc") String order // asc|desc
  ) {
    int safeLimit = Math.max(1, Math.min(limit, 20));
    String dbDifficulty = mapDifficultyToDb(difficulty);

    List<Exercise> picked;
    if (random) {
      int batchSize = Math.min(5 * safeLimit, 100);
      List<Exercise> batch = exerciseRepository.findForObjectiveOrderByCreatedDesc(
          objectiveId, active, dbDifficulty, batchSize);
      Collections.shuffle(batch);
      picked = batch.stream().limit(safeLimit).toList();
    } else {
      boolean asc = "asc".equalsIgnoreCase(order);
      picked = asc
          ? exerciseRepository.findForObjectiveOrderByCreatedAsc(objectiveId, active, dbDifficulty, safeLimit)
          : exerciseRepository.findForObjectiveOrderByCreatedDesc(objectiveId, active, dbDifficulty, safeLimit);
    }

    // Shape esperado: id, active, difficulty (EASY|MEDIUM|HARD), createdAt
    var items = picked.stream().map(e -> Map.of(
        "id", e.getId(),
        "active", Boolean.TRUE.equals(e.getActive()),
        "difficulty", mapDifficultyToAdvisor(e.getDifficulty()),
        "createdAt", e.getCreatedAt())).toList();

    return ResponseEntity.ok(Map.of("items", items));
  }

  @PostMapping("/{objectiveId}/validate-exercises")
  @PreAuthorize("hasRole('INTERNAL')")
  public ResponseEntity<Map<String, Object>> validateExercisesForObjective(
      @PathVariable UUID objectiveId,
      @RequestBody Map<String, Object> body) {

    @SuppressWarnings("unchecked")
    List<String> raw = (List<String>) body.getOrDefault("ids", List.of());
    List<UUID> ids = new ArrayList<>();
    for (Object o : raw) {
      if (o == null)
        continue;
      String s = o.toString().trim();
      if (s.isEmpty())
        continue;
      try {
        ids.add(UUID.fromString(s));
      } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "Invalid UUID in 'ids': " + s));
      }
    }
    ids = ids.stream().distinct().limit(500).toList();

    if (ids.isEmpty())
      return ResponseEntity.ok(Map.of("items", List.of()));
    var rows = exerciseRepository.findStatusByObjectiveAndIds(objectiveId, ids);

    Map<UUID, ExerciseRepository.ExStatusRow> byId = new HashMap<>();
    for (var r : rows)
      byId.put(r.getId(), r);

    var items = new ArrayList<Map<String, Object>>(ids.size());
    for (UUID id : ids) {
      var r = byId.get(id);
      items.add(r == null
          ? Map.of("id", id, "belongs", false, "active", null, "difficulty", null)
          : Map.of("id", id, "belongs", true, "active", r.getActive(), "difficulty", r.getDifficultyUi()));
    }
    return ResponseEntity.ok(Map.of("items", items));
  }

  // ===== helpers =====

  private String normalizeGrade(String g) {
    if (g == null)
      return null;
    String digits = g.trim().replaceAll("[^0-9]", "");
    return digits.isEmpty() ? null : digits;
  }

  private String mapDifficultyToDb(String in) {
    if (in == null || in.isBlank())
      return null;
    String x = in.trim().toUpperCase(Locale.ROOT);
    return switch (x) {
      case "EASY" -> "BASIC";
      case "MEDIUM" -> "INTERMEDIATE";
      case "HARD" -> "ADVANCED";
      case "BASIC", "INTERMEDIATE", "ADVANCED" -> x;
      default -> null;
    };
  }

  private String normalizeDbDifficulty(String in) {
    if (in == null || in.isBlank())
      return null;
    String x = in.trim().toUpperCase(Locale.ROOT);
    return switch (x) {
      case "EASY" -> "BASIC";
      case "MEDIUM" -> "INTERMEDIATE";
      case "HARD" -> "ADVANCED";
      case "BASIC", "INTERMEDIATE", "ADVANCED" -> x;
      default -> null;
    };
  }

  private String mapDifficultyToAdvisor(Exercise.Difficulty d) {
    if (d == null)
      return null;
    return switch (d) {
      case BASIC -> "EASY";
      case INTERMEDIATE -> "MEDIUM";
      case ADVANCED -> "HARD";
    };
  }

  private String deriveTitle(String statement) {
    if (statement == null)
      return null;
    String oneLine = statement.replaceAll("\\s+", " ").trim();
    return oneLine.length() <= 140 ? oneLine : (oneLine.substring(0, 137) + "…");
  }

  private ObjectiveExerciseLiteResponse toLite(Exercise e) {
    UUID objectiveId = (e.getLearningObjective() != null) ? e.getLearningObjective().getId() : null;
    String diff = mapDifficultyToAdvisor(e.getDifficulty());
    String title = deriveTitle(e.getStatement());
    return new ObjectiveExerciseLiteResponse(e.getId(), objectiveId, diff, title);
  }
}
