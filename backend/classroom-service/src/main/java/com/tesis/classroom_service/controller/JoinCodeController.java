package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.request.GenerateJoinCodeRequest;
import com.tesis.classroom_service.dto.request.JoinRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.JoinCodeDto;
import com.tesis.classroom_service.service.JoinCodeService;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Join Codes", description = "Códigos de ingreso a un aula")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/classrooms", produces = MediaType.APPLICATION_JSON_VALUE)
public class JoinCodeController {

  private final JoinCodeService joinCodeService;

  // ---------------------------
  // TEACHER/ADMIN (service-check: OWNER o CO_TEACHER o ADMIN)
  // ---------------------------

  @Operation(summary = "Generar o reemplazar join code", description = "Crea un código nuevo (invalida el anterior si existe). "
      + "Permitido para OWNER o CO_TEACHER del aula (y ADMIN).")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Código generado", content = @Content(schema = @Schema(implementation = JoinCodeDto.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado"),
      @ApiResponse(responseCode = "403", description = "No autorizado"),
      @ApiResponse(responseCode = "404", description = "Aula no encontrada")
  })
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PostMapping(path = "/{classroomId}/join-code", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<JoinCodeDto> generate(
      @PathVariable UUID classroomId,
      @Valid @RequestBody(required = false) GenerateJoinCodeRequest req) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    JoinCodeDto dto = joinCodeService.generate(classroomId, requester, req);
    return ResponseEntity.ok(dto);
  }

  @Operation(summary = "Ver join code activo", description = "Devuelve el código activo del aula (si existe y no expiró). "
      + "Permitido para OWNER o CO_TEACHER (y ADMIN).")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = JoinCodeDto.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado"),
      @ApiResponse(responseCode = "403", description = "No autorizado"),
      @ApiResponse(responseCode = "404", description = "Aula no encontrada o código inexistente/expirado")
  })
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping("/{classroomId}/join-code")
  public ResponseEntity<JoinCodeDto> getActive(@PathVariable UUID classroomId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(joinCodeService.getActive(classroomId, requester));
  }

  @Operation(summary = "Revocar join code", description = "Invalida el código activo del aula. "
      + "Permitido para OWNER o CO_TEACHER (y ADMIN).")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Código revocado"),
      @ApiResponse(responseCode = "401", description = "No autenticado"),
      @ApiResponse(responseCode = "403", description = "No autorizado"),
      @ApiResponse(responseCode = "404", description = "Aula no encontrada")
  })
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @DeleteMapping("/{classroomId}/join-code")
  public ResponseEntity<Void> revoke(@PathVariable UUID classroomId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    joinCodeService.revoke(classroomId, requester);
    return ResponseEntity.noContent().build();
  }

  // ---------------------------
  // STUDENT
  // ---------------------------

  @Operation(summary = "Unirse a un aula con código", description = "El estudiante canjea un código válido y se une al aula de forma idempotente.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Ingreso exitoso", content = @Content(schema = @Schema(implementation = ClassroomDetailDto.class))),
      @ApiResponse(responseCode = "400", description = "Código inválido"),
      @ApiResponse(responseCode = "401", description = "No autenticado"),
      @ApiResponse(responseCode = "404", description = "Código no válido / aula no disponible"),
      @ApiResponse(responseCode = "409", description = "Código sin usos disponibles")
  })
  @PreAuthorize("hasRole('STUDENT')")
  @PostMapping(path = "/join", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<ClassroomDetailDto> join(@Valid @RequestBody JoinRequest req) {
    UUID studentUuid = SecurityUtils.getCurrentUserIdOrThrow();
    ClassroomDetailDto joined = joinCodeService.join(studentUuid, req);
    return ResponseEntity.ok(joined);
  }
}
