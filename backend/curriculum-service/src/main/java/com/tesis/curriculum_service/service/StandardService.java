// src/main/java/com/tesis/curriculum_service/service/StandardService.java
package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Standard.
 * Define operaciones CRUD y soporta soft-delete y reactivación en cascada.
 */
public interface StandardService {

  /**
   * Crea un nuevo estándar dentro de una competencia de un currículo.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia a la que pertenece.
   * @param request      DTO con los datos de creación.
   * @return DTO con la entidad creada.
   * @throws ResourceNotFoundException si la competencia o currículo no existen.
   */
  StandardResponse create(UUID curriculumId,
      UUID competencyId,
      StandardRequest request)
      throws ResourceNotFoundException;

  /**
   * Lista todos los estándares de una competencia dada.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia.
   * @return Lista de DTOs.
   * @throws ResourceNotFoundException si la competencia o currículo no existen.
   */
  List<StandardResponse> getAllByCompetency(UUID curriculumId,
      UUID competencyId)
      throws ResourceNotFoundException;

  /**
   * Obtiene un estándar concreto por sus IDs.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia.
   * @param id           UUID del estándar a recuperar.
   * @return DTO con la información del estándar.
   * @throws ResourceNotFoundException si no existe.
   */
  StandardResponse getById(UUID curriculumId,
      UUID competencyId,
      UUID id)
      throws ResourceNotFoundException;

  /**
   * Actualiza un estándar existente.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia.
   * @param id           UUID del estándar a actualizar.
   * @param request      DTO con los nuevos datos.
   * @return DTO con la información actualizada.
   * @throws ResourceNotFoundException si no existe.
   */
  StandardResponse update(UUID curriculumId,
      UUID competencyId,
      UUID id,
      StandardRequest request)
      throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico de un estándar.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia.
   * @param id           UUID del estándar a borrar.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID curriculumId,
      UUID competencyId,
      UUID id)
      throws ResourceNotFoundException;

  /**
   * Reactiva un estándar borrado lógicamente.
   *
   * @param curriculumId UUID del currículo padre.
   * @param competencyId UUID de la competencia.
   * @param id           UUID del estándar a reactivar.
   * @throws ResourceNotFoundException si no existe (ni siquiera inactivo).
   */
  void reactivate(UUID curriculumId,
      UUID competencyId,
      UUID id)
      throws ResourceNotFoundException;
}
