// src/main/java/com/tesis/curriculum_service/controller/InternalExerciseLookupController.java
package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.model.Exercise;
import com.tesis.curriculum_service.repository.ExerciseRepository;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Hidden
@RestController
// ✅ Dos bases para compatibilidad: NO creamos otro controller
@RequestMapping({ "/internal/curricula/exercises", "/internal/exercises" })
@RequiredArgsConstructor
public class InternalExerciseLookupController {

  private final ExerciseRepository exerciseRepository;

  public record ExerciseLite(UUID id, String difficulty) {
  }

  /*
   * ------------------------------------------------------------------
   * GET /internal/curricula/exercises/lookup?ids=...
   * (se mantiene para compatibilidad con llamadas previas)
   * ------------------------------------------------------------------
   */
  @Operation(summary = "[INTERNAL] Lookup de ejercicios por IDs (id + difficulty) - Querystring")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/lookup")
  public ResponseEntity<List<ExerciseLite>> lookupByIds(@RequestParam @NotBlank String ids) {
    // ids = "uuid,uuid,uuid"
    List<UUID> list = Arrays.stream(ids.split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(UUID::fromString)
        .distinct()
        .limit(200) // hard limit para evitar abusos
        .toList();

    if (list.isEmpty())
      return ResponseEntity.ok(List.of());

    List<Exercise> found = exerciseRepository.findAllById(list);

    List<ExerciseLite> out = found.stream()
        .map(e -> new ExerciseLite(
            e.getId(),
            e.getDifficulty() == null ? null : e.getDifficulty().name() // BASIC|INTERMEDIATE|ADVANCED
        ))
        .collect(Collectors.toList());

    return ResponseEntity.ok(out);
  }

  /*
   * ------------------------------------------------------------------
   * POST /internal/exercises/lookup
   * Body: { "ids": ["...", "..."] }
   * Respuesta: { "items": [ { "id": "...", "active": true|false|null,
   * "difficulty": "EASY|MEDIUM|HARD|null" }, ... ] }
   * → Este es el contrato que usa duels-service
   * ------------------------------------------------------------------
   */
  @PostMapping("/lookup")
  @PreAuthorize("hasRole('INTERNAL')")
  public ResponseEntity<Map<String, Object>> lookupByJson(@RequestBody Map<String, Object> body) {
    @SuppressWarnings("unchecked")
    List<String> rawIds = (List<String>) body.getOrDefault("ids", List.of());
    List<UUID> ids = new ArrayList<>();
    for (Object o : rawIds) {
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
    var rows = exerciseRepository.findStatusByIds(ids);

    Map<UUID, ExerciseRepository.ExStatusRow> byId = new HashMap<>();
    for (var r : rows)
      byId.put(r.getId(), r);

    var items = new ArrayList<Map<String, Object>>(ids.size());
    for (UUID id : ids) {
      var r = byId.get(id);
      items.add(r == null
          ? Map.of("id", id, "active", null, "difficulty", null)
          : Map.of("id", id, "active", r.getActive(), "difficulty", r.getDifficultyUi()));
    }
    return ResponseEntity.ok(Map.of("items", items));
  }
}
