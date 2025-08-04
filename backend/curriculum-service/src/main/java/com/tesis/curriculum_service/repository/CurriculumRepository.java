// src/main/java/com/tesis/curriculum_service/repository/CurriculumRepository.java
package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Curriculum;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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

  /** Trae toda la jerarquía en un solo query (LEFT JOIN FETCH) */
  @EntityGraph(attributePaths = {
      "competencies",
      "competencies.standards",
      "competencies.standards.learningObjectives",
      "competencies.standards.learningObjectives.exercises",
      "competencies.standards.learningObjectives.exercises.hints",
      "competencies.standards.learningObjectives.exercises.solutionSteps"
  })
  Optional<Curriculum> findFullById(UUID id);

  @Query(value = "SELECT * FROM curricula", nativeQuery = true)
  List<Curriculum> findAllIncludingInactive();

  @Query(value = "SELECT * FROM curricula WHERE active = true", nativeQuery = true)
  List<Curriculum> findAllActive();

  @Query(value = "SELECT * FROM curricula WHERE active = false", nativeQuery = true)
  List<Curriculum> findAllInactive();
}
