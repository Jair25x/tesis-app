package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.service.CompetencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Importaciones para OpenAPI (Swagger)
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter; // Para documentar parámetros de path/query

/**
 * Controlador REST para la gestión de Competencias.
 * Expone endpoints para operaciones CRUD de Competencias, aplicando seguridad
 * basada en roles.
 */
@RestController
@RequestMapping("/api/competencies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Competencias", description = "API para la gestión de competencias") // Etiqueta para agrupar endpoints en
                                                                                 // Swagger UI
public class CompetencyController {

  private final CompetencyService competencyService;

  /**
   * Crea una nueva competencia.
   * Requiere el rol ADMIN.
   *
   * @param request DTO que contiene los datos para la creación de la competencia.
   * @return ResponseEntity con el DTO de respuesta de la competencia creada y
   *         estado HTTP 201 Created.
   */
  @Operation(summary = "Crea una nueva competencia", description = "Permite a los usuarios con rol ADMIN crear una nueva competencia asociada a un currículo.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Competencia creada exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CompetencyResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o competencia con código existente", content = @Content),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No tiene permisos para crear competencias (rol requerido: ADMIN)", content = @Content),
      @ApiResponse(responseCode = "404", description = "Currículo padre no encontrado", content = @Content)
  })
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CompetencyResponse> createCompetency(@Valid @RequestBody CompetencyRequest request) {
    log.info("Recibida solicitud para crear competencia: {}", request.getName());
    CompetencyResponse response = competencyService.createCompetency(request);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Obtiene una competencia por su ID.
   * Requiere autenticación.
   *
   * @param id El ID de la competencia a buscar.
   * @return ResponseEntity con el DTO de respuesta de la competencia encontrada y
   *         estado HTTP 200 OK.
   */
  @Operation(summary = "Obtiene una competencia por su ID", description = "Permite a los usuarios autenticados obtener los detalles de una competencia específica.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Competencia encontrada exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CompetencyResponse.class))),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No autenticado o sin los permisos necesarios", content = @Content),
      @ApiResponse(responseCode = "404", description = "Competencia no encontrada", content = @Content)
  })
  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<CompetencyResponse> getCompetencyById(
      @Parameter(description = "ID único de la competencia a buscar", required = true) @PathVariable UUID id) {
    log.info("Recibida solicitud para obtener competencia con ID: {}", id);
    CompetencyResponse response = competencyService.getCompetencyById(id);
    return ResponseEntity.ok(response);
  }

  /**
   * Obtiene todas las competencias.
   * Requiere autenticación.
   *
   * @return ResponseEntity con una lista de DTOs de respuesta de competencias y
   *         estado HTTP 200 OK.
   */
  @Operation(summary = "Obtiene todas las competencias activas", description = "Permite a los usuarios autenticados obtener una lista de todas las competencias activas en el sistema.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de competencias obtenida exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CompetencyResponse.class))),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No autenticado o sin los permisos necesarios", content = @Content)
  })
  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<CompetencyResponse>> getAllCompetencies() {
    log.info("Recibida solicitud para obtener todas las competencias.");
    List<CompetencyResponse> responses = competencyService.getAllCompetencies();
    return ResponseEntity.ok(responses);
  }

  /**
   * Obtiene todas las competencias activas asociadas a un currículo específico.
   * Requiere autenticación.
   *
   * @param curriculumId El ID del currículo padre.
   * @return ResponseEntity con una lista de DTOs de respuesta de competencias y
   *         estado HTTP 200 OK.
   */
  @Operation(summary = "Obtiene competencias por el ID del currículo padre", description = "Permite a los usuarios autenticados obtener una lista de competencias asociadas a un currículo específico.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de competencias del currículo obtenida exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CompetencyResponse.class))),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No autenticado o sin los permisos necesarios", content = @Content),
      @ApiResponse(responseCode = "404", description = "Currículo padre no encontrado", content = @Content)
  })
  @GetMapping("/by-curriculum/{curriculumId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<CompetencyResponse>> getCompetenciesByCurriculumId(
      @Parameter(description = "ID único del currículo al que pertenecen las competencias", required = true) @PathVariable UUID curriculumId) {
    log.info("Recibida solicitud para obtener competencias por ID de currículo: {}", curriculumId);
    List<CompetencyResponse> responses = competencyService.getCompetenciesByCurriculumId(curriculumId);
    return ResponseEntity.ok(responses);
  }

  /**
   * Actualiza una competencia existente.
   * Requiere el rol ADMIN.
   *
   * @param id      El ID de la competencia a actualizar.
   * @param request DTO que contiene los nuevos datos para la competencia.
   * @return ResponseEntity con el DTO de respuesta de la competencia actualizada
   *         y estado HTTP 200 OK.
   */
  @Operation(summary = "Actualiza una competencia existente", description = "Permite a los usuarios con rol ADMIN actualizar los detalles de una competencia existente.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Competencia actualizada exitosamente", content = @Content(mediaType = "application/json", schema = @Schema(implementation = CompetencyResponse.class))),
      @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos o código de competencia duplicado", content = @Content),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No tiene permisos para actualizar competencias (rol requerido: ADMIN)", content = @Content),
      @ApiResponse(responseCode = "404", description = "Competencia o currículo padre no encontrados", content = @Content)
  })
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CompetencyResponse> updateCompetency(
      @Parameter(description = "ID único de la competencia a actualizar", required = true) @PathVariable UUID id,
      @Valid @RequestBody CompetencyRequest request) {
    log.info("Recibida solicitud para actualizar competencia con ID: {}", id);
    CompetencyResponse response = competencyService.updateCompetency(id, request);
    return ResponseEntity.ok(response);
  }

  /**
   * Elimina lógicamente una competencia por su ID.
   * Utiliza el mecanismo de Soft Delete.
   * Requiere el rol ADMIN.
   *
   * @param id El ID de la competencia a eliminar.
   * @return ResponseEntity con estado HTTP 204 No Content.
   */
  @Operation(summary = "Elimina lógicamente una competencia por su ID", description = "Permite a los usuarios con rol ADMIN marcar una competencia como inactiva (soft delete).")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Competencia eliminada lógicamente exitosamente", content = @Content),
      @ApiResponse(responseCode = "401", description = "Acceso no autorizado", content = @Content),
      @ApiResponse(responseCode = "403", description = "No tiene permisos para eliminar competencias (rol requerido: ADMIN)", content = @Content),
      @ApiResponse(responseCode = "404", description = "Competencia no encontrada o ya inactiva", content = @Content)
  })
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteCompetency(
      @Parameter(description = "ID único de la competencia a eliminar", required = true) @PathVariable UUID id) {
    log.info("Recibida solicitud para eliminar competencia con ID: {}", id);
    competencyService.deleteCompetency(id);
  }
}
