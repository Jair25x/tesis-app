package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

/**
 * Servicio de negocio para la entidad Curriculum:
 * define operaciones CRUD y lanza ResourceNotFoundException si no existe.
 */
public interface CurriculumService {

  /**
   * Crea un nuevo currículo.
   * 
   * @param request DTO con datos de creación.
   * @return DTO con la entidad creada.
   */
  CurriculumResponse create(CurriculumRequest request);

  /**
   * Recupera todos los currículos activos.
   * 
   * @return Lista de DTOs.
   */
  List<CurriculumResponse> getAll();

  /**
   * Recupera un currículo por su ID.
   * 
   * @param id UUID del currículo.
   * @throws ResourceNotFoundException si no existe.
   * @return DTO con datos del currículo.
   */
  CurriculumResponse getById(UUID id) throws ResourceNotFoundException;

  /**
   * Actualiza un currículo existente.
   * 
   * @param id      UUID del currículo.
   * @param request DTO con datos nuevos.
   * @throws ResourceNotFoundException si no existe.
   * @return DTO con datos actualizados.
   */
  CurriculumResponse update(UUID id, CurriculumRequest request) throws ResourceNotFoundException;

  /**
   * Realiza un borrado lógico de un currículo.
   * 
   * @param id UUID del currículo.
   * @throws ResourceNotFoundException si no existe.
   */
  void delete(UUID id) throws ResourceNotFoundException;

  /**
   * Reactiva un currículo eliminado lógicamente (soft-delete).
   *
   * @param id UUID del currículo a reactivar.
   * @throws ResourceNotFoundException si no existe.
   */
  void reactivate(UUID id) throws ResourceNotFoundException;
}
