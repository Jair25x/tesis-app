package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Competency.
 * Define operaciones CRUD y lanza ResourceNotFoundException si no existe.
 */
public interface CompetencyService {

  /**
   * Crea una nueva competencia dentro de un currículo dado.
   *
   * @param curriculumId UUID del currículo al cual pertenece.
   * @param request      DTO con datos de creación.
   * @return DTO con la entidad creada.
   * @throws ResourceNotFoundException si el currículo no existe.
   */
  CompetencyResponse create(UUID curriculumId, CompetencyRequest request)
      throws ResourceNotFoundException;

  /**
   * Recupera todas las competencias activas de un currículo.
   *
   * @param curriculumId UUID del currículo.
   * @return Lista de DTOs.
   * @throws ResourceNotFoundException si el currículo no existe.
   */
  List<CompetencyResponse> getAllByCurriculum(UUID curriculumId)
      throws ResourceNotFoundException;

  /**
   * Recupera una competencia por su ID y currículo.
   *
   * @param curriculumId UUID del currículo.
   * @param id           UUID de la competencia.
   * @return DTO con datos de la competencia.
   * @throws ResourceNotFoundException si no existe.
   */
  CompetencyResponse getById(UUID curriculumId, UUID id)
      throws ResourceNotFoundException;

  /**
   * Actualiza una competencia existente.
   *
   * @param curriculumId UUID del currículo.
   * @param id           UUID de la competencia.
   * @param request      DTO con datos nuevos.
   * @return DTO con datos actualizados.
   * @throws ResourceNotFoundException si no existe.
   */
  CompetencyResponse update(UUID curriculumId, UUID id, CompetencyRequest request)
      throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico de una competencia.
   *
   * @param curriculumId UUID del currículo.
   * @param id           UUID de la competencia.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID curriculumId, UUID id)
      throws ResourceNotFoundException;

  /**
   * Reactiva una competencia (y en cascada sus estándares y objetivos).
   *
   * @param curriculumId UUID del currículo padre
   * @param id           UUID de la competencia
   * @throws ResourceNotFoundException si no existe (ni siquiera como inactiva)
   */
  void reactivate(UUID curriculumId, UUID id)
      throws ResourceNotFoundException;
}
