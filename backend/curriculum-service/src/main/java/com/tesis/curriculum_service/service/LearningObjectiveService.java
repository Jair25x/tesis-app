package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad LearningObjective.
 * Proporciona operaciones CRUD, soft‐delete y reactivación.
 */
public interface LearningObjectiveService {

  /**
   * Crea un nuevo objetivo de aprendizaje bajo un estándar.
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @param request      DTO con los datos de creación.
   * @return DTO con el objetivo creado.
   * @throws ResourceNotFoundException si la competencia o el estándar no existen.
   */
  LearningObjectiveResponse create(UUID competencyId,
      UUID standardId,
      LearningObjectiveRequest request)
      throws ResourceNotFoundException;

  /**
   * Lista todos los objetivos activos de un estándar.
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @return Lista de DTOs de objetivos.
   * @throws ResourceNotFoundException si la competencia o el estándar no existen.
   */
  List<LearningObjectiveResponse> getAllByStandard(UUID competencyId,
      UUID standardId)
      throws ResourceNotFoundException;

  /**
   * Obtiene un objetivo activo por su ID.
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @param id           UUID del objetivo.
   * @return DTO con los datos del objetivo.
   * @throws ResourceNotFoundException si no existe.
   */
  LearningObjectiveResponse getById(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException;

  /**
   * Actualiza un objetivo existente.
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @param id           UUID del objetivo.
   * @param request      DTO con los nuevos datos.
   * @return DTO con los datos actualizados.
   * @throws ResourceNotFoundException si no existe.
   */
  LearningObjectiveResponse update(UUID competencyId,
      UUID standardId,
      UUID id,
      LearningObjectiveRequest request)
      throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico (soft‐delete) de un objetivo.
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @param id           UUID del objetivo.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException;

  /**
   * Reactiva un objetivo (y limpia deletedAt).
   *
   * @param competencyId UUID de la competencia padre.
   * @param standardId   UUID del estándar padre.
   * @param id           UUID del objetivo.
   * @throws ResourceNotFoundException si no existe (ni siquiera inactivo).
   */
  void reactivate(UUID competencyId,
      UUID standardId,
      UUID id)
      throws ResourceNotFoundException;
}
