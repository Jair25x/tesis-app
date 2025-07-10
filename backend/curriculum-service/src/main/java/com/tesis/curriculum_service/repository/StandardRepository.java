package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Standard; // Importa la entidad Standard
import org.springframework.data.jpa.repository.JpaRepository; // Importa JpaRepository
import org.springframework.stereotype.Repository; // Importa la anotación @Repository

import java.util.List; // Para métodos que devuelven listas
import java.util.Optional; // Para métodos que pueden devolver nulo
import java.util.UUID; // Importa UUID, el tipo de la clave primaria de Standard

/**
 * Interfaz de repositorio para la entidad {@link Standard}.
 * Extiende {@link JpaRepository} para heredar métodos CRUD estándar
 * y funcionalidades de paginación/ordenación.
 * Permite la interacción con la tabla 'standards' en la base de datos.
 */
@Repository // Indica a Spring que esta interfaz es un componente de repositorio y debe ser
            // gestionada.
public interface StandardRepository extends JpaRepository<Standard, UUID> {

  /**
   * Busca un estándar por su nombre, ignorando mayúsculas y minúsculas.
   * Útil para búsquedas flexibles o validaciones.
   * 
   * @param name El nombre del estándar a buscar.
   * @return Un {@link Optional} que contiene el estándar si se encuentra, o vacío
   *         si no.
   */
  Optional<Standard> findByNameIgnoreCase(String name);

  /**
   * Busca un estándar por su código único.
   * 
   * @param code El código del estándar a buscar.
   * @return Un {@link Optional} que contiene el estándar si se encuentra, o vacío
   *         si no.
   */
  Optional<Standard> findByCode(String code);

  /**
   * Verifica si existe un estándar con un nombre específico.
   * 
   * @param name El nombre del estándar a verificar.
   * @return true si existe un estándar con ese nombre, false en caso contrario.
   */
  boolean existsByName(String name);

  /**
   * Verifica si existe un estándar con un código específico.
   * 
   * @param code El código del estándar a verificar.
   * @return true si existe un estándar con ese código, false en caso contrario.
   */
  boolean existsByCode(String code);

  /**
   * Busca todos los estándares que pertenecen a una competencia específica.
   * 
   * @param competencyId El UUID de la competencia padre.
   * @return Una {@link List} de estándares asociados a la competencia dada.
   */
  List<Standard> findAllByCompetencyId(UUID competencyId);

  /**
   * Busca un estándar específico por su ID y el ID de la competencia a la que
   * pertenece.
   * Útil para asegurar que un estándar se obtenga dentro del contexto de una
   * competencia específica.
   * 
   * @param id           El UUID del estándar.
   * @param competencyId El UUID de la competencia padre.
   * @return Un {@link Optional} que contiene el estándar si se encuentra y
   *         pertenece a la competencia, o vacío si no.
   */
  Optional<Standard> findByIdAndCompetencyId(UUID id, UUID competencyId);
}
