package com.tesis.classroom_service.repository;

import com.tesis.classroom_service.model.ClassroomMember;
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
}
