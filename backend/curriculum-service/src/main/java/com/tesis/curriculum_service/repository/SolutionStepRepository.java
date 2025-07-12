// src/main/java/com/tesis/curriculum_service/repository/SolutionStepRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.SolutionStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link SolutionStep}.
 * Proporciona CRUD básico y consultas específicas
 * para trabajar con los pasos de solución de un ejercicio.
 */
@Repository
public interface SolutionStepRepository extends JpaRepository<SolutionStep, UUID> {

  /**
   * Recupera todos los pasos de solución de un ejercicio,
   * ordenados ascendentemente por su número de paso.
   *
   * @param exerciseId UUID del ejercicio padre.
   * @return Lista de pasos de solución ordenados.
   */
  List<SolutionStep> findByExerciseIdOrderByStepNumber(UUID exerciseId);

  /**
   * Recupera un paso de solución por su ID y el ID de su ejercicio padre.
   * Esto garantiza que al buscar, validamos que pertenezca al ejercicio correcto.
   *
   * @param id         UUID del paso de solución.
   * @param exerciseId UUID del ejercicio padre.
   * @return Optional con el paso si existe.
   */
  Optional<SolutionStep> findByIdAndExerciseId(UUID id, UUID exerciseId);

  List<SolutionStep> findByExerciseIdOrderByStepNumberAsc(UUID exerciseId);

  Optional<SolutionStep> findIncludingInactiveByIdAndExerciseId(UUID id, UUID exerciseId);
}
