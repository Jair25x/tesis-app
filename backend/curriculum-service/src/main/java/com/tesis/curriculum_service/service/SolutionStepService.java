// src/main/java/com/tesis/curriculum_service/service/SolutionStepService.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.SolutionStepRequest;
import com.tesis.curriculum_service.dto.SolutionStepResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para los pasos de solución de un ejercicio.
 * Define operaciones CRUD, borrado lógico (soft-delete) y reactivación.
 */
public interface SolutionStepService {

  /**
   * Crea un nuevo paso de solución dentro de un ejercicio dado.
   *
   * @param exerciseId UUID del ejercicio padre.
   * @param request    DTO con datos de creación (número de paso y explicación).
   * @return DTO con el paso creado.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  SolutionStepResponse create(UUID exerciseId, SolutionStepRequest request)
      throws ResourceNotFoundException;

  /**
   * Recupera todos los pasos de solución de un ejercicio, ordenados por número de
   * paso.
   *
   * @param exerciseId UUID del ejercicio.
   * @return Lista de DTOs de pasos.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  List<SolutionStepResponse> getAllByExercise(UUID exerciseId)
      throws ResourceNotFoundException;

  /**
   * Recupera un paso de solución por su ID y ejercicio padre.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID del paso de solución.
   * @return DTO con datos del paso.
   * @throws ResourceNotFoundException si no existe.
   */
  SolutionStepResponse getById(UUID exerciseId, UUID id)
      throws ResourceNotFoundException;

  /**
   * Actualiza un paso de solución existente.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID del paso de solución.
   * @param request    DTO con datos nuevos.
   * @return DTO con datos actualizados.
   * @throws ResourceNotFoundException si no existe.
   */
  SolutionStepResponse update(UUID exerciseId, UUID id, SolutionStepRequest request)
      throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico de un paso de solución.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID del paso de solución.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID exerciseId, UUID id)
      throws ResourceNotFoundException;

  /**
   * Reactiva un paso de solución previamente borrado.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID del paso de solución.
   * @throws ResourceNotFoundException si no existe (ni siquiera inactivo).
   */
  void reactivate(UUID exerciseId, UUID id)
      throws ResourceNotFoundException;
}
