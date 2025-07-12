package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.LearningObjective;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link LearningObjective}.
 * Proporciona métodos CRUD básicos y consultas específicas
 * dentro del contexto de un estándar.
 */
@Repository
public interface LearningObjectiveRepository extends JpaRepository<LearningObjective, UUID> {

  /**
   * Busca todos los objetivos activos que pertenecen a un estándar dado.
   *
   * @param standardId UUID del estándar padre
   * @return Lista de objetivos activos
   */
  List<LearningObjective> findByStandardId(UUID standardId);

  /**
   * Busca un objetivo activo por su ID y el ID de su estándar padre.
   *
   * @param id         UUID del objetivo
   * @param standardId UUID del estándar padre
   * @return Optional con el objetivo si existe y está activo
   */
  Optional<LearningObjective> findByIdAndStandardId(UUID id, UUID standardId);

  /**
   * Incluye inactivos: busca todos los objetivos (active=true o false)
   * de un estándar dado.
   *
   * @param standardId UUID del estándar padre
   * @return Lista de todos los objetivos, incluidos los lógicamente borrados
   */
  @Query("SELECT lo FROM LearningObjective lo WHERE lo.standard.id = :standardId")
  List<LearningObjective> findIncludingInactiveByStandardId(UUID standardId);

  /**
   * Incluye inactivos: busca un objetivo por su ID y estándar, sin filtrar
   * por active.
   *
   * @param id         UUID del objetivo
   * @param standardId UUID del estándar padre
   * @return Optional con el objetivo aunque esté lógicamente borrado
   */
  @Query("SELECT lo FROM LearningObjective lo WHERE lo.id = :id AND lo.standard.id = :standardId")
  Optional<LearningObjective> findIncludingInactiveByIdAndStandardId(UUID id, UUID standardId);

}
