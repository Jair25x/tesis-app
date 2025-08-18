package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.service.MembershipService;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Members", description = "Gestión de miembros de un aula")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/classrooms/{classroomId}/members")
@RequiredArgsConstructor
public class MembershipController {

  private final MembershipService membershipService;

  @Operation(summary = "Listar miembros del aula", description = "Visible para owner (o co-teacher si aplicas).")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping
  public ResponseEntity<List<MemberDto>> list(@PathVariable UUID classroomId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    return ResponseEntity.ok(membershipService.listMembers(classroomId, requester));
  }

  @Operation(summary = "Agregar miembro (por userUuid)", description = "Agrega un usuario al aula. Por defecto como STUDENT.")
  @ApiResponse(responseCode = "200", description = "Miembro agregado (idempotente si ya existía)")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @PostMapping
  public ResponseEntity<MemberDto> addMember(@PathVariable UUID classroomId,
      @RequestParam("userUuid") @NotNull UUID userUuid,
      @RequestParam(value = "role", required = false, defaultValue = "STUDENT") MemberRole role) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    MemberDto added = membershipService.addMember(classroomId, ownerUuid, userUuid, role);
    return ResponseEntity.ok(added);
  }

  @Operation(summary = "Expulsar miembro", description = "Elimina la membresía del usuario indicado.")
  @ApiResponse(responseCode = "204", description = "Miembro eliminado")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @DeleteMapping("/{userUuid}")
  public ResponseEntity<Void> removeMember(@PathVariable UUID classroomId,
      @PathVariable UUID userUuid) {
    UUID ownerUuid = SecurityUtils.getCurrentUserIdOrThrow();
    membershipService.removeMember(classroomId, ownerUuid, userUuid);
    return ResponseEntity.noContent().build();
  }
}
