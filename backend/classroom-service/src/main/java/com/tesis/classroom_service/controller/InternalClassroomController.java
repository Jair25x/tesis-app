package com.tesis.classroom_service.controller;

import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

  // NUEVO: lista de aulas (IDs) del principal (owner, co-teacher o student)
  @Operation(summary = "Mis aulas (IDs) — uso interno/batch")
  @PreAuthorize("hasAnyRole('INTERNAL','STUDENT','TEACHER','ADMIN')")
  @GetMapping("/mine")
  public ResponseEntity<List<UUID>> myClassrooms() {
    UUID principal = SecurityUtils.getCurrentUserIdOrThrow();

    // Owner de aulas
    List<UUID> owned = classroomRepository.findIdsByOwnerUuid(principal);

    // Miembro (cualquier rol) en aulas
    List<UUID> memberOf = memberRepository.findClassroomIdsByUserUuid(principal);

    // Unimos y devolvemos distintos en orden determinista (owner primero)
    LinkedHashSet<UUID> all = new LinkedHashSet<>(owned);
    all.addAll(memberOf);

    return ResponseEntity.ok(new ArrayList<>(all));
  }

  // Devuelve SOLO IDs de STUDENT, sin paginar
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

  // Verifica si un user es miembro (200/404)
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
}
