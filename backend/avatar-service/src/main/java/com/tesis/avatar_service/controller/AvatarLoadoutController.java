package com.tesis.avatar_service.controller;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.service.AvatarLoadoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@Validated
@Tag(name = "Avatar Loadout", description = "Equipamiento del avatar del estudiante")
@RestController
@RequestMapping(value = "/api/avatar/me/loadout", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AvatarLoadoutController {

  private final AvatarLoadoutService loadoutService;

  private UUID studentIdFromPrincipal(Principal principal) {
    return UUID.fromString(principal.getName());
  }

  @Operation(summary = "Obtener equipamiento actual del estudiante", responses = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = AvatarDtos.LoadoutDto.class))),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @GetMapping
  public ResponseEntity<AvatarDtos.LoadoutDto> get(Principal principal) {
    UUID studentId = studentIdFromPrincipal(principal);
    return ResponseEntity.ok(loadoutService.getLoadout(studentId));
  }

  public record PatchLoadoutRequest(
      @NotBlank String slot, // BODY|HAT|FACE|OUTFIT|BACKGROUND
      UUID itemId // null => limpiar
  ) {
  }

  @Operation(summary = "Actualizar equipamiento (equipar o limpiar slot)", responses = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = AvatarDtos.EquipResult.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @PatchMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<AvatarDtos.EquipResult> patch(
      Principal principal,
      @Valid @RequestBody PatchLoadoutRequest req) {

    UUID studentId = studentIdFromPrincipal(principal);
    var result = loadoutService.equip(
        AvatarDtos.EquipRequest.builder()
            .studentId(studentId)
            .slot(req.slot())
            .itemId(req.itemId()) // null => limpiar slot
            .actor(studentId.toString())
            .build());
    return ResponseEntity.ok(result);
  }
}
