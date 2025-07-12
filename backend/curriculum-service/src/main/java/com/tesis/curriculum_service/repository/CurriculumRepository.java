// src/main/java/com/tesis/curriculum_service/repository/CurriculumRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad Curriculum.
 * Proporciona CRUD básico usando UUID como clave primaria.
 */
@Repository
public interface CurriculumRepository extends JpaRepository<Curriculum, UUID> {
  // Métodos personalizados de consulta pueden ir aquí, por ejemplo:
  // List<Curriculum> findByGrade(String grade);

  /**
   * Método de ayuda para reactivar un currículo que ha sido borrado lógicamente.
   * Usamos una consulta nativa para saltarnos el @SQLRestriction.
   */
  @Query(value = "SELECT * FROM curricula WHERE id = :id", nativeQuery = true)
  Optional<Curriculum> findIncludingInactiveById(@Param("id") UUID id);
}
