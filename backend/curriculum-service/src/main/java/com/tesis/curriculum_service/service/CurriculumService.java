package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumRequest; // DTO de entrada para crear/actualizar currículos.
import com.tesis.curriculum_service.dto.CurriculumResponse; // DTO de salida para devolver currículos.
import com.tesis.curriculum_service.dto.CurriculumStatsResponse;

import java.util.List; // Para listas de currículos.
import java.util.UUID; // Para identificadores únicos.

/**
 * Interfaz de servicio para las operaciones de negocio relacionadas con la
 * entidad {@link com.tesis.curriculum_service.model.Curriculum}.
 * Define el contrato de la capa de lógica de negocio para la gestión de
 * currículos.
 */
public interface CurriculumService {

  /**
   * Crea un nuevo currículo en el sistema.
   * 
   * @param request DTO que contiene los datos para la creación del currículo.
   * @return El DTO de respuesta del currículo creado.
   */
  CurriculumResponse createCurriculum(CurriculumRequest request);

  /**
   * Obtiene un currículo por su identificador único.
   * 
   * @param id El ID del currículo a buscar.
   * @return El DTO de respuesta del currículo encontrado.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          el
   *                                                                          currículo
   *                                                                          no
   *                                                                          es
   *                                                                          encontrado.
   */
  CurriculumResponse getCurriculumById(UUID id);

  /**
   * Obtiene una lista de todos los currículos existentes.
   * 
   * @return Una lista de DTOs de respuesta de currículos.
   */
  List<CurriculumResponse> getAllCurriculums();

  /**
   * Actualiza un currículo existente.
   * 
   * @param id      El ID del currículo a actualizar.
   * @param request DTO que contiene los nuevos datos para la actualización del
   *                currículo.
   * @return El DTO de respuesta del currículo actualizado.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          el
   *                                                                          currículo
   *                                                                          no
   *                                                                          es
   *                                                                          encontrado.
   * @throws IllegalArgumentException                                         si
   *                                                                          el
   *                                                                          nombre
   *                                                                          o
   *                                                                          código
   *                                                                          actualizado
   *                                                                          ya
   *                                                                          existe
   *                                                                          en
   *                                                                          otro
   *                                                                          currículo.
   */
  CurriculumResponse updateCurriculum(UUID id, CurriculumRequest request); // Usamos CurriculumRequest también para
                                                                           // update, puedes tener un UpdateRequest si
                                                                           // los campos son diferentes

  /**
   * Elimina lógicamente un currículo por su identificador único.
   * 
   * @param id El ID del currículo a eliminar lógicamente.
   * @throws com.tesis.curriculum_service.exception.ResourceNotFoundException si
   *                                                                          el
   *                                                                          currículo
   *                                                                          no
   *                                                                          es
   *                                                                          encontrado.
   */
  void deleteCurriculum(UUID id); // Consideramos un borrado lógico (marcar como inactivo en la entidad)

  List<CurriculumResponse> getCurriculaByGrade(String grade);

  CurriculumStatsResponse getCurriculumStats();
}
