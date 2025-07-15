package com.tesis.curriculum_service.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * DTO que representa el resultado de validar una respuesta estudiantil.
 */
@Data
@Builder
public class CheckAnswerResponse {

  /**
   * Indica si la respuesta del estudiante fue correcta.
   */
  private boolean correct;

  /**
   * Feedback textual para mostrar al estudiante.
   */
  private String feedback;

  /**
   * ID del siguiente ejercicio, si se desea sugerir uno.
   */
  private UUID nextExerciseId;

  /**
   * Experiencia ganada por resolver el ejercicio (gamificación).
   */
  private int xpAwarded;

  /**
   * Número de pistas restantes disponibles para el estudiante.
   */
  private int remainingHints;

}
