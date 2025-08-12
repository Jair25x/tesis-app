// src/main/java/com/tesis/curriculum_service/repository/CurriculumRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Curriculum;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, UUID> {

  /** Trae toda la jerarquía en un solo query (JOIN FETCH) */
  @EntityGraph(attributePaths = {
      "competencies",
      "competencies.standards",
      "competencies.standards.learningObjectives",
      "competencies.standards.learningObjectives.exercises"
  })
  Optional<Curriculum> findFullById(UUID id);

  /*
   * ===== Helpers que bypass-ean @SQLRestriction (ACTIVE=TRUE) con nativos =====
   */

  /** Verifica existencia por code SIN filtrar por active (evita doble seed). */
  @Query(value = "select exists(select 1 from curricula where code = :code)", nativeQuery = true)
  boolean existsByCodeIncludingInactive(@Param("code") String code);

  /** Obtiene un currículo por code SIN filtrar por active. */
  @Query(value = "select * from curricula where code = :code limit 1", nativeQuery = true)
  Optional<Curriculum> findIncludingInactiveByCode(@Param("code") String code);

  /** Obtiene por id SIN filtrar por active. */
  @Query(value = "select * from curricula where id = :id", nativeQuery = true)
  Optional<Curriculum> findIncludingInactiveById(@Param("id") UUID id);

  /** Listados “raw” si los necesitas para herramientas. */
  @Query(value = "select * from curricula", nativeQuery = true)
  List<Curriculum> findAllIncludingInactive();

  @Query(value = "select * from curricula where active = true", nativeQuery = true)
  List<Curriculum> findAllActive();

  @Query(value = "select * from curricula where active = false", nativeQuery = true)
  List<Curriculum> findAllInactive();
}
