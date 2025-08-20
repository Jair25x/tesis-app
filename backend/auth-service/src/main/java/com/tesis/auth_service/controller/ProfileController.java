package com.tesis.auth_service.controller;

import com.tesis.auth_service.dto.PublicProfileDto;
import com.tesis.auth_service.exception.ErrorResponse;
import com.tesis.auth_service.service.ProfileQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "Profiles (S2S)", description = "Perfiles públicos mínimos para uso entre microservicios")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ProfileController {

  private final ProfileQueryService profileQueryService;

  @Operation(summary = "Batch de perfiles públicos por IDs", description = """
        Obtiene perfiles públicos (id, displayName, avatarUrl) por lote.

        Authz:
        - Llamadas internas via S2S JWT (authority 'S2S'), o
        - ADMIN humano.

        Acepta:
        - /profiles?ids=uuid1,uuid2,uuid3
        - /profiles?ids=uuid1&ids=uuid2 ...
      """)
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = PublicProfileDto.class))))
  @ApiResponse(responseCode = "400", description = "Solicitud inválida", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @ApiResponse(responseCode = "403", description = "Prohibido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  @GetMapping("/profiles")
  @PreAuthorize("hasAuthority('S2S') or hasRole('ADMIN')")
  public ResponseEntity<List<PublicProfileDto>> getProfiles(@RequestParam(name = "ids") List<String> idsParam) {

    List<UUID> ids = idsParam.stream()
        .flatMap(s -> Arrays.stream(s.split(",")))
        .map(String::trim)
        .filter(x -> !x.isBlank())
        .map(UUID::fromString)
        .distinct()
        .collect(Collectors.toList());

    if (ids.isEmpty() || ids.size() > 200) {
      return ResponseEntity.badRequest().build();
    }

    var out = profileQueryService.getPublicProfiles(ids);
    return ResponseEntity.ok(out);
  }
}
