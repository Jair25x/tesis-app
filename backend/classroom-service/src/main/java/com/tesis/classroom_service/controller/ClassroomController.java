package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.request.CreateClassroomRequest;
import com.tesis.classroom_service.dto.request.UpdateClassroomRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.ClassroomSummaryDto;
import com.tesis.classroom_service.service.ClassroomService;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@Tag(name = "Classrooms", description = "Gestión de aulas del docente y vistas del estudiante")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

  private final ClassroomService classroomService;

  @Operation(summary = "Crear aula", description = "Crea un aula a nombre del docente autenticado (owner).")
  @ApiResponse(responseCode = "201", description = "Aula creada")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PostMapping
  public ResponseEntity<ClassroomDetailDto> create(@Valid @RequestBody CreateClassroomRequest req) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    ClassroomDetailDto created = classroomService.create(ownerUuid, req);
    return ResponseEntity.created(URI.create("/api/classrooms/" + created.getId())).body(created);
  }

  @Operation(summary = "Mis aulas (docente)", description = "Lista aulas cuyo propietario es el docente autenticado.")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping("/mine")
  public ResponseEntity<List<ClassroomSummaryDto>> mine() {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(classroomService.listMine(ownerUuid));
  }

  @Operation(summary = "Mis aulas inscritas (estudiante)", description = "Lista aulas donde el estudiante es miembro.")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @GetMapping("/enrolled")
  public ResponseEntity<List<ClassroomSummaryDto>> enrolled() {
    UUID userUuid = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(classroomService.listEnrolled(userUuid));
  }

  @Operation(summary = "Detalle de aula", description = "Devuelve el detalle si el usuario es propietario o miembro del aula.")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @GetMapping("/{id}")
  public ResponseEntity<ClassroomDetailDto> get(@PathVariable UUID id) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(classroomService.getDetail(id, requester));
  }

  @Operation(summary = "Actualizar aula (owner)", description = "Actualiza metadatos del aula. Solo el owner.")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PatchMapping("/{id}")
  public ResponseEntity<ClassroomDetailDto> update(@PathVariable UUID id,
      @Valid @RequestBody UpdateClassroomRequest req) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(classroomService.update(id, requester, req));
  }

  @Operation(summary = "Eliminar aula (soft delete)", description = "Marca el aula como inactiva. Solo el owner.")
  @ApiResponse(responseCode = "204", description = "Aula eliminada (soft)")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable UUID id) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    classroomService.delete(id, requester);
    return ResponseEntity.noContent().build();
  }
}
