package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest; // DTO de entrada para crear/actualizar estándares.
import com.tesis.curriculum_service.dto.StandardResponse; // DTO de salida para devolver estándares.
import com.tesis.curriculum_service.exception.ResourceNotFoundException; // Excepción para recursos no encontrados.

import java.util.List; // Para listas de estándares.
import java.util.UUID; // Para identificadores únicos.

/**
 * Interfaz de servicio para las operaciones de negocio relacionadas con la
 * entidad {@link com.tesis.curriculum_service.model.Standard}.
 * Define el contrato de la capa de lógica de negocio para la gestión de
 * estándares.
 */
public interface StandardService {

  /**
   * Crea un nuevo estándar asociado a una competencia específica.
   * 
   * @param request DTO que contiene los datos para la creación del estándar,
   *                incluyendo el ID de la competencia padre.
   * @return El DTO de respuesta del estándar creado.
   * @throws ResourceNotFoundException si la competencia padre no es encontrada.
   * @throws IllegalArgumentException  si el nombre o el código del estándar ya
   *                                   existen.
   */
  StandardResponse createStandard(StandardRequest request);

  /**
   * Obtiene un estándar por su identificador único.
   * 
   * @param id El ID del estándar a buscar.
   * @return El DTO de respuesta del estándar encontrado.
   * @throws ResourceNotFoundException si el estándar no es encontrado.
   */
  StandardResponse getStandardById(UUID id);

  /**
   * Obtiene una lista de todos los estándares existentes.
   * 
   * @return Una lista de DTOs de respuesta de estándares.
   */
  List<StandardResponse> getAllStandards();

  /**
   * Obtiene una lista de estándares asociados a una competencia específica.
   * 
   * @param competencyId El ID de la competencia padre.
   * @return Una lista de DTOs de respuesta de estándares. Puede estar vacía si no
   *         hay estándares para esa competencia.
   * @throws ResourceNotFoundException si la competencia padre no es encontrada.
   */
  List<StandardResponse> getStandardsByCompetencyId(UUID competencyId);

  /**
   * Actualiza un estándar existente.
   * 
   * @param id      El ID del estándar a actualizar.
   * @param request DTO que contiene los nuevos datos para la actualización del
   *                estándar.
   * @return El DTO de respuesta del estándar actualizado.
   * @throws ResourceNotFoundException si el estándar no es encontrado o si la
   *                                   competencia padre no es encontrada.
   * @throws IllegalArgumentException  si el nombre o código actualizado ya existe
   *                                   en otro estándar.
   */
  StandardResponse updateStandard(UUID id, StandardRequest request);

  /**
   * Elimina lógicamente un estándar por su identificador único.
   * 
   * @param id El ID del estándar a eliminar lógicamente.
   * @throws ResourceNotFoundException si el estándar no es encontrado.
   */
  void deleteStandard(UUID id);
}
