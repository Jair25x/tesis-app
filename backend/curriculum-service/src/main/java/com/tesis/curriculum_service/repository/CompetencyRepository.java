package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Competency; // Importa la entidad Competency
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository; // Importa la anotación @Repository

import java.util.List; // Para métodos que devuelven listas
import java.util.Optional; // Para métodos que pueden devolver nulo
import java.util.UUID; // Importa UUID, el tipo de la clave primaria de Competency

/**
 * Interfaz de repositorio para la entidad {@link Competency}.
 * Extiende {@link JpaRepository} para heredar métodos CRUD estándar
 * y funcionalidades de paginación/ordenación.
 * Permite la interacción con la tabla 'competencies' en la base de datos.
 */
@Repository // Indica a Spring que esta interfaz es un componente de repositorio y debe ser
            // gestionada.
public interface CompetencyRepository extends JpaRepository<Competency, UUID> {

  /**
   * Busca una competencia por su nombre, ignorando mayúsculas y minúsculas.
   * Útil para asegurar la unicidad o para búsquedas flexibles.
   * 
   * @param name El nombre de la competencia a buscar.
   * @return Un {@link Optional} que contiene la competencia si se encuentra, o
   *         vacío si no.
   */
  Optional<Competency> findByNameIgnoreCase(String name);

  /**
   * Busca una competencia por su código único.
   * 
   * @param code El código de la competencia a buscar.
   * @return Un {@link Optional} que contiene la competencia si se encuentra, o
   *         vacío si no.
   */
  Optional<Competency> findByCode(String code);

  /**
   * Verifica si existe una competencia con un nombre específico.
   * 
   * @param name El nombre de la competencia a verificar.
   * @return true si existe una competencia con ese nombre, false en caso
   *         contrario.
   */
  boolean existsByName(String name);

  /**
   * Verifica si existe una competencia con un código específico.
   * 
   * @param code El código de la competencia a verificar.
   * @return true si existe una competencia con ese código, false en caso
   *         contrario.
   */
  boolean existsByCode(String code);

  /**
   * Busca todas las competencias que pertenecen a un currículo específico.
   * 
   * @param curriculumId El UUID del currículo padre.
   * @return Una {@link List} de competencias asociadas al currículo dado.
   */
  List<Competency> findAllByCurriculumId(UUID curriculumId);

  /**
   * Busca una competencia específica por su ID y el ID del currículo al que
   * pertenece.
   * Útil para asegurar que una competencia se obtenga dentro del contexto de un
   * currículo específico.
   * 
   * @param id           El UUID de la competencia.
   * @param curriculumId El UUID del currículo padre.
   * @return Un {@link Optional} que contiene la competencia si se encuentra y
   *         pertenece al currículo, o vacío si no.
   */
  Optional<Competency> findByIdAndCurriculumId(UUID id, UUID curriculumId);

  List<Competency> findByCurriculumId(UUID curriculumId); // Este método ya considera `@Where`

  @Query(value = "SELECT * FROM competencies WHERE id = ?1", nativeQuery = true) // O una JPQL que ignore el filtro
                                                                                 // @Where
  Optional<Competency> findByIdIncludingInactive(UUID id);
}
