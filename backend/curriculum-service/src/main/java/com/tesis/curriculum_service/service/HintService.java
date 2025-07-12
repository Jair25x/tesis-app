package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.HintRequest;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Hint.
 * Define operaciones CRUD y lanza ResourceNotFoundException si no existe.
 */
public interface HintService {

  /**
   * Crea una nueva pista asociada a un ejercicio.
   *
   * @param exerciseId UUID del ejercicio padre.
   * @param request    DTO con los datos de creación.
   * @return DTO con la entidad creada.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  HintResponse create(UUID exerciseId, HintRequest request) throws ResourceNotFoundException;

  /**
   * Lista todas las pistas de un ejercicio.
   *
   * @param exerciseId UUID del ejercicio.
   * @return Lista de DTOs de pistas.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  List<HintResponse> getAllByExercise(UUID exerciseId) throws ResourceNotFoundException;

  /**
   * Recupera una pista por su ID y ejercicio.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @return DTO de la pista.
   * @throws ResourceNotFoundException si no existe.
   */
  HintResponse getById(UUID exerciseId, UUID id) throws ResourceNotFoundException;

  /**
   * Actualiza una pista existente.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @param request    DTO con los datos a actualizar.
   * @return DTO con la pista actualizada.
   * @throws ResourceNotFoundException si no existe.
   */
  HintResponse update(UUID exerciseId, UUID id, HintRequest request) throws ResourceNotFoundException;

  /**
   * Elimina (físicamente) una pista.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID exerciseId, UUID id) throws ResourceNotFoundException;
}
