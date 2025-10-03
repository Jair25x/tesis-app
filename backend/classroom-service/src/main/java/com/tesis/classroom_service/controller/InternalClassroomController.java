package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.dto.response.ClassroomBasicDto;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.repository.projection.ClassroomIdNameView;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "Internal", description = "Endpoints internos (optimizados para microservicios)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(value = "/internal/classrooms", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class InternalClassroomController {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;

  private static boolean hasRoleInternal() {
    var auth = org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication();
    if (auth == null)
      return false;
    return auth.getAuthorities().stream()
        .anyMatch(a -> "ROLE_INTERNAL".equalsIgnoreCase(a.getAuthority()));
  }

  /*
   * ======================
   * ENDPOINTS S2S (STRICT)
   * ======================
   */

  /** Devuelve aulas (IDs) del docente indicado por X-Act-As-User. Solo S2S. */
  @Operation(summary = "Mis aulas (IDs) — uso interno S2S con suplantación segura")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/mine")
  public ResponseEntity<List<UUID>> myClassroomsActingAs(
      @RequestHeader(value = "X-Act-As-User", required = true) String actAs) {

    if (!hasRoleInternal()) {
      throw new ForbiddenException("Se requiere rol INTERNAL");
    }
    if (!StringUtils.hasText(actAs)) {
      return ResponseEntity.badRequest().build();
    }

    final UUID teacherId;
    try {
      teacherId = UUID.fromString(actAs);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }

    // Propietario
    List<UUID> owned = classroomRepository.findIdsByOwnerUuid(teacherId);
    // Miembro de (cualquier rol)
    List<UUID> memberOf = memberRepository.findClassroomIdsByUserUuid(teacherId);

    LinkedHashSet<UUID> out = new LinkedHashSet<>(owned);
    out.addAll(memberOf);
    return ResponseEntity.ok(new ArrayList<>(out));
  }

  /** IDs de estudiantes del aula. Solo S2S. */
  @Operation(summary = "IDs de estudiantes del aula — uso interno S2S")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{classroomId}/students/ids")
  public ResponseEntity<List<UUID>> studentIdsInternal(@PathVariable UUID classroomId) {
    if (!hasRoleInternal()) {
      throw new ForbiddenException("Se requiere rol INTERNAL");
    }
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    var list = memberRepository
        .findAllByClassroomIdAndRole(c.getId(), MemberRole.STUDENT)
        .stream().map(ClassroomMember::getUserUuid)
        .toList();

    return ResponseEntity.ok(list);
  }

  /** ¿Es miembro del aula? (200/404). Solo S2S. */
  @Operation(summary = "¿Es miembro del aula? — uso interno S2S")
  @PreAuthorize("hasRole('INTERNAL')")
  @GetMapping("/{classroomId}/members/{userId}/exists")
  public ResponseEntity<Void> isMemberInternal(
      @PathVariable UUID classroomId,
      @PathVariable UUID userId) {
    if (!hasRoleInternal()) {
      throw new ForbiddenException("Se requiere rol INTERNAL");
    }
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean exists = c.getOwnerUuid().equals(userId)
        || memberRepository.existsByClassroomIdAndUserUuid(classroomId, userId);

    return exists ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  /*
   * =====================================================
   * LOOKUP batch (pueden usarlo otros servicios/paneles)
   * =====================================================
   */

  /** GET /lookup?ids=uuid&ids=uuid... */
  @Operation(summary = "Lookup de aulas por ID (id, name) — GET batch")
  @PreAuthorize("hasAnyRole('INTERNAL','TEACHER','ADMIN')")
  @GetMapping("/lookup")
  public ResponseEntity<List<ClassroomBasicDto>> lookupGet(@RequestParam List<UUID> ids) {
    return ResponseEntity.ok(resolveIdName(ids));
  }

  /** POST /lookup body: [uuid, uuid, ...] */
  @Operation(summary = "Lookup de aulas por ID (id, name) — POST batch")
  @PreAuthorize("hasAnyRole('INTERNAL','TEACHER','ADMIN')")
  @PostMapping(path = "/lookup", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<List<ClassroomBasicDto>> lookupPost(@RequestBody List<UUID> ids) {
    return ResponseEntity.ok(resolveIdName(ids));
  }

  private List<ClassroomBasicDto> resolveIdName(List<UUID> ids) {
    if (ids == null || ids.isEmpty())
      return List.of();
    var dedup = ids.stream().filter(Objects::nonNull).distinct().toList();

    List<ClassroomIdNameView> rows = classroomRepository.findIdNameByIdIn(dedup);
    Map<UUID, String> byId = rows.stream()
        .collect(Collectors.toMap(ClassroomIdNameView::getId, ClassroomIdNameView::getName));

    List<ClassroomBasicDto> out = new ArrayList<>();
    for (UUID id : dedup) {
      String nm = byId.get(id);
      if (nm != null)
        out.add(new ClassroomBasicDto(id, nm));
    }
    return out;
  }
}
