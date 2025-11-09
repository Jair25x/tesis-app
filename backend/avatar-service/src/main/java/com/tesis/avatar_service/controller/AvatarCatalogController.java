package com.tesis.avatar_service.controller;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.service.AvatarCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@Tag(name = "Avatar Catalog", description = "Catálogo de ítems cosméticos disponibles")
@RestController
@RequestMapping(value = "/api/avatar/catalog", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AvatarCatalogController {

  private final AvatarCatalogService catalogService;

  @Operation(summary = "Listar ítems de catálogo activos (filtrable)", responses = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AvatarDtos.CatalogItemDto.class)))),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  public ResponseEntity<List<AvatarDtos.CatalogItemDto>> list(
      @RequestParam(required = false) @Size(max = 16) String slot,
      @RequestParam(required = false) @Size(max = 24) String rarity,
      @RequestParam(required = false, name = "q") @Size(max = 64) String query) {

    return ResponseEntity.ok(catalogService.getActiveCatalog(slot, rarity, query));
  }
}
