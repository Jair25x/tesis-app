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
 * Proporciona métodos CRUD básicos y consultas
 * específicas para trabajar con competencias dentro de un currículo.
 */
@Repository
public interface CompetencyRepository extends JpaRepository<Competency, UUID> {

  /**
   * Recupera todas las competencias pertenecientes a un currículo dado.
   *
   * @param curriculumId UUID del currículo padre
   * @return Lista de competencias asociadas al currículo
   */
  List<Competency> findByCurriculumId(UUID curriculumId);

  /**
   * Recupera una competencia por su ID y el ID de su currículo padre.
   * Esto garantiza que al buscar por competencia también validamos
   * que pertenezca al currículo correcto.
   *
   * @param id           UUID de la competencia
   * @param curriculumId UUID del currículo padre
   * @return Optional con la competencia si existe y pertenece al currículo
   */
  Optional<Competency> findByIdAndCurriculumId(UUID id, UUID curriculumId);

  /**
   * Trae incluso los soft-deleted (active=false) para poder reactivar.
   */
  @Query("""
        SELECT c
          FROM Competency c
         WHERE c.id = :id
           AND c.curriculum.id = :curriculumId
      """)
  Optional<Competency> findIncludingInactiveByIdAndCurriculumId(
      @Param("id") UUID id,
      @Param("curriculumId") UUID curriculumId);
}
