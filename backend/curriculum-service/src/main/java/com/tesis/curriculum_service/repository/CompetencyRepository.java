// src/main/java/com/tesis/curriculum_service/repository/CompetencyRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Competency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link Competency}.
 * Implementado exclusivamente con native queries para evitar conflictos con
 * soft delete.
 */
@Repository
public interface CompetencyRepository extends JpaRepository<Competency, UUID> {

  /**
   * Recupera todas las competencias (activos e inactivos) de un currículo.
   */
  @Query(value = """
        SELECT * FROM competencies
         WHERE curriculum_id = :curriculumId
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Competency> findAllByCurriculumId(@Param("curriculumId") UUID curriculumId);

  /**
   * Recupera todas las competencias activas de un currículo.
   */
  @Query(value = """
        SELECT * FROM competencies
         WHERE curriculum_id = :curriculumId
           AND active = true
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Competency> findActiveByCurriculumId(@Param("curriculumId") UUID curriculumId);

  /**
   * Recupera todas las competencias inactivas de un currículo.
   */
  @Query(value = """
        SELECT * FROM competencies
         WHERE curriculum_id = :curriculumId
           AND active = false
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Competency> findInactiveByCurriculumId(@Param("curriculumId") UUID curriculumId);

  /**
   * Recupera una competencia específica (activa o no) por ID y curriculumId.
   */
  @Query(value = """
        SELECT * FROM competencies
         WHERE id = :id
           AND curriculum_id = :curriculumId
      """, nativeQuery = true)
  Optional<Competency> findIncludingInactiveByIdAndCurriculumId(
      @Param("id") UUID id,
      @Param("curriculumId") UUID curriculumId);

  /**
   * Recupera una competencia activa por ID y curriculumId.
   */
  @Query(value = """
        SELECT * FROM competencies
         WHERE id = :id
           AND curriculum_id = :curriculumId
           AND active = true
      """, nativeQuery = true)
  Optional<Competency> findActiveByIdAndCurriculumId(
      @Param("id") UUID id,
      @Param("curriculumId") UUID curriculumId);

}
