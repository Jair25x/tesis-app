package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.LearningObjective; // Importa la entidad LearningObjective
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.stereotype.Repository; // Importa la anotación @Repository

import java.util.List; // Para métodos que devuelven listas
import java.util.Optional; // Para métodos que pueden devolver nulo
import java.util.UUID; // Importa UUID, el tipo de la clave primaria de LearningObjective

/**
 * Interfaz de repositorio para la entidad {@link LearningObjective}.
 * Extiende {@link JpaRepository} para heredar métodos CRUD estándar
 * y funcionalidades de paginación/ordenación.
 * Permite la interacción con la tabla 'learning_objectives' en la base de
 * datos.
 */
@Repository // Indica a Spring que esta interfaz es un componente de repositorio y debe ser
            // gestionada.
public interface LearningObjectiveRepository extends JpaRepository<LearningObjective, UUID> {

  /**
   * Busca un objetivo de aprendizaje por su nombre, ignorando mayúsculas y
   * minúsculas.
   * Útil para búsquedas flexibles o validaciones.
   * 
   * @param name El nombre del objetivo de aprendizaje a buscar.
   * @return Un {@link Optional} que contiene el objetivo si se encuentra, o vacío
   *         si no.
   */
  Optional<LearningObjective> findByNameIgnoreCase(String name);

  /**
   * Busca un objetivo de aprendizaje por su código único.
   * 
   * @param code El código del objetivo de aprendizaje a buscar.
   * @return Un {@link Optional} que contiene el objetivo si se encuentra, o vacío
   *         si no.
   */
  Optional<LearningObjective> findByCode(String code);

  /**
   * Verifica si existe un objetivo de aprendizaje con un nombre específico.
   * 
   * @param name El nombre del objetivo de aprendizaje a verificar.
   * @return true si existe un objetivo con ese nombre, false en caso contrario.
   */
  boolean existsByName(String name);

  /**
   * Verifica si existe un objetivo de aprendizaje con un código específico.
   * 
   * @param code El código del objetivo de aprendizaje a verificar.
   * @return true si existe un objetivo con ese código, false en caso contrario.
   */
  boolean existsByCode(String code);

  /**
   * Busca todos los objetivos de aprendizaje que pertenecen a un estándar
   * específico.
   * 
   * @param standardId El UUID del estándar padre.
   * @return Una {@link List} de objetivos de aprendizaje asociados al estándar
   *         dado.
   */
  List<LearningObjective> findAllByStandardId(UUID standardId);

  /**
   * Busca un objetivo de aprendizaje específico por su ID y el ID del estándar al
   * que pertenece.
   * Útil para asegurar que un objetivo de aprendizaje se obtenga dentro del
   * contexto de un estándar específico.
   * 
   * @param id         El UUID del objetivo de aprendizaje.
   * @param standardId El UUID del estándar padre.
   * @return Un {@link Optional} que contiene el objetivo si se encuentra y
   *         pertenece al estándar, o vacío si no.
   */
  Optional<LearningObjective> findByIdAndStandardId(UUID id, UUID standardId);
}
