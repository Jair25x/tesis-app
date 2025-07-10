package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Curriculum; // Importa la entidad Curriculum
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository; // Importa la anotación @Repository

import java.util.List;
import java.util.Optional; // Importa Optional para métodos que pueden devolver nulo
import java.util.UUID; // Importa UUID, el tipo de la clave primaria de Curriculum

/**
 * Interfaz de repositorio para la entidad {@link Curriculum}.
 * Extiende {@link JpaRepository} para heredar métodos CRUD estándar
 * y funcionalidades de paginación/ordenación.
 * Permite la interacción con la tabla 'curricula' en la base de datos.
 */
@Repository // Indica a Spring que esta interfaz es un componente de repositorio y debe ser
            // gestionada.
public interface CurriculumRepository extends JpaRepository<Curriculum, UUID> {

  /**
   * Busca un currículo por su nombre, ignorando mayúsculas y minúsculas.
   * Útil para asegurar la unicidad o para búsquedas flexibles.
   * 
   * @param name El nombre del currículo a buscar.
   * @return Un {@link Optional} que contiene el currículo si se encuentra, o
   *         vacío si no.
   */
  Optional<Curriculum> findByNameIgnoreCase(String name);

  /**
   * Busca un currículo por su código único.
   * 
   * @param code El código del currículo a buscar.
   * @return Un {@link Optional} que contiene el currículo si se encuentra, o
   *         vacío si no.
   */
  Optional<Curriculum> findByCode(String code);

  /**
   * Verifica si existe un currículo con un nombre específico.
   * 
   * @param name El nombre del currículo a verificar.
   * @return true si existe un currículo con ese nombre, false en caso contrario.
   */
  boolean existsByName(String name);

  /**
   * Verifica si existe un currículo con un código específico.
   * 
   * @param code El código del currículo a verificar.
   * @return true si existe un currículo con ese código, false en caso contrario.
   */
  boolean existsByCode(String code);

  /**
   * Busca currículos cuyo nombre o descripción contengan la cadena de búsqueda,
   * ignorando mayúsculas y minúsculas.
   * Puede ser útil para funcionalidades de búsqueda en el frontend.
   * 
   * @param nameKeyword        Palabra clave a buscar en el nombre.
   * @param descriptionKeyword Palabra clave a buscar en la descripción.
   * @return Una lista de currículos que coinciden con los criterios de búsqueda.
   */
  // Puedes comentar o dejar esta si la búsqueda es muy general.
  List<Curriculum> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String nameKeyword,
      String descriptionKeyword);

  List<Curriculum> findByGrade(String grade);

  @Query(value = "SELECT * FROM curricula WHERE id = :id", nativeQuery = true)
  Optional<Curriculum> findByIdIncludingInactive(@Param("id") UUID id);
}
