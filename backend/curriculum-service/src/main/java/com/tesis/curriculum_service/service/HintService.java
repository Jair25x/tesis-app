package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.HintRequest;
import com.tesis.curriculum_service.dto.HintResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Hint.
 * Define operaciones CRUD, soft-delete y reactivación.
 */
public interface HintService {

  /**
   * Crea una nueva pista asociada a un ejercicio.
   *
   * @param exerciseId UUID del ejercicio padre.
   * @param request    DTO con los datos de creación.
   * @return DTO con la pista creada.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  HintResponse create(UUID exerciseId, HintRequest request) throws ResourceNotFoundException;

  /**
   * Lista todas las pistas activas de un ejercicio.
   *
   * @param exerciseId UUID del ejercicio.
   * @return Lista de DTOs de pistas activas.
   * @throws ResourceNotFoundException si el ejercicio no existe.
   */
  List<HintResponse> getAllByExercise(UUID exerciseId) throws ResourceNotFoundException;

  /**
   * Recupera una pista activa por su ID y el ejercicio asociado.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @return DTO de la pista.
   * @throws ResourceNotFoundException si no existe o está inactiva.
   */
  HintResponse getById(UUID exerciseId, UUID id) throws ResourceNotFoundException;

  /**
   * Actualiza los datos de una pista existente.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @param request    DTO con los nuevos datos.
   * @return DTO actualizado.
   * @throws ResourceNotFoundException si la pista no existe o está inactiva.
   */
  HintResponse update(UUID exerciseId, UUID id, HintRequest request) throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico de una pista (soft delete).
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID exerciseId, UUID id) throws ResourceNotFoundException;

  /**
   * Reactiva una pista previamente desactivada.
   *
   * @param exerciseId UUID del ejercicio.
   * @param id         UUID de la pista.
   * @throws ResourceNotFoundException si no existe ni como inactiva.
   */
  void reactivate(UUID exerciseId, UUID id) throws ResourceNotFoundException;

  List<HintResponse> getAllIncludingInactive(UUID exerciseId) throws ResourceNotFoundException;

}
