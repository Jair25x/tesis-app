package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.repository.StandardRepository; // Necesario para buscar el estándar padre
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importa @Transactional de Spring

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de lógica de negocio para la gestión de objetivos
 * de aprendizaje.
 * Maneja las operaciones CRUD, el mapeo entre DTOs y entidades, y la lógica de
 * negocio específica.
 */
@Service
@RequiredArgsConstructor
public class LearningObjectiveServiceImpl implements LearningObjectiveService {

  private static final Logger logger = LoggerFactory.getLogger(LearningObjectiveServiceImpl.class);

  private final LearningObjectiveRepository learningObjectiveRepository;
  private final StandardRepository standardRepository; // Inyección de dependencia para acceder a estándares

  /**
   * Crea un nuevo objetivo de aprendizaje.
   * Asegura que el estándar padre exista y que el nombre y código del objetivo
   * sean únicos.
   * 
   * @param request DTO con los datos del nuevo objetivo de aprendizaje.
   * @return LearningObjectiveResponse DTO del objetivo de aprendizaje creado.
   * @throws ResourceNotFoundException Si el estándar padre no es encontrado.
   * @throws IllegalArgumentException  Si el nombre o el código del objetivo de
   *                                   aprendizaje ya existen.
   */
  @Override
  @Transactional
  public LearningObjectiveResponse createLearningObjective(LearningObjectiveRequest request) {
    logger.info("Intentando crear un nuevo objetivo de aprendizaje con nombre: {} para el estándar ID: {}",
        request.getName(), request.getStandardId());

    // Lógica de negocio: Verificar si el estándar padre existe
    Standard standard = standardRepository.findById(request.getStandardId())
        .orElseThrow(() -> {
          logger.warn("Fallo la creación del objetivo de aprendizaje: Estándar padre no encontrado con ID: {}",
              request.getStandardId());
          return new ResourceNotFoundException("Estándar padre no encontrado con ID: " + request.getStandardId());
        });

    // Lógica de negocio: Asegurar unicidad del nombre
    if (learningObjectiveRepository.existsByName(request.getName())) {
      logger.warn(
          "Fallo la creación del objetivo de aprendizaje: Ya existe un objetivo de aprendizaje con el nombre '{}'",
          request.getName());
      throw new IllegalArgumentException("Ya existe un objetivo de aprendizaje con el nombre: " + request.getName());
    }
    // Lógica de negocio: Asegurar unicidad del código
    if (learningObjectiveRepository.existsByCode(request.getCode())) {
      logger.warn(
          "Fallo la creación del objetivo de aprendizaje: Ya existe un objetivo de aprendizaje con el código '{}'",
          request.getCode());
      throw new IllegalArgumentException("Ya existe un objetivo de aprendizaje con el código: " + request.getCode());
    }

    // Mapeo de DTO a Entidad
    LearningObjective learningObjective = LearningObjective.builder()
        .name(request.getName())
        .description(request.getDescription()) // ✅ AGREGADO: Mapeo de la descripción desde el request
        .code(request.getCode())
        .standard(standard) // Asocia el objetivo de aprendizaje con el estándar encontrado
        .build();

    LearningObjective savedLearningObjective = learningObjectiveRepository.save(learningObjective);
    logger.info("Objetivo de aprendizaje creado exitosamente con ID: {}", savedLearningObjective.getId());

    // Mapeo de Entidad a DTO de Respuesta
    return toDto(savedLearningObjective);
  }

