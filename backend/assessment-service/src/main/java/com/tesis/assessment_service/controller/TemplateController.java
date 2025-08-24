package com.tesis.assessment_service.controller;

import com.tesis.assessment_service.dto.request.TemplateRequest;
import com.tesis.assessment_service.dto.response.TemplateResponse;
import com.tesis.assessment_service.exception.BadRequestException;
import com.tesis.assessment_service.service.TemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/assessments/templates", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "Templates", description = "Gestión de plantillas de evaluaciones")
public class TemplateController {

  private final TemplateService templateService;

  private UUID currentUserId(Authentication auth) {
    try {
      return UUID.fromString(auth.getName());
    } catch (Exception e) {
      throw new BadRequestException("Principal no es un UUID");
    }
  }

  @Operation(summary = "Crear plantilla", description = "Docente/Admin crea una plantilla con ítems preseleccionados.")
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Creado", content = @Content(schema = @Schema(implementation = TemplateResponse.class))),
      @ApiResponse(responseCode = "400", description = "Petición inválida"),
      @ApiResponse(responseCode = "403", description = "Prohibido"),
      @ApiResponse(responseCode = "409", description = "Conflicto")
  })
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<TemplateResponse> create(@Valid @RequestBody TemplateRequest request,
      Authentication auth) {
    UUID ownerId = currentUserId(auth);
    TemplateResponse resp = templateService.createTemplate(ownerId, request);
    return ResponseEntity.created(URI.create("/api/assessments/templates/" + resp.id())).body(resp);
  }

  @Operation(summary = "Obtener plantilla por ID")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = TemplateResponse.class))),
      @ApiResponse(responseCode = "404", description = "No encontrada")
  })
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<TemplateResponse> get(@PathVariable UUID id) {
    return ResponseEntity.ok(templateService.getTemplate(id));
  }

  @Operation(summary = "Actualizar plantilla")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Actualizado", content = @Content(schema = @Schema(implementation = TemplateResponse.class))),
      @ApiResponse(responseCode = "403", description = "Prohibido (no dueño)"),
      @ApiResponse(responseCode = "404", description = "No encontrada")
  })
  @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<TemplateResponse> update(@PathVariable UUID id,
      @Valid @RequestBody TemplateRequest request,
      Authentication auth) {
    UUID userId = currentUserId(auth);
    return ResponseEntity.ok(templateService.updateTemplate(id, userId, request));
  }

  @Operation(summary = "Eliminar plantilla")
  @ApiResponses({
      @ApiResponse(responseCode = "204", description = "Eliminado"),
      @ApiResponse(responseCode = "403", description = "Prohibido"),
      @ApiResponse(responseCode = "404", description = "No encontrada")
  })
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
    UUID userId = currentUserId(auth);
    templateService.deleteTemplate(id, userId);
    return ResponseEntity.noContent().build();
  }
}
