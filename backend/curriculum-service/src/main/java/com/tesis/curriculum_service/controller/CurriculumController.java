package com.tesis.curriculum_service.controller;

import com.tesis.curriculum_service.dto.CurriculumRequest; // DTO para las peticiones de creación/actualización
import com.tesis.curriculum_service.dto.CurriculumResponse; // DTO para las respuestas
import com.tesis.curriculum_service.service.CurriculumService; // Interfaz del servicio
import com.tesis.curriculum_service.exception.ErrorResponse; // Importa tu ErrorResponse DTO
import com.tesis.curriculum_service.dto.CurriculumStatsResponse; // DTO para estadísticas
import jakarta.validation.Valid; // Para activar la validación de DTOs en el RequestBody
import lombok.RequiredArgsConstructor; // Genera un constructor con los campos 'final'
import org.springframework.http.HttpStatus; // Para los códigos de estado HTTP
import org.springframework.http.ResponseEntity; // Para construir respuestas HTTP personalizadas
import org.springframework.security.access.prepost.PreAuthorize; // Anotación para autorización basada en roles
import org.springframework.web.bind.annotation.*; // Anotaciones de Spring Web

// Importaciones de OpenAPI (SpringDoc)
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement; // Para documentar la seguridad
import io.swagger.v3.oas.annotations.tags.Tag; // Para agrupar endpoints en Swagger UI

import java.util.List; // Para listas de currículos
import java.util.UUID; // Para identificadores únicos
import java.util.Map; // Para el mapa de errores en validación

/**
 * Controlador REST para la gestión de currículos.
 * Expone endpoints para operaciones CRUD de la entidad Curriculum.
 */
@RestController // Combina @Controller y @ResponseBody, indicando que esta clase es un
                // controlador
                // y que los métodos devuelven directamente los datos que se serializarán a
                // JSON/XML.
@RequestMapping("/api/curriculum") // Define la ruta base para todos los endpoints en este controlador.
@RequiredArgsConstructor // Genera un constructor con un argumento para cada campo final, facilitando la
                         // inyección de dependencias.
@Tag(name = "Gestión de Currículos", description = "Operaciones para crear, consultar, actualizar y eliminar currículos escolares.")
public class CurriculumController {

  private final CurriculumService curriculumService; // Inyección de dependencia del servicio

