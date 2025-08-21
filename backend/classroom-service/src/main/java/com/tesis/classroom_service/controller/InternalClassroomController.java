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

import java.util.List;
import java.util.UUID;

@Tag(name = "Internal", description = "Endpoints internos (optimizados para microservicios)")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping(value = "/internal/classrooms", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class InternalClassroomController {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;

  // Devuelve SOLO IDs de STUDENT, sin paginar
  @Operation(summary = "IDs de estudiantes del aula (sin paginar) — uso interno")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')") // el Bearer del docente es requerido igualmente
  @GetMapping("/{classroomId}/students/ids")
  public ResponseEntity<List<UUID>> studentIds(@PathVariable UUID classroomId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean isOwner = c.getOwnerUuid().equals(requester);
    boolean isCoTeacher = memberRepository.existsByClassroomIdAndUserUuidAndRole(c.getId(), requester,
        MemberRole.CO_TEACHER);
    if (!(isOwner || isCoTeacher || SecurityUtils.isAdmin())) {
      throw new ForbiddenException("No autorizado");
    }

    var list = memberRepository.findAllByClassroomIdAndRole(classroomId, MemberRole.STUDENT)
        .stream().map(ClassroomMember::getUserUuid).toList();
    return ResponseEntity.ok(list);
  }

  // Verifica si un user es miembro (200/404)
  @Operation(summary = "¿Es miembro del aula? — uso interno")
  @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
  @GetMapping("/{classroomId}/members/{userId}/exists")
  public ResponseEntity<Void> isMember(
      @PathVariable UUID classroomId,
      @PathVariable UUID userId) {
    UUID requester = SecurityUtils.getCurrentUserIdOrThrow();
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean isOwner = c.getOwnerUuid().equals(requester);
    boolean isCoTeacher = memberRepository.existsByClassroomIdAndUserUuidAndRole(c.getId(), requester,
        MemberRole.CO_TEACHER);
    if (!(isOwner || isCoTeacher || SecurityUtils.isAdmin())) {
      throw new ForbiddenException("No autorizado");
    }

    boolean exists = c.getOwnerUuid().equals(userId)
        || memberRepository.existsByClassroomIdAndUserUuid(classroomId, userId);

    return exists ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }
}
