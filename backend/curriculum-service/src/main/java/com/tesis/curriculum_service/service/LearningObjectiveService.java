package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest; // DTO de entrada para crear/actualizar objetivos de aprendizaje.
import com.tesis.curriculum_service.dto.LearningObjectiveResponse; // DTO de salida para devolver objetivos de aprendizaje.
import com.tesis.curriculum_service.exception.ResourceNotFoundException; // Excepción para recursos no encontrados.

import java.util.List; // Para listas de objetivos de aprendizaje.
import java.util.UUID; // Para identificadores únicos.

/**
 * Interfaz de servicio para las operaciones de negocio relacionadas con la
 * entidad {@link com.tesis.curriculum_service.model.LearningObjective}.
 * Define el contrato de la capa de lógica de negocio para la gestión de
 * objetivos de aprendizaje.
 */
public interface LearningObjectiveService {

  /**
   * Crea un nuevo objetivo de aprendizaje asociado a un estándar específico.
   * 
   * @param request DTO que contiene los datos para la creación del objetivo de
   *                aprendizaje, incluyendo el ID del estándar padre.
   * @return El DTO de respuesta del objetivo de aprendizaje creado.
   * @throws ResourceNotFoundException si el estándar padre no es encontrado.
   * @throws IllegalArgumentException  si el nombre o el código del objetivo de
   *                                   aprendizaje ya existen.
   */
  LearningObjectiveResponse createLearningObjective(LearningObjectiveRequest request);

  /**
   * Obtiene un objetivo de aprendizaje por su identificador único.
   * 
   * @param id El ID del objetivo de aprendizaje a buscar.
   * @return El DTO de respuesta del objetivo de aprendizaje encontrado.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado.
   */
  LearningObjectiveResponse getLearningObjectiveById(UUID id);

  /**
   * Obtiene una lista de todos los objetivos de aprendizaje existentes.
   * 
   * @return Una lista de DTOs de respuesta de objetivos de aprendizaje.
   */
  List<LearningObjectiveResponse> getAllLearningObjectives();

  /**
   * Obtiene una lista de objetivos de aprendizaje asociados a un estándar
   * específico.
   * 
   * @param standardId El ID del estándar padre.
   * @return Una lista de DTOs de respuesta de objetivos de aprendizaje. Puede
   *         estar vacía si no hay objetivos para ese estándar.
   * @throws ResourceNotFoundException si el estándar padre no es encontrado.
   */
  List<LearningObjectiveResponse> getLearningObjectivesByStandardId(UUID standardId);

  /**
   * Actualiza un objetivo de aprendizaje existente.
   * 
   * @param id      El ID del objetivo de aprendizaje a actualizar.
   * @param request DTO que contiene los nuevos datos para la actualización del
   *                objetivo de aprendizaje.
   * @return El DTO de respuesta del objetivo de aprendizaje actualizado.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado o si el estándar padre no es
   *                                   encontrado.
   * @throws IllegalArgumentException  si el nombre o código actualizado ya existe
   *                                   en otro objetivo de aprendizaje.
   */
  LearningObjectiveResponse updateLearningObjective(UUID id, LearningObjectiveRequest request);

  /**
   * Elimina lógicamente un objetivo de aprendizaje por su identificador único.
   * 
   * @param id El ID del objetivo de aprendizaje a eliminar lógicamente.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado.
   */
  void deleteLearningObjective(UUID id);
}
