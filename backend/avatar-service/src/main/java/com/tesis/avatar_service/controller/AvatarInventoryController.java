package com.tesis.avatar_service.controller;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.service.AvatarInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Validated
@Tag(name = "Avatar Inventory", description = "Inventario de cosméticos del estudiante")
@RestController
@RequestMapping(value = "/api/avatar/me/inventory", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AvatarInventoryController {

  private final AvatarInventoryService inventoryService;

  private UUID studentIdFromPrincipal(Principal principal) {
    // Tu JwtAuthenticationFilter setea el principal como UUID del usuario
    // (no-internal).
    return UUID.fromString(principal.getName());
  }

  @Operation(summary = "Listar inventario del estudiante autenticado", responses = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AvatarDtos.InventoryItemDto.class)))),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  @GetMapping
  public ResponseEntity<List<AvatarDtos.InventoryItemDto>> myInventory(Principal principal) {
    UUID studentId = studentIdFromPrincipal(principal);
    return ResponseEntity.ok(inventoryService.getInventory(studentId));
  }
}
