package com.tesis.classroom_service.service.impl;

import com.tesis.classroom_service.dto.response.MemberDto;
import com.tesis.classroom_service.exception.ConflictException;
import com.tesis.classroom_service.exception.ForbiddenException;
import com.tesis.classroom_service.exception.NotFoundException;
import com.tesis.classroom_service.model.Classroom;
import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import com.tesis.classroom_service.repository.ClassroomMemberRepository;
import com.tesis.classroom_service.repository.ClassroomRepository;
import com.tesis.classroom_service.service.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService {

  private final ClassroomRepository classroomRepository;
  private final ClassroomMemberRepository memberRepository;

  @Override
  @Transactional(readOnly = true)
  public List<MemberDto> listMembers(UUID classroomId, UUID requesterUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    // Sólo owner (y eventualmente CO_TEACHER si decides) puede ver miembros.
    if (!c.getOwnerUuid().equals(requesterUuid) && !com.tesis.classroom_service.util.SecurityUtils.isAdmin()) {
      throw new ForbiddenException("No autorizado para ver miembros");
    }

    return memberRepository.findAllByClassroomId(classroomId).stream()
        .map(m -> MemberDto.builder()
            .userUuid(m.getUserUuid())
            .role(m.getRole())
            .joinedAt(m.getJoinedAt())
            .build())
        .toList();
  }

  @Override
  @Transactional
  public MemberDto addMember(UUID classroomId, UUID ownerUuid, UUID userUuid, MemberRole role) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    ensureOwner(c, ownerUuid);

    if (memberRepository.existsByClassroomIdAndUserUuid(classroomId, userUuid)) {
      throw new ConflictException("El usuario ya es miembro del aula");
    }

    ClassroomMember m = ClassroomMember.builder()
        .classroomId(classroomId)
        .userUuid(userUuid)
        .role(role == null ? MemberRole.STUDENT : role)
        .joinedAt(LocalDateTime.now())
        .build();

    m = memberRepository.save(m);

    return MemberDto.builder()
        .userUuid(m.getUserUuid())
        .role(m.getRole())
        .joinedAt(m.getJoinedAt())
        .build();
  }

  @Override
  @Transactional
  public void removeMember(UUID classroomId, UUID ownerUuid, UUID userUuid) {
    Classroom c = classroomRepository.findById(classroomId)
        .orElseThrow(() -> new NotFoundException("Aula no encontrada"));

    ensureOwner(c, ownerUuid);

    ClassroomMember m = memberRepository.findByClassroomIdAndUserUuid(classroomId, userUuid)
        .orElseThrow(() -> new NotFoundException("El usuario no es miembro del aula"));

    memberRepository.delete(m);
  }

  private void ensureOwner(Classroom c, UUID ownerUuid) {
    if (!c.getOwnerUuid().equals(ownerUuid) && !com.tesis.classroom_service.util.SecurityUtils.isAdmin()) {
      throw new ForbiddenException("Sólo el owner o ADMIN puede administrar miembros");
    }
  }
}
