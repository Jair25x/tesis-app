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

  private boolean hasInternalRole() {
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    if (auth == null)
      return false;
    return auth.getAuthorities().stream().anyMatch(a -> "ROLE_INTERNAL".equalsIgnoreCase(a.getAuthority()));
  }

  // Mis aulas (IDs) — soporta suplantación controlada vía X-Act-As-User
  @Operation(summary = "Mis aulas (IDs) — uso interno/batch")
  @PreAuthorize("hasAnyRole('INTERNAL','STUDENT','TEACHER','ADMIN')")
  @GetMapping("/mine")
  public ResponseEntity<List<UUID>> myClassrooms(
      @RequestHeader(value = "X-Act-As-User", required = false) String actAs) {

    UUID principal = SecurityUtils.getCurrentUserIdOrThrow();
    UUID effectiveUser = principal;

    // Solo INTERNAL puede usar suplantación
    if (actAs != null && !actAs.isBlank() && hasInternalRole()) {
      try {
        effectiveUser = UUID.fromString(actAs);
      } catch (Exception ignored) {
        // si viene mal formado, seguimos con el principal
      }
    }

    // Owner de aulas
    List<UUID> owned = classroomRepository.findIdsByOwnerUuid(effectiveUser);
    // Miembro (cualquier rol) en aulas
    List<UUID> memberOf = memberRepository.findClassroomIdsByUserUuid(effectiveUser);

    // Unir y devolver distintos en orden determinista (owner primero)
    LinkedHashSet<UUID> all = new LinkedHashSet<>(owned);
    all.addAll(memberOf);

    return ResponseEntity.ok(new ArrayList<>(all));
  }

  // IDs de estudiantes del aula (sin paginar) — uso interno
  @Operation(summary = "IDs de estudiantes del aula (sin paginar) — uso interno")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN','INTERNAL')")
  @GetMapping("/{classroomId}/students/ids")
  public ResponseEntity<List<UUID>> studentIds(@PathVariable UUID classroomId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean isInternal = hasInternalRole();
    boolean isOwner = c.getOwnerUuid().equals(requester);
    boolean isCoTeacher = memberRepository.existsByClassroomIdAndUserUuidAndRole(c.getId(), requester,
        MemberRole.CO_TEACHER);

    if (!(isInternal || isOwner || isCoTeacher || SecurityUtils.isAdmin())) {
      throw new ForbiddenException("No autorizado");
    }

    var list = memberRepository.findAllByClassroomIdAndRole(classroomId, MemberRole.STUDENT)
        .stream().map(ClassroomMember::getUserUuid).toList();
    return ResponseEntity.ok(list);
  }

  // ¿Es miembro del aula? — uso interno (200/404)
  @Operation(summary = "¿Es miembro del aula? — uso interno")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN','INTERNAL')")
  @GetMapping("/{classroomId}/members/{userId}/exists")
  public ResponseEntity<Void> isMember(@PathVariable UUID classroomId, @PathVariable UUID userId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean isInternal = hasInternalRole();
    boolean isOwner = c.getOwnerUuid().equals(requester);
    boolean isCoTeacher = memberRepository.existsByClassroomIdAndUserUuidAndRole(c.getId(), requester,
        MemberRole.CO_TEACHER);

    if (!(isInternal || isOwner || isCoTeacher || SecurityUtils.isAdmin())) {
      throw new ForbiddenException("No autorizado");
    }

    boolean exists = c.getOwnerUuid().equals(userId)
        || memberRepository.existsByClassroomIdAndUserUuid(classroomId, userId);

    return exists ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  // ===== NUEVO: lookup de nombres =====

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

    // devolver en el mismo orden pedido y sólo existentes
    List<ClassroomBasicDto> out = new ArrayList<>();
    for (UUID id : dedup) {
      String nm = byId.get(id);
      if (nm != null) {
        out.add(new ClassroomBasicDto(id, nm));
      }
    }
    return out;
  }
}
