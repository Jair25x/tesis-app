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
   * Recupera todos los estándares asociados a una competencia dada.
   *
   * @param competencyId UUID de la competencia padre.
   * @return Lista de estándares que pertenecen a dicha competencia.
   */
  List<Standard> findByCompetencyId(UUID competencyId);

  /**
   * Recupera un estándar por su ID y el ID de la competencia a la que pertenece.
   * Esto garantiza que al buscar por estándar también validamos
   * que efectivamente forme parte de la competencia indicada.
   *
   * @param id           UUID del estándar.
   * @param competencyId UUID de la competencia padre.
   * @return Optional con el estándar si existe y pertenece a la competencia.
   */
  Optional<Standard> findByIdAndCompetencyId(UUID id, UUID competencyId);

  @Query("SELECT s FROM Standard s WHERE s.competency.id = :competencyId")
  List<Standard> findIncludingInactiveByCompetencyId(@Param("competencyId") UUID competencyId);

  @Query("SELECT s FROM Standard s WHERE s.id = :id AND s.competency.id = :competencyId")
  Optional<Standard> findIncludingInactiveByIdAndCompetencyId(
      @Param("id") UUID id,
      @Param("competencyId") UUID competencyId);
}
