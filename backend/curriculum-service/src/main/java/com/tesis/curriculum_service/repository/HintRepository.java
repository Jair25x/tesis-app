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
 * Proporciona métodos CRUD básicos y consultas específicas
 * para trabajar con las pistas asociadas a un ejercicio.
 */
@Repository
public interface HintRepository extends JpaRepository<Hint, UUID> {

  /**
   * Recupera todas las pistas activas de un ejercicio dado.
   *
   * @param exerciseId UUID del ejercicio
   * @return Lista de pistas asociadas al ejercicio
   */
  List<Hint> findByExerciseId(UUID exerciseId);

  /**
   * Recupera una única pista por su ID y el ID de su ejercicio padre.
   * Garantiza que la pista pertenece al ejercicio correcto.
   *
   * @param id         UUID de la pista
   * @param exerciseId UUID del ejercicio padre
   * @return Optional con la pista si existe y pertenece al ejercicio
   */
  Optional<Hint> findByIdAndExerciseId(UUID id, UUID exerciseId);

  // Si implementas reactivate/soft-delete avanzado, podrías exponer:
  // Optional<Hint> findIncludingInactiveByIdAndExerciseId(UUID id, UUID
  // exerciseId);
  @Query("SELECT h FROM Hint h WHERE h.id = :id")
  Optional<Hint> findByIdIncludingInactive(@Param("id") UUID id);
}
