package com.tesis.classroom_service.repository;

import com.tesis.classroom_service.model.ClassroomMember;
import com.tesis.classroom_service.model.enums.MemberRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de membresías de aulas.
 *
 * NOTA IMPORTANTE:
 * La entidad ClassroomMember NO tiene relación @ManyToOne "classroom".
 * En su lugar almacena el UUID en el campo "classroomId".
 * Por eso, cuando quieras seleccionar IDs de aulas, usa "cm.classroomId"
 * y NO "cm.classroom.id".
 */
@Repository
public interface ClassroomMemberRepository extends JpaRepository<ClassroomMember, UUID> {

  /** Total de miembros en un aula. Útil para métricas o límites. */
  int countByClassroomId(UUID classroomId);

  /** ¿Existe una membresía (cualquier rol) para el par (classroom, user)? */
  boolean existsByClassroomIdAndUserUuid(UUID classroomId, UUID userUuid);

  /** Todas las membresías (cualquier rol) de un aula. */
  List<ClassroomMember> findAllByClassroomId(UUID classroomId);

  /** Todas las membresías (cualquier rol) de un usuario. */
  List<ClassroomMember> findAllByUserUuid(UUID userUuid);

  /** Membresía específica (si existe) de un usuario en un aula. */
  Optional<ClassroomMember> findByClassroomIdAndUserUuid(UUID classroomId, UUID userUuid);

  /** Paginado: todas las membresías de un aula. */
  Page<ClassroomMember> findAllByClassroomId(UUID classroomId, Pageable pageable);

  /** Paginado: todas las membresías de un aula filtradas por rol. */
  Page<ClassroomMember> findAllByClassroomIdAndRole(UUID classroomId, MemberRole role, Pageable pageable);

  /**
   * ¿Existe una membresía con rol específico? Útil para comprobar
   * co-teachers/estudiantes.
   */
  boolean existsByClassroomIdAndUserUuidAndRole(UUID classroomId, UUID userUuid, MemberRole role);

  /** Listado simple por rol (sin paginar). */
  List<ClassroomMember> findAllByClassroomIdAndRole(UUID classroomId, MemberRole role);

  /**
   * IDs de aulas en las que el usuario participa como miembro (cualquier rol).
   * OJO: Selecciona el campo "classroomId" directamente porque la entidad no
   * tiene relación @ManyToOne.
   */
  @Query("select cm.classroomId from ClassroomMember cm where cm.userUuid = :user")
  List<UUID> findClassroomIdsByUserUuid(@Param("user") UUID userUuid);
}
