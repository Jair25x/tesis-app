// src/main/java/com/tesis/classroom_service/controller/MembershipController.java
package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.dto.response.PageResponse;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.service.MembershipService;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Members", description = "Gestión de miembros de un aula")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/classrooms/{classroomId}/members")
@RequiredArgsConstructor
public class MembershipController {

  private final MembershipService membershipService;

  // ----------------- PRIVADO (roles reales) -----------------

  @Operation(summary = "Listar miembros del aula (privado)", description = "Visible para OWNER (o ADMIN). Soporta paginación, orden y filtro por rol.", parameters = {
      @Parameter(name = "page", in = ParameterIn.QUERY, description = "Página (0..N)", schema = @Schema(defaultValue = "0")),
      @Parameter(name = "size", in = ParameterIn.QUERY, description = "Tamaño de página", schema = @Schema(defaultValue = "20")),
      @Parameter(name = "sort", in = ParameterIn.QUERY, description = "Propiedad,dir (p.ej. joinedAt,desc)", schema = @Schema(defaultValue = "joinedAt,desc")),
      @Parameter(name = "role", in = ParameterIn.QUERY, description = "Filtro por rol del aula (OWNER|CO_TEACHER|STUDENT)")
  })
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping
  public ResponseEntity<PageResponse<MemberDto>> list(
      @PathVariable UUID classroomId,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) int size,
      @RequestParam(defaultValue = "joinedAt,desc") String sort,
      @RequestParam(required = false) MemberRole role) {

    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    var out = membershipService.listMembers(classroomId, requester, page, size, sort, role);
    return ResponseEntity.ok(out);
  }

  @Operation(summary = "Agregar miembro (por userUuid)", description = "Agrega un usuario al aula. Por defecto como STUDENT.")
  @ApiResponse(responseCode = "200", description = "Miembro agregado (idempotente si ya existía)", content = @Content(schema = @Schema(implementation = MemberDto.class)))
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PostMapping
  public ResponseEntity<MemberDto> addMember(
      @PathVariable UUID classroomId,
      @RequestParam("userUuid") UUID userUuid,
      @RequestParam(value = "role", required = false, defaultValue = "STUDENT") MemberRole role) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(membershipService.addMember(classroomId, ownerUuid, userUuid, role));
  }

  @Operation(summary = "Expulsar miembro", description = "Elimina la membresía del usuario indicado.")
  @ApiResponse(responseCode = "204", description = "Miembro eliminado")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @DeleteMapping("/{userUuid}")
  public ResponseEntity<Void> removeMember(
      @PathVariable UUID classroomId,
      @PathVariable UUID userUuid) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    membershipService.removeMember(classroomId, ownerUuid, userUuid);
    return ResponseEntity.noContent().build();
  }

  // ----------------- PÚBLICO PARA INTEGRANTES -----------------

  @Operation(summary = "Listado público de miembros (para integrantes del aula)", description = "Visible para cualquier integrante (OWNER/CO_TEACHER/STUDENT). Si el solicitante es STUDENT, se ocultan roles (todos STUDENT salvo OWNER). "
      +
      "Con expand=true se enriquece con perfiles (displayName/avatar). Soporta paginación, orden y búsqueda por nombre (search) cuando expand=true.", parameters = {
          @Parameter(name = "page", in = ParameterIn.QUERY, schema = @Schema(defaultValue = "0")),
          @Parameter(name = "size", in = ParameterIn.QUERY, schema = @Schema(defaultValue = "20")),
          @Parameter(name = "sort", in = ParameterIn.QUERY, schema = @Schema(defaultValue = "joinedAt,desc")),
          @Parameter(name = "expand", in = ParameterIn.QUERY, schema = @Schema(defaultValue = "false")),
          @Parameter(name = "search", in = ParameterIn.QUERY, description = "Filtro por displayName (requiere expand=true)")
      })
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = MemberDto.class))))
  @ApiResponse(responseCode = "403", description = "No autorizado (no eres miembro)")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @GetMapping("/public")
  public ResponseEntity<PageResponse<MemberDto>> listPublic(
      @PathVariable UUID classroomId,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "20") @Min(1) int size,
      @RequestParam(defaultValue = "joinedAt,desc") String sort,
      @RequestParam(defaultValue = "false") boolean expand,
      @RequestParam(required = false) String search) {

    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    var out = membershipService.listMembersPublic(classroomId, requester, expand, search, page, size, sort);
    return ResponseEntity.ok(out);
  }
}
