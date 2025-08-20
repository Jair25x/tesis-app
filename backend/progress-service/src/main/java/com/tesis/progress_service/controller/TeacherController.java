package com.tesis.progress_service.controller;

import com.tesis.progress_service.client.ClassroomClient;
import com.tesis.progress_service.dto.DailyStatDto;
import com.tesis.progress_service.dto.OverviewDto;
import com.tesis.progress_service.dto.StudentOverviewDto;
import com.tesis.progress_service.service.ProgressQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Teacher", description = "Consultas de progreso para docentes")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/progress/classrooms")
@RequiredArgsConstructor
public class TeacherController {

  private final ClassroomClient classroomClient;
  private final ProgressQueryService progressQueryService;

  @Operation(summary = "Overview por classroom (agregado por estudiante)", description = """
        Devuelve una lista de StudentOverviewDto para todos los miembros del aula.
        Si se provee curriculumId, los conteos se calculan para ese currículo;
        si se omite, se calcula global.
      """, parameters = {
      @Parameter(name = "classroomId", description = "Id del aula (UUID)", required = true),
      @Parameter(name = "curriculumId", description = "Id del currículo (UUID). Opcional.", required = false)
  })
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = StudentOverviewDto.class)))
  @ApiResponse(responseCode = "401", description = "No autorizado")
  @ApiResponse(responseCode = "403", description = "Prohibido (no eres owner/admin del aula)")
  @ApiResponse(responseCode = "404", description = "Aula no encontrada")
  @GetMapping("/{classroomId}/overview")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<List<StudentOverviewDto>> classroomOverview(
      @PathVariable(name = "classroomId") UUID classroomId,
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId) {
    var memberIds = classroomClient.listMemberIds(classroomId); // 403 si no es owner/admin
    var result = progressQueryService.getOverviewForStudents(memberIds, curriculumId);
    return ResponseEntity.ok(result);
  }

  @Operation(summary = "Detalle de un estudiante dentro del classroom", description = """
        Devuelve OverviewDto para un estudiante específico del aula.
        Si se provee curriculumId, el detalle se calcula para ese currículo; si no, es global.
      """, parameters = {
      @Parameter(name = "classroomId", description = "Id del aula (UUID)", required = true),
      @Parameter(name = "studentId", description = "Id del estudiante (UUID)", required = true),
      @Parameter(name = "curriculumId", description = "Id del currículo (UUID). Opcional.", required = false)
  })
  @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = OverviewDto.class)))
  @ApiResponse(responseCode = "401", description = "No autorizado")
  @ApiResponse(responseCode = "403", description = "Prohibido (no eres owner/admin del aula)")
  @ApiResponse(responseCode = "404", description = "Aula o estudiante no encontrado")
  @GetMapping("/{classroomId}/students/{studentId}")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<OverviewDto> studentDetail(
      @PathVariable(name = "classroomId") UUID classroomId,
      @PathVariable(name = "studentId") UUID studentId,
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId) {

    if (!classroomClient.isMember(classroomId, studentId)) {
      return ResponseEntity.notFound().build();
    }
    var dto = progressQueryService.getOverviewForStudent(studentId, curriculumId);
    return ResponseEntity.ok(dto);
  }

  @Operation(summary = "Serie diaria del aula (intentos/correctos agregados)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Prohibido (no eres owner/admin del aula)"),
      @ApiResponse(responseCode = "404", description = "Aula no encontrada")
  })
  @GetMapping("/{classroomId}/series")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<List<DailyStatDto>> classroomSeries(
      @PathVariable(name = "classroomId") UUID classroomId,
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId,
      @RequestParam(name = "range", required = false, defaultValue = "7d") String range) {

    var memberIds = classroomClient.listMemberIds(classroomId); // valida ownership
    var series = progressQueryService.getDailySeriesForStudents(memberIds, curriculumId, range);
    return ResponseEntity.ok(series);
  }

  @Operation(summary = "Serie diaria de un estudiante del aula (intentos/correctos)")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "401", description = "No autorizado"),
      @ApiResponse(responseCode = "403", description = "Prohibido (no eres owner/admin del aula)"),
      @ApiResponse(responseCode = "404", description = "Aula o estudiante no encontrado")
  })
  @GetMapping("/{classroomId}/students/{studentId}/series")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  public ResponseEntity<List<DailyStatDto>> studentSeries(
      @PathVariable(name = "classroomId") UUID classroomId,
      @PathVariable(name = "studentId") UUID studentId,
      @RequestParam(name = "curriculumId", required = false) UUID curriculumId,
      @RequestParam(name = "range", required = false, defaultValue = "7d") String range) {

    if (!classroomClient.isMember(classroomId, studentId)) {
      return ResponseEntity.notFound().build();
    }
    var series = progressQueryService.getDailySeriesForStudent(studentId, curriculumId, range);
    return ResponseEntity.ok(series);
  }
}
