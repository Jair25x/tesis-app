package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Standard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link Standard}.
 * Proporciona métodos CRUD básicos y consultas
 * específicas para trabajar con estándares dentro de una competencia.
 */
@Repository
public interface StandardRepository extends JpaRepository<Standard, UUID> {

  /**
   * Estándares activos por competencia.
   */
  @Query(value = """
        SELECT * FROM standards
         WHERE competency_id = :competencyId
           AND active = true
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Standard> findActiveByCompetencyId(@Param("competencyId") UUID competencyId);

  /**
   * Estándares inactivos por competencia.
   */
  @Query(value = """
        SELECT * FROM standards
         WHERE competency_id = :competencyId
           AND active = false
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Standard> findInactiveByCompetencyId(@Param("competencyId") UUID competencyId);

  /**
   * Todos los estándares (activos e inactivos) por competencia.
   */
  @Query(value = """
        SELECT * FROM standards
         WHERE competency_id = :competencyId
         ORDER BY created_at DESC
      """, nativeQuery = true)
  List<Standard> findAllByCompetencyIdNative(@Param("competencyId") UUID competencyId);

  /**
   * Recupera un estándar activo por ID y competencia.
   */
  Optional<Standard> findByIdAndCompetencyId(UUID id, UUID competencyId);

  /**
   * Recupera un estándar por ID y competencia (activo o inactivo).
   */
  @Query(value = """
        SELECT * FROM standards
         WHERE id = :id
           AND competency_id = :competencyId
      """, nativeQuery = true)
  Optional<Standard> findIncludingInactiveByIdAndCompetencyId(
      @Param("id") UUID id,
      @Param("competencyId") UUID competencyId);
}
