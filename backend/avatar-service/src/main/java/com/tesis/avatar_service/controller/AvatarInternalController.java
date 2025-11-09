package com.tesis.avatar_service.controller;

import com.tesis.avatar_service.dto.AvatarDtos;
import com.tesis.avatar_service.service.AvatarInventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Validated
@Tag(name = "Internal Rewards", description = "Endpoint interno S2S para registrar recompensas")
@RestController
@RequestMapping(value = "/internal/avatar/rewards", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class AvatarInternalController {

  private final AvatarInventoryService inventoryService;

  public record ClaimRequest(
      @NotNull UUID studentId,
      @NotBlank String source, // ACHIEVEMENT|DUEL|EVENT
      @NotBlank String awardCode, // p.ej. ACHIEVEMENT:DUEL_FIRST_WIN
      String triggerCode,
      String metadataJson) {
  }

  @Operation(summary = "Reclamar recompensa (idempotente)", responses = {
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = AvatarDtos.RewardClaimResult.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud inválida"),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Acceso denegado")
  })
  @PreAuthorize("hasRole('INTERNAL')")
  @PostMapping(value = "/claim", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<AvatarDtos.RewardClaimResult> claim(
      @Valid @RequestBody ClaimRequest req,
      @RequestHeader(name = "X-Service-Actor", required = false) String actor) {

    var result = inventoryService.claim(
        AvatarDtos.RewardClaimRequest.builder()
            .studentId(req.studentId())
            .source(req.source())
            .triggerCode(req.triggerCode())
            .awardCode(req.awardCode())
            .metadataJson(req.metadataJson())
            .actor((actor == null || actor.isBlank()) ? "progress-service" : actor)
            .build());

    return ResponseEntity.ok(result);
  }
}
