package com.tesis.progress_service.controller;

import com.tesis.progress_service.dto.AchievementDto;
import com.tesis.progress_service.exception.ErrorResponse;
import com.tesis.progress_service.service.AchievementService;
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

import java.util.List;

@Tag(name = "Achievements", description = "Catálogo de logros y estado del estudiante")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/progress/achievements")
@RequiredArgsConstructor
public class AchievementController {

  private final AchievementService achievementService;

  @Operation(summary = "Catálogo de logros disponibles", description = "Lista todos los logros activos (catálogo). Útil para que el FE muestre los bloqueados con su metadata.", responses = {
      @ApiResponse(responseCode = "200", description = "Catálogo obtenido", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AchievementDto.class)))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Sin permisos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @GetMapping("/catalog")
  @PreAuthorize("hasAnyRole('STUDENT','TEACHER','ADMIN')")
  public ResponseEntity<List<AchievementDto>> catalog() {
    return ResponseEntity.ok(achievementService.getCatalog());
  }
}
