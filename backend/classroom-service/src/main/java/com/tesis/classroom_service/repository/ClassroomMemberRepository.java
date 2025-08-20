package com.tesis.classroom_service.repository;

import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClassroomMemberRepository extends JpaRepository<ClassroomMember, UUID> {

  int countByClassroomId(UUID classroomId);

  boolean existsByClassroomIdAndUserUuid(UUID classroomId, UUID userUuid);

  List<ClassroomMember> findAllByClassroomId(UUID classroomId);

  List<ClassroomMember> findAllByUserUuid(UUID userUuid);

  Optional<ClassroomMember> findByClassroomIdAndUserUuid(UUID classroomId, UUID userUuid);

  // NUEVO: paginado
  Page<ClassroomMember> findAllByClassroomId(UUID classroomId, Pageable pageable);

  // NUEVO: por rol + paginado (para /members)
  Page<ClassroomMember> findAllByClassroomIdAndRole(UUID classroomId, MemberRole role, Pageable pageable);

  boolean existsByClassroomIdAndUserUuidAndRole(UUID classroomId, UUID userUuid, MemberRole role);
}
