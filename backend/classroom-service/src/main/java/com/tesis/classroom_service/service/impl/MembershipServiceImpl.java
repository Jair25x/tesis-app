// src/main/java/com/tesis/classroom_service/service/impl/MembershipServiceImpl.java
package com.tesis.classroom_service.service.impl;

import com.tesis.classroom_service.client.ProfileCacheService;
import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.dto.response.PageResponse;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.service.MembershipService;
import com.tesis.classroom_service.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;
  private final ProfileCacheService profileCacheService;

  // ----------------------------------------
  // PRIVADO (roles reales) - OWNER o CO_TEACHER o ADMIN
  // ----------------------------------------
  @Override
  @Transactional(readOnly = true)
  public PageResponse<MemberDto> listMembers(UUID classroomId, UUID requesterUuid,
      int page, int size, String sort, MemberRole role) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    if (!isStaffOrAdmin(c, requesterUuid)) {
      throw new ForbiddenException("No autorizado para ver miembros");
    }

    Pageable pageable = buildPageable(sort, page, size);
    Page<ClassroomMember> pageData = (role == null)
        ? memberRepository.findAllByClassroomId(classroomId, pageable)
        : memberRepository.findAllByClassroomIdAndRole(classroomId, role, pageable);

    Page<MemberDto> mapped = pageData.map(this::toDtoRaw);
    return PageResponse.of(mapped);
  }

  @Override
  @Transactional
  public MemberDto addMember(UUID classroomId, UUID requesterUuid, UUID userUuid, MemberRole role) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));
    if (!isStaffOrAdmin(c, requesterUuid)) {
      throw new ForbiddenException("Sólo OWNER/CO_TEACHER/ADMIN puede agregar miembros");
    }

    if (c.getOwnerUuid().equals(userUuid)) {
      throw new ForbiddenException("El owner ya pertenece al aula");
    }
    if (memberRepository.existsByClassroomIdAndUserUuid(classroomId, userUuid)) {
      throw new com.tesis.classroom_service.exception.ConflictException("El usuario ya es miembro del aula");
    }

    // Regla: CO_TEACHER sólo puede agregar STUDENT. CO_TEACHER requiere
    // OWNER/ADMIN.
    MemberRole toAssign = role == null ? MemberRole.STUDENT : role;
    boolean requesterIsOwnerOrAdmin = isOwner(c, requesterUuid) || SecurityUtils.isAdmin();
    if (toAssign == MemberRole.CO_TEACHER && !requesterIsOwnerOrAdmin) {
      throw new ForbiddenException("Sólo el OWNER o ADMIN puede agregar CO_TEACHER");
    }

    ClassroomMember m = ClassroomMember.builder()
        .classroomId(classroomId)
        .userUuid(userUuid)
        .role(toAssign)
        .joinedAt(LocalDateTime.now())
        .build();

    m = memberRepository.save(m);
    return toDtoRaw(m);
  }

  @Override
  @Transactional
  public void removeMember(UUID classroomId, UUID requesterUuid, UUID userUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    if (!isStaffOrAdmin(c, requesterUuid)) {
      throw new ForbiddenException("Sólo OWNER/CO_TEACHER/ADMIN puede remover miembros");
    }

    if (c.getOwnerUuid().equals(userUuid)) {
      throw new ForbiddenException("No puedes eliminar al OWNER del aula");
    }

    ClassroomMember m = memberRepository.findByClassroomIdAndUserUuid(classroomId, userUuid)
        .orElseThrow(() -> new NotFoundException("El usuario no es miembro del aula"));

    // Regla: remover CO_TEACHER sólo OWNER/ADMIN
    if (m.getRole() == MemberRole.CO_TEACHER && !(isOwner(c, requesterUuid) || SecurityUtils.isAdmin())) {
      throw new ForbiddenException("Sólo el OWNER o ADMIN puede remover a un CO_TEACHER");
    }

    memberRepository.delete(m);
  }

  // ----------------------------------------
  // PÚBLICO (para integrantes) con expand + search
  // ----------------------------------------
  @Override
  @Transactional(readOnly = true)
  public PageResponse<MemberDto> listMembersPublic(UUID classroomId, UUID requesterUuid,
      boolean expandProfile, String search,
      int page, int size, String sort) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean staffOrAdmin = isStaffOrAdmin(c, requesterUuid);
    boolean isMember = staffOrAdmin || memberRepository.existsByClassroomIdAndUserUuid(classroomId, requesterUuid);
    if (!isMember)
      throw new ForbiddenException("No eres miembro del aula");

    Pageable pageable = buildPageable(sort, page, size);

    // Caso 1: SIN search → paginación DB directa
    if (!expandProfile || search == null || search.isBlank()) {
      Page<ClassroomMember> raw = memberRepository.findAllByClassroomId(classroomId, pageable);

      Page<MemberDto> mapped = raw.map(m -> {
        if (staffOrAdmin)
          return toDtoRaw(m);
        // estudiante: ocultar roles salvo OWNER
        MemberRole role = m.getUserUuid().equals(c.getOwnerUuid()) ? MemberRole.OWNER : MemberRole.STUDENT;
        return MemberDto.builder()
            .userUuid(m.getUserUuid())
            .role(role)
            .joinedAt(m.getJoinedAt())
            .build();
      });

      // Enriquecer sólo la página si expand=true
      if (expandProfile && !mapped.isEmpty()) {
        List<UUID> ids = mapped.getContent().stream().map(MemberDto::getUserUuid).toList();
        var profiles = profileCacheService.getProfiles(ids);
        var byId = profiles.stream().collect(Collectors.toMap(p -> p.id(), p -> p));
        mapped.forEach(d -> {
          var p = byId.get(d.getUserUuid());
          if (p != null) {
            d.setFullName(p.displayName());
            d.setAvatarUrl(p.avatarUrl());
          }
        });
      }
      return PageResponse.of(mapped);
    }

    // Caso 2: CON search → filtra por displayName (en mem) y pagina
    List<ClassroomMember> all = memberRepository.findAllByClassroomId(classroomId);
    List<UUID> ids = all.stream().map(ClassroomMember::getUserUuid).toList();
    var profiles = profileCacheService.getProfiles(ids);
    var byId = profiles.stream().collect(Collectors.toMap(p -> p.id(), p -> p));

    String q = search.trim().toLowerCase(Locale.ROOT);
    List<MemberDto> filtered = all.stream().map(m -> {
      MemberDto d;
      if (staffOrAdmin) {
        d = toDtoRaw(m);
      } else {
        MemberRole role = m.getUserUuid().equals(c.getOwnerUuid()) ? MemberRole.OWNER : MemberRole.STUDENT;
        d = MemberDto.builder()
            .userUuid(m.getUserUuid())
            .role(role)
            .joinedAt(m.getJoinedAt())
            .build();
      }
      var p = byId.get(m.getUserUuid());
      if (p != null) {
        d.setFullName(p.displayName());
        d.setAvatarUrl(p.avatarUrl());
      }
      return d;
    }).filter(d -> {
      String name = Optional.ofNullable(d.getFullName()).orElse("").toLowerCase(Locale.ROOT);
      return name.contains(q);
    }).collect(Collectors.toList());

    // Ordenar según sort
    Comparator<MemberDto> cmp = buildComparator(sort);
    if (cmp != null)
      filtered.sort(cmp);

    // Slice manual
    int from = Math.min(page * size, filtered.size());
    int to = Math.min(from + size, filtered.size());
    List<MemberDto> slice = filtered.subList(from, to);

    int totalPages = (int) Math.ceil(filtered.size() / (double) size);
    return PageResponse.<MemberDto>builder()
        .content(slice)
        .page(page)
        .size(size)
        .totalElements(filtered.size())
        .totalPages(totalPages)
        .last(page + 1 >= totalPages)
        .build();
  }

  // ----------------- helpers -----------------
  private boolean isOwner(Classroom c, UUID user) {
    return c.getOwnerUuid().equals(user);
  }

  private boolean isCoTeacher(Classroom c, UUID user) {
    return memberRepository.existsByClassroomIdAndUserUuidAndRole(c.getId(), user, MemberRole.CO_TEACHER);
  }

  private boolean isStaffOrAdmin(Classroom c, UUID user) {
    return isOwner(c, user) || isCoTeacher(c, user) || SecurityUtils.isAdmin();
  }

  private void ensureStaffOrAdmin(Classroom c, UUID user) {
    if (!isStaffOrAdmin(c, user)) {
      throw new ForbiddenException("Sólo OWNER/CO_TEACHER/ADMIN puede administrar miembros");
    }
  }

  private Pageable buildPageable(String sort, int page, int size) {
    Sort s;
    if (sort != null && sort.contains(",")) {
      String[] parts = sort.split(",", 2);
      String prop = parts[0].trim();
      String dir = parts[1].trim().equalsIgnoreCase("desc") ? "desc" : "asc";
      s = dir.equals("desc") ? Sort.by(prop).descending() : Sort.by(prop).ascending();
    } else {
      s = Sort.by("joinedAt").descending();
    }
    return PageRequest.of(page, size, s);
  }

  private Comparator<MemberDto> buildComparator(String sort) {
    if (sort == null)
      return null;
    String[] parts = sort.split(",", 2);
    String prop = parts[0].trim();
    boolean desc = parts.length > 1 && parts[1].trim().equalsIgnoreCase("desc");

    Comparator<MemberDto> cmp = switch (prop) {
      case "joinedAt" -> Comparator.comparing(MemberDto::getJoinedAt, Comparator.nullsLast(Comparator.naturalOrder()));
      case "fullName" -> Comparator.comparing(d -> Optional.ofNullable(d.getFullName()).orElse(""),
          String.CASE_INSENSITIVE_ORDER);
      default -> null;
    };
    if (cmp != null && desc)
      cmp = cmp.reversed();
    return cmp;
  }

  private MemberDto toDtoRaw(ClassroomMember m) {
    return MemberDto.builder()
        .userUuid(m.getUserUuid())
        .role(m.getRole())
        .joinedAt(m.getJoinedAt())
        .fullName(null)
        .avatarUrl(null)
        .build();
  }
}
