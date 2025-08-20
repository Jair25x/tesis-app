// src/main/java/com/tesis/classroom_service/service/impl/ClassroomServiceImpl.java
package com.tesis.classroom_service.service.impl;

import com.tesis.classroom_service.dto.request.CreateClassroomRequest;
import com.tesis.classroom_service.dto.request.UpdateClassroomRequest;
import com.tesis.classroom_service.dto.response.ClassroomDetailDto;
import com.tesis.classroom_service.dto.response.ClassroomSummaryDto;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassroomServiceImpl implements ClassroomService {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;

  // -------------------------
  // Commands
  // -------------------------

  @Override
  @Transactional
  public ClassroomDetailDto create(UUID ownerUuid, CreateClassroomRequest req) {
    Classroom c = Classroom.builder()
        .ownerUuid(ownerUuid)
        .name(req.getName())
        .description(req.getDescription())
        .grade(req.getGrade())
        .subject(req.getSubject())
        .active(true)
        .build();

    c = classroomRepository.save(c);

    // ⬇️ Inserta fila del OWNER como miembro formal del aula
    if (!memberRepository.existsByClassroomIdAndUserUuid(c.getId(), ownerUuid)) {
      ClassroomMember owner = ClassroomMember.builder()
          .classroomId(c.getId())
          .userUuid(ownerUuid)
          .role(MemberRole.OWNER)
          .joinedAt(LocalDateTime.now())
          .build();
      memberRepository.save(owner);
    }

    return toDetailDto(c);
  }

  @Override
  @Transactional
  public ClassroomDetailDto update(UUID classroomId, UUID ownerUuid, UpdateClassroomRequest req) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    ensureOwner(c, ownerUuid);

    if (req.getName() != null)
      c.setName(req.getName());
    if (req.getDescription() != null)
      c.setDescription(req.getDescription());
    if (req.getGrade() != null)
      c.setGrade(req.getGrade());
    if (req.getSubject() != null)
      c.setSubject(req.getSubject());
    if (req.getActive() != null)
      c.setActive(req.getActive());

    classroomRepository.save(c);
    return toDetailDto(c);
  }

  @Override
  @Transactional
  public void delete(UUID classroomId, UUID ownerUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));
    ensureOwner(c, ownerUuid);

    c.setActive(false); // soft delete
    classroomRepository.save(c);
  }

  // -------------------------
  // Queries
  // -------------------------

  @Override
  @Transactional(readOnly = true)
  public ClassroomDetailDto getDetail(UUID classroomId, UUID requesterUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    boolean isOwner = c.getOwnerUuid().equals(requesterUuid);
    boolean isMember = memberRepository.existsByClassroomIdAndUserUuid(classroomId, requesterUuid);

    if (!isOwner && !isMember) {
      throw new ForbiddenException("No tienes acceso a este classroom");
    }
    return toDetailDto(c);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ClassroomSummaryDto> listMine(UUID ownerUuid) {
    return classroomRepository.findByOwnerUuid(ownerUuid).stream()
        .sorted(Comparator.comparing(Classroom::getCreatedAt).reversed())
        .map(c -> toSummaryDto(c, memberRepository.countByClassroomId(c.getId())))
        .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public List<ClassroomSummaryDto> listEnrolled(UUID studentUuid) {
    return memberRepository.findAllByUserUuid(studentUuid).stream()
        .map(ClassroomMember::getClassroomId)
        .distinct()
        .map(id -> classroomRepository.findById(id).orElse(null))
        .filter(c -> c != null && Boolean.TRUE.equals(c.getActive()))
        .sorted(Comparator.comparing(Classroom::getCreatedAt).reversed())
        .map(c -> toSummaryDto(c, memberRepository.countByClassroomId(c.getId())))
        .toList();
  }

  // -------------------------
  // Helpers
  // -------------------------

  private void ensureOwner(Classroom c, UUID ownerUuid) {
    if (!c.getOwnerUuid().equals(ownerUuid) && !com.tesis.classroom_service.util.SecurityUtils.isAdmin()) {
      throw new com.tesis.classroom_service.exception.ForbiddenException(
          "Sólo el owner o ADMIN puede realizar esta acción");
    }
  }

  private ClassroomDetailDto toDetailDto(Classroom c) {
    return ClassroomDetailDto.builder()
        .id(c.getId())
        .ownerUuid(c.getOwnerUuid())
        .name(c.getName())
        .description(c.getDescription())
        .grade(c.getGrade())
        .subject(c.getSubject())
        .active(Boolean.TRUE.equals(c.getActive()))
        .createdAt(c.getCreatedAt())
        .updatedAt(c.getUpdatedAt())
        .build();
  }

  private ClassroomSummaryDto toSummaryDto(Classroom c, int membersCount) {
    return ClassroomSummaryDto.builder()
        .id(c.getId())
        .name(c.getName())
        .description(c.getDescription())
        .grade(c.getGrade())
        .subject(c.getSubject())
        .membersCount(membersCount) // incluye OWNER, co-teachers y students
        .active(Boolean.TRUE.equals(c.getActive()))
        .build();
  }
}
