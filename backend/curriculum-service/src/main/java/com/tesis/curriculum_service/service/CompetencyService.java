package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;

import java.util.List;
import java.util.UUID;

public interface CompetencyService {
  /**
   * Crea una nueva competencia.
   * 
   * @param competencyRequest El DTO de solicitud de la competencia.
   * @return El DTO de respuesta de la competencia creada.
   */
  CompetencyResponse createCompetency(CompetencyRequest competencyRequest);

  /**
   * Obtiene una competencia por su ID.
   * 
   * @param id El ID de la competencia.
   * @return El DTO de respuesta de la competencia encontrada.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          la
   *                                                                          competencia
   *                                                                          no
   *                                                                          es
   *                                                                          encontrada.
   */
  CompetencyResponse getCompetencyById(UUID id);

  /**
   * Obtiene todas las competencias.
   * 
   * @return Una lista de DTOs de respuesta de competencias.
   */
  List<CompetencyResponse> getAllCompetencies();

  /**
   * Obtiene todas las competencias asociadas a un currículo específico.
   * 
   * @param curriculumId El ID del currículo padre.
   * @return Una lista de DTOs de respuesta de competencias.
   */
  List<CompetencyResponse> getCompetenciesByCurriculumId(UUID curriculumId);

  /**
   * Actualiza una competencia existente.
   * 
   * @param id                El ID de la competencia a actualizar.
   * @param competencyRequest El DTO de solicitud con los datos actualizados.
   * @return El DTO de respuesta de la competencia actualizada.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          la
   *                                                                          competencia
   *                                                                          no
   *                                                                          es
   *                                                                          encontrada.
   */
  CompetencyResponse updateCompetency(UUID id, CompetencyRequest competencyRequest);

  /**
   * Elimina una competencia por su ID.
   * 
   * @param id El ID de la competencia a eliminar.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          la
   *                                                                          competencia
   *                                                                          no
   *                                                                          es
   *                                                                          encontrada.
   */
  void deleteCompetency(UUID id);
}