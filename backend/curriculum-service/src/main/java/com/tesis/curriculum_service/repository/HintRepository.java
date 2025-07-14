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

  // Solo las pistas activas, ordenadas por coste asc (ajusta si prefieres otro
  // criterio)
  List<Hint> findByExerciseIdOrderByCostAsc(UUID exerciseId);

  Optional<Hint> findByIdAndExerciseId(UUID id, UUID exerciseId);

  /** Permite traer una pista incluso si está inactiva (para reactivate) */
  @Query("SELECT h FROM Hint h WHERE h.id = :id")
  Optional<Hint> findByIdIncludingInactive(@Param("id") UUID id);
}
