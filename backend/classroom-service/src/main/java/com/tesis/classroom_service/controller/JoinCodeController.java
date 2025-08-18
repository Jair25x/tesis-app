package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.request.GenerateJoinCodeRequest;
import com.tesis.classroom_service.dto.request.JoinRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.JoinCodeDto;
import com.tesis.classroom_service.service.JoinCodeService;
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

import java.util.UUID;

@Tag(name = "Join Codes", description = "Códigos de ingreso a un aula")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
public class JoinCodeController {

  private final JoinCodeService joinCodeService;

  @Operation(summary = "Generar o reemplazar join code", description = "Crea un código nuevo (invalida el anterior). Solo el owner.")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PostMapping("/api/classrooms/{classroomId}/join-code")
  public ResponseEntity<JoinCodeDto> generate(@PathVariable UUID classroomId,
      @Valid @RequestBody(required = false) GenerateJoinCodeRequest req) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    JoinCodeDto dto = joinCodeService.generate(classroomId, ownerUuid, req);
    return ResponseEntity.ok(dto);
  }

  @Operation(summary = "Ver join code activo", description = "Devuelve el código activo del aula (si existe). Solo el owner.")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping("/api/classrooms/{classroomId}/join-code")
  public ResponseEntity<JoinCodeDto> getActive(@PathVariable UUID classroomId) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(joinCodeService.getActive(classroomId, ownerUuid));
  }

  @Operation(summary = "Revocar join code", description = "Invalida el código activo. Solo el owner.")
  @ApiResponse(responseCode = "204", description = "Código revocado")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @DeleteMapping("/api/classrooms/{classroomId}/join-code")
  public ResponseEntity<Void> revoke(@PathVariable UUID classroomId) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    joinCodeService.revoke(classroomId, ownerUuid);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Unirse a un aula con código", description = "Estudiante canjea un código y se une al aula.")
  @ApiResponse(responseCode = "200", description = "Ingreso exitoso")
  @PreAuthorize("hasRole('STUDENT')")
  @PostMapping("/api/classrooms/join")
  public ResponseEntity<ClassroomDetailDto> join(@Valid @RequestBody JoinRequest req) {
    UUID studentUuid = SecurityUtils.getCurrentUserIdOrThrow();
    ClassroomDetailDto joined = joinCodeService.join(studentUuid, req);
    return ResponseEntity.ok(joined);
  }
}
