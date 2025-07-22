package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad {@link Hint}.
 * Proporciona métodos CRUD, soft-delete y consultas específicas
 * usando SQL nativo para mayor control.
 */
@Repository
public interface HintRepository extends JpaRepository<Hint, UUID> {

  /**
   * Lista todas las pistas activas para un ejercicio, ordenadas por costo
   * ascendente.
   */
  @Query(value = """
      SELECT * FROM hints
      WHERE exercise_id = :exerciseId
        AND active = true
      ORDER BY cost ASC
      """, nativeQuery = true)
  List<Hint> findActiveByExerciseId(@Param("exerciseId") UUID exerciseId);

  /**
   * Lista todas las pistas (activas e inactivas) de un ejercicio (para vista
   * administrativa).
   */
  @Query(value = """
      SELECT * FROM hints
      WHERE exercise_id = :exerciseId
      ORDER BY cost ASC
      """, nativeQuery = true)
  List<Hint> findAllByExerciseId(@Param("exerciseId") UUID exerciseId);

  /**
   * Recupera una pista activa por su ID y el ID del ejercicio.
   */
  @Query(value = """
      SELECT * FROM hints
      WHERE id = :id
        AND exercise_id = :exerciseId
        AND active = true
      """, nativeQuery = true)
  Optional<Hint> findByIdAndExerciseId(@Param("id") UUID id, @Param("exerciseId") UUID exerciseId);

  /**
   * Recupera una pista sin importar si está activa o no.
   * Útil para operaciones de reactivación o vista administrativa.
   */
  @Query(value = """
      SELECT * FROM hints
      WHERE id = :id
      """, nativeQuery = true)
  Optional<Hint> findByIdIncludingInactive(@Param("id") UUID id);

  /**
   * Borra todas las pistas asociadas a un ejercicio (borrado manual en cascada si
   * se necesita).
   * Este método es útil si quieres borrar huérfanos en cascada sin depender solo
   * de JPA.
   */
  @Query(value = """
      DELETE FROM hints
      WHERE exercise_id = :exerciseId
      """, nativeQuery = true)
  void deleteAllByExerciseId(@Param("exerciseId") UUID exerciseId);
}