  /**
   * Endpoint para crear un nuevo currículo.
   * Mapea peticiones POST a /api/curriculum.
   * 
   * @param request DTO con los datos del currículo a crear.
   * @return ResponseEntity con el currículo creado y estado HTTP 201 CREATED.
   */
  @Operation(summary = "Crear un nuevo currículo", description = "Permite a un ADMIN crear una nueva entrada de currículo en el sistema.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "Currículo creado exitosamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud mal formada o datos inválidos", content = @Content(schema = @Schema(implementation = Map.class))), // Para
                                                                                                                                                                     // MethodArgumentNotValidException
      @ApiResponse(responseCode = "403", description = "Acceso denegado (no es ADMIN)", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth") // Indica que este endpoint requiere autenticación JWT
  @PreAuthorize("hasRole('ROLE_ADMIN')") // Solo usuarios con rol ADMIN pueden crear currículos
  @PostMapping
  public ResponseEntity<CurriculumResponse> createCurriculum(@Valid @RequestBody CurriculumRequest request) {
    CurriculumResponse response = curriculumService.createCurriculum(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  /**
   * Endpoint para obtener un currículo por su ID.
   * Mapea peticiones GET a /api/curriculum/{id}.
   * 
   * @param id El ID del currículo a buscar.
   * @return ResponseEntity con el currículo encontrado y estado HTTP 200 OK.
   */
  @Operation(summary = "Obtener currículo por ID", description = "Devuelve los detalles de un currículo específico por su identificador único.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo encontrado exitosamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth")
  @PreAuthorize("isAuthenticated()") // Cualquier usuario autenticado puede ver detalles de currículos específicos
  @GetMapping("/{id}")
  public ResponseEntity<CurriculumResponse> getCurriculumById(@PathVariable UUID id) {
    CurriculumResponse response = curriculumService.getCurriculumById(id);
    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint para obtener todos los currículos.
   * Mapea peticiones GET a /api/curriculum.
   * 
   * @return ResponseEntity con la lista de currículos y estado HTTP 200 OK.
   */
  @Operation(summary = "Obtener todos los currículos", description = "Devuelve una lista de todos los currículos disponibles en el sistema.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de currículos obtenida exitosamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class, type = "array"))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth") // Requiere autenticación
  @PreAuthorize("permitAll()") // El listado de currículos es completamente público
  @GetMapping
  public ResponseEntity<List<CurriculumResponse>> getAllCurricula() {
    List<CurriculumResponse> response = curriculumService.getAllCurriculums();
    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint para obtener currículos filtrados por grado.
   * Mapea peticiones GET a /api/curriculum/grade/{grade}.
   * 
   * @param grade El grado del currículo a buscar (ej. "6to grado").
   * @return ResponseEntity con la lista de currículos y estado HTTP 200 OK.
   */
  @Operation(summary = "Obtener currículos por grado", description = "Devuelve una lista de currículos filtrados por un grado específico.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Lista de currículos por grado obtenida exitosamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class, type = "array"))),
      @ApiResponse(responseCode = "400", description = "Solicitud mal formada o grado inválido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth")
  @PreAuthorize("isAuthenticated()") // Cualquier usuario autenticado puede filtrar por grado
  @GetMapping("/grade/{grade}")
  public ResponseEntity<List<CurriculumResponse>> getCurriculaByGrade(@PathVariable String grade) {
    List<CurriculumResponse> response = curriculumService.getCurriculaByGrade(grade);
    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint para obtener estadísticas generales del currículo.
   * Mapea peticiones GET a /api/curriculum/stats.
   * 
   * @return ResponseEntity con las estadísticas y estado HTTP 200 OK.
   */
  @Operation(summary = "Obtener estadísticas del currículo", description = "Devuelve métricas y estadísticas generales relacionadas con los currículos, útil para el microservicio de Progress Analytics.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente", content = @Content(schema = @Schema(implementation = CurriculumStatsResponse.class))),
      @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado (solo ADMIN/TEACHER)", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth")
  @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')") // Solo ADMINs o TEACHERs pueden ver estadísticas
  @GetMapping("/stats")
  public ResponseEntity<CurriculumStatsResponse> getCurriculumStats() {
    CurriculumStatsResponse response = curriculumService.getCurriculumStats();
    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint para actualizar un currículo existente por su ID.
   * Mapea peticiones PUT a /api/curriculum/{id}.
   * 
   * @param id      El ID del currículo a actualizar.
   * @param request DTO con los nuevos datos del currículo.
   * @return ResponseEntity con el currículo actualizado y estado HTTP 200 OK.
   */
  @Operation(summary = "Actualizar un currículo existente", description = "Permite a un ADMIN actualizar los datos de un currículo por su ID.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Currículo actualizado exitosamente", content = @Content(schema = @Schema(implementation = CurriculumResponse.class))),
      @ApiResponse(responseCode = "400", description = "Solicitud mal formada o datos inválidos", content = @Content(schema = @Schema(implementation = Map.class))),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado (no es ADMIN)", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth")
  @PreAuthorize("hasRole('ROLE_ADMIN')") // Solo usuarios con rol ADMIN pueden actualizar currículos
  @PutMapping("/{id}")
  public ResponseEntity<CurriculumResponse> updateCurriculum(@PathVariable UUID id,
      @Valid @RequestBody CurriculumRequest request) {
    CurriculumResponse response = curriculumService.updateCurriculum(id, request);
    return ResponseEntity.ok(response);
  }

  /**
   * Endpoint para eliminar un currículo por su ID.
   * Mapea peticiones DELETE a /api/curriculum/{id}.
   * 
   * @param id El ID del currículo a eliminar.
   * @return ResponseEntity sin contenido y estado HTTP 204 NO CONTENT.
   */
  @Operation(summary = "Eliminar un currículo", description = "Permite a un ADMIN eliminar (lógicamente o físicamente) un currículo por su ID.")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Currículo eliminado exitosamente (No Content)"),
      @ApiResponse(responseCode = "404", description = "Currículo no encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
      @ApiResponse(responseCode = "403", description = "Acceso denegado (no es ADMIN)", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
  })
  @SecurityRequirement(name = "bearerAuth")
  @PreAuthorize("hasRole('ROLE_ADMIN')") // Solo usuarios con rol ADMIN pueden eliminar currículos
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteCurriculum(@PathVariable UUID id) {
    curriculumService.deleteCurriculum(id);
    return ResponseEntity.noContent().build();
  }
}