  /**
   * Obtiene un objetivo de aprendizaje por su ID.
   * 
   * @param id El ID del objetivo de aprendizaje a buscar.
   * @return LearningObjectiveResponse DTO del objetivo de aprendizaje encontrado.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado.
   */
  @Override
  @Transactional(readOnly = true)
  public LearningObjectiveResponse getLearningObjectiveById(UUID id) {
    logger.info("Buscando objetivo de aprendizaje con ID: {}", id);
    LearningObjective learningObjective = learningObjectiveRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Objetivo de aprendizaje no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Objetivo de aprendizaje no encontrado con ID: " + id);
        });
    logger.info("Objetivo de aprendizaje encontrado con ID: {}", id);
    return toDto(learningObjective);
  }

  /**
   * Obtiene todos los objetivos de aprendizaje.
   * 
   * @return Lista de LearningObjectiveResponse DTOs.
   */
  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getAllLearningObjectives() {
    logger.info("Obteniendo todos los objetivos de aprendizaje.");
    List<LearningObjective> learningObjectives = learningObjectiveRepository.findAll();
    List<LearningObjectiveResponse> responses = learningObjectives.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    logger.info("Encontrados {} objetivos de aprendizaje.", responses.size());
    return responses;
  }

  /**
   * Obtiene todos los objetivos de aprendizaje asociados a un estándar
   * específico.
   * 
   * @param standardId El ID del estándar padre.
   * @return Lista de LearningObjectiveResponse DTOs.
   * @throws ResourceNotFoundException si el estándar padre no es encontrado.
   */
  @Override
  @Transactional(readOnly = true)
  public List<LearningObjectiveResponse> getLearningObjectivesByStandardId(UUID standardId) {
    logger.info("Buscando objetivos de aprendizaje para el estándar ID: {}", standardId);
    // Opcional: Verificar si el standardId existe antes de la consulta
    if (!standardRepository.existsById(standardId)) {
      logger.warn("Fallo la búsqueda de objetivos de aprendizaje: Estándar padre no encontrado con ID: {}", standardId);
      throw new ResourceNotFoundException("Estándar padre no encontrado con ID: " + standardId);
    }

    List<LearningObjective> learningObjectives = learningObjectiveRepository.findAllByStandardId(standardId);
    List<LearningObjectiveResponse> responses = learningObjectives.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    logger.info("Encontrados {} objetivos de aprendizaje para el estándar ID: {}.", responses.size(), standardId);
    return responses;
  }

  /**
   * Actualiza un objetivo de aprendizaje existente.
   * Realiza validaciones de unicidad para el nombre y el código (excluyendo el
   * objetivo actual).
   * 
   * @param id      El ID del objetivo de aprendizaje a actualizar.
   * @param request DTO con los datos para la actualización.
   * @return LearningObjectiveResponse DTO del objetivo de aprendizaje
   *         actualizado.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado o si el estándar padre no es
   *                                   encontrado.
   * @throws IllegalArgumentException  si el nombre o código actualizado ya existe
   *                                   en otro objetivo de aprendizaje.
   */
  @Override
  @Transactional
  public LearningObjectiveResponse updateLearningObjective(UUID id, LearningObjectiveRequest request) {
    logger.info("Intentando actualizar objetivo de aprendizaje con ID: {}", id);
    LearningObjective existingLearningObjective = learningObjectiveRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Fallo la actualización: Objetivo de aprendizaje no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Objetivo de aprendizaje no encontrado con ID: " + id);
        });

    // Lógica de negocio: Verificar si el estándar padre existe y si ha cambiado
    if (!existingLearningObjective.getStandard().getId().equals(request.getStandardId())) {
      Standard newStandard = standardRepository.findById(request.getStandardId())
          .orElseThrow(() -> {
            logger.warn(
                "Fallo la actualización del objetivo de aprendizaje: Nuevo estándar padre no encontrado con ID: {}",
                request.getStandardId());
            return new ResourceNotFoundException(
                "Nuevo estándar padre no encontrado con ID: " + request.getStandardId());
          });
      existingLearningObjective.setStandard(newStandard);
    }

    // Lógica de negocio: Validar unicidad del nombre, excluyendo el objetivo actual
    if (!existingLearningObjective.getName().equals(request.getName())
        && learningObjectiveRepository.existsByName(request.getName())) {
      logger.warn("Fallo la actualización: Ya existe un objetivo de aprendizaje con el nombre '{}'", request.getName());
      throw new IllegalArgumentException("Ya existe un objetivo de aprendizaje con el nombre: " + request.getName());
    }
    // Lógica de negocio: Validar unicidad del código, excluyendo el objetivo actual
    if (!existingLearningObjective.getCode().equals(request.getCode())
        && learningObjectiveRepository.existsByCode(request.getCode())) {
      logger.warn("Fallo la actualización: Ya existe un objetivo de aprendizaje con el código '{}'", request.getCode());
      throw new IllegalArgumentException("Ya existe un objetivo de aprendizaje con el código: " + request.getCode());
    }

    // Actualizar campos del objetivo de aprendizaje existente
    existingLearningObjective.setName(request.getName());
    existingLearningObjective.setDescription(request.getDescription()); // ✅ AGREGADO: Actualización de la descripción
    existingLearningObjective.setCode(request.getCode());
    // updatedAt se manejará automáticamente por los callbacks de JPA (@PreUpdate)

    LearningObjective updatedLearningObjective = learningObjectiveRepository.save(existingLearningObjective);
    logger.info("Objetivo de aprendizaje actualizado exitosamente con ID: {}", updatedLearningObjective.getId());

    return toDto(updatedLearningObjective);
  }

  /**
   * Elimina un objetivo de aprendizaje por su ID.
   * Nota: En este ejemplo, se realiza una eliminación física. Para un borrado
   * lógico,
   * se añadiría un campo 'activo' o 'deletedAt' a la entidad.
   *
   * @param id El ID del objetivo de aprendizaje a eliminar.
   * @throws ResourceNotFoundException si el objetivo de aprendizaje no es
   *                                   encontrado.
   */
  @Override
  @Transactional
  public void deleteLearningObjective(UUID id) {
    logger.info("Intentando eliminar objetivo de aprendizaje con ID: {}", id);
    if (!learningObjectiveRepository.existsById(id)) {
      logger.warn("Fallo la eliminación: Objetivo de aprendizaje no encontrado con ID: {}", id);
      throw new ResourceNotFoundException("Objetivo de aprendizaje no encontrado con ID: " + id);
    }
    learningObjectiveRepository.deleteById(id);
    logger.info("Objetivo de aprendizaje eliminado exitosamente con ID: {}", id);
  }

  /**
   * Método auxiliar para mapear una entidad LearningObjective a un DTO
   * LearningObjectiveResponse.
   * 
   * @param learningObjective La entidad LearningObjective a mapear.
   * @return El DTO LearningObjectiveResponse resultante.
   */
  private LearningObjectiveResponse toDto(LearningObjective learningObjective) {
    return LearningObjectiveResponse.builder()
        .id(learningObjective.getId())
        .name(learningObjective.getName())
        .description(learningObjective.getDescription()) // ✅ AGREGADO: Mapeo de la descripción a la respuesta
        .code(learningObjective.getCode())
        .standardId(learningObjective.getStandard().getId()) // Obtiene solo el ID del estándar padre
        .createdAt(learningObjective.getCreatedAt())
        .updatedAt(learningObjective.getUpdatedAt())
        .build();
  }
}
