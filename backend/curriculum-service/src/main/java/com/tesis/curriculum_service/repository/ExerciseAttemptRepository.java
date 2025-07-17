package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, Long> {

  // Obtener todos los intentos de un usuario
  List<ExerciseAttempt> findByUserId(Long userId);

  // Obtener todos los intentos para un ejercicio específico
  List<ExerciseAttempt> findByExerciseId(UUID exerciseId);

  List<ExerciseAttempt> findByExerciseIdAndUserId(UUID exerciseId, Long userId);
}
