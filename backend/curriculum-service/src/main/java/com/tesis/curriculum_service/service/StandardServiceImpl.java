package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository; // Necesario para buscar la competencia padre
import com.tesis.curriculum_service.repository.StandardRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importa @Transactional de Spring

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de lógica de negocio para la gestión de
 * estándares.
 * Maneja las operaciones CRUD, el mapeo entre DTOs y entidades, y la lógica de
 * negocio específica.
 */
@Service
@RequiredArgsConstructor
public class StandardServiceImpl implements StandardService {

  private static final Logger logger = LoggerFactory.getLogger(StandardServiceImpl.class);

  private final StandardRepository standardRepository;
  private final CompetencyRepository competencyRepository; // Inyección de dependencia para acceder a competencias

  /**
   * Crea un nuevo estándar.
   * Asegura que la competencia padre exista y que el nombre y código del estándar
   * sean únicos.
   * 
   * @param request DTO con los datos del nuevo estándar.
   * @return StandardResponse DTO del estándar creado.
   * @throws ResourceNotFoundException Si la competencia padre no es encontrada.
   * @throws IllegalArgumentException  Si el nombre o el código del estándar ya
   *                                   existen.
   */
  @Override
  @Transactional
  public StandardResponse createStandard(StandardRequest request) {
    logger.info("Intentando crear un nuevo estándar con nombre: {} para la competencia ID: {}", request.getName(),
        request.getCompetencyId());

    // Lógica de negocio: Verificar si la competencia padre existe
    Competency competency = competencyRepository.findById(request.getCompetencyId())
        .orElseThrow(() -> {
          logger.warn("Fallo la creación del estándar: Competencia padre no encontrada con ID: {}",
              request.getCompetencyId());
          return new ResourceNotFoundException("Competencia padre no encontrada con ID: " + request.getCompetencyId());
        });

    // Lógica de negocio: Asegurar unicidad del nombre
    if (standardRepository.existsByName(request.getName())) {
      logger.warn("Fallo la creación del estándar: Ya existe un estándar con el nombre '{}'", request.getName());
      throw new IllegalArgumentException("Ya existe un estándar con el nombre: " + request.getName());
    }
    // Lógica de negocio: Asegurar unicidad del código
    if (standardRepository.existsByCode(request.getCode())) {
      logger.warn("Fallo la creación del estándar: Ya existe un estándar con el código '{}'", request.getCode());
      throw new IllegalArgumentException("Ya existe un estándar con el código: " + request.getCode());
    }

    // Mapeo de DTO a Entidad
    Standard standard = Standard.builder()
        .name(request.getName())
        .description(request.getDescription())
        .code(request.getCode())
        .competency(competency) // Asocia el estándar con la competencia encontrada
        .build();

    Standard savedStandard = standardRepository.save(standard);
    logger.info("Estándar creado exitosamente con ID: {}", savedStandard.getId());

    // Mapeo de Entidad a DTO de Respuesta
    return toDto(savedStandard);
  }

  /**
   * Obtiene un estándar por su ID.
   * 
   * @param id El ID del estándar a buscar.
   * @return StandardResponse DTO del estándar encontrado.
   * @throws ResourceNotFoundException si el estándar no es encontrado.
   */
  @Override
  @Transactional(readOnly = true)
  public StandardResponse getStandardById(UUID id) {
    logger.info("Buscando estándar con ID: {}", id);
    Standard standard = standardRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Estándar no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Estándar no encontrado con ID: " + id);
        });
    logger.info("Estándar encontrado con ID: {}", id);
    return toDto(standard);
  }

  /**
   * Obtiene todos los estándares.
   * 
   * @return Lista de StandardResponse DTOs.
   */
  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getAllStandards() {
    logger.info("Obteniendo todos los estándares.");
    List<Standard> standards = standardRepository.findAll();
    List<StandardResponse> responses = standards.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    logger.info("Encontrados {} estándares.", responses.size());
    return responses;
  }

  /**
   * Obtiene todos los estándares asociados a una competencia específica.
   * 
   * @param competencyId El ID de la competencia padre.
   * @return Lista de StandardResponse DTOs.
   * @throws ResourceNotFoundException si la competencia padre no es encontrada.
   */
  @Override
  @Transactional(readOnly = true)
  public List<StandardResponse> getStandardsByCompetencyId(UUID competencyId) {
    logger.info("Buscando estándares para la competencia ID: {}", competencyId);
    // Opcional: Verificar si el competencyId existe antes de la consulta
    if (!competencyRepository.existsById(competencyId)) {
      logger.warn("Fallo la búsqueda de estándares: Competencia padre no encontrada con ID: {}", competencyId);
      throw new ResourceNotFoundException("Competencia padre no encontrada con ID: " + competencyId);
    }

    List<Standard> standards = standardRepository.findAllByCompetencyId(competencyId);
    List<StandardResponse> responses = standards.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    logger.info("Encontrados {} estándares para la competencia ID: {}.", responses.size(), competencyId);
    return responses;
  }

  /**
   * Actualiza un estándar existente.
   * Realiza validaciones de unicidad para el nombre y el código (excluyendo el
   * estándar actual).
   * 
   * @param id      El ID del estándar a actualizar.
   * @param request DTO con los datos para la actualización.
   * @return StandardResponse DTO del estándar actualizado.
   * @throws ResourceNotFoundException si el estándar no es encontrado o si la
   *                                   competencia padre no es encontrada.
   * @throws IllegalArgumentException  si el nombre o código actualizado ya existe
   *                                   en otro estándar.
   */
  @Override
  @Transactional
  public StandardResponse updateStandard(UUID id, StandardRequest request) {
    logger.info("Intentando actualizar estándar con ID: {}", id);
    Standard existingStandard = standardRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Fallo la actualización: Estándar no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Estándar no encontrado con ID: " + id);
        });

    // Lógica de negocio: Verificar si la competencia padre existe y si ha cambiado
    if (!existingStandard.getCompetency().getId().equals(request.getCompetencyId())) {
      Competency newCompetency = competencyRepository.findById(request.getCompetencyId())
          .orElseThrow(() -> {
            logger.warn("Fallo la actualización del estándar: Nueva competencia padre no encontrada con ID: {}",
                request.getCompetencyId());
            return new ResourceNotFoundException(
                "Nueva competencia padre no encontrada con ID: " + request.getCompetencyId());
          });
      existingStandard.setCompetency(newCompetency);
    }

    // Lógica de negocio: Validar unicidad del nombre, excluyendo el estándar actual
    if (!existingStandard.getName().equals(request.getName()) && standardRepository.existsByName(request.getName())) {
      logger.warn("Fallo la actualización: Ya existe un estándar con el nombre '{}'", request.getName());
      throw new IllegalArgumentException("Ya existe un estándar con el nombre: " + request.getName());
    }
    // Lógica de negocio: Validar unicidad del código, excluyendo el estándar actual
    if (!existingStandard.getCode().equals(request.getCode()) && standardRepository.existsByCode(request.getCode())) {
      logger.warn("Fallo la actualización: Ya existe un estándar con el código '{}'", request.getCode());
      throw new IllegalArgumentException("Ya existe un estándar con el código: " + request.getCode());
    }

    // Actualizar campos del estándar existente
    existingStandard.setName(request.getName());
    existingStandard.setDescription(request.getDescription());
    existingStandard.setCode(request.getCode());
    // updatedAt se manejará automáticamente por los callbacks de JPA (@PreUpdate)

    Standard updatedStandard = standardRepository.save(existingStandard);
    logger.info("Estándar actualizado exitosamente con ID: {}", updatedStandard.getId());

    return toDto(updatedStandard);
  }

  /**
   * Elimina un estándar por su ID.
   * Nota: En este ejemplo, se realiza una eliminación física. Para un borrado
   * lógico,
   * se añadiría un campo 'activo' o 'deletedAt' a la entidad.
   *
   * @param id El ID del estándar a eliminar.
   * @throws ResourceNotFoundException si el estándar no es encontrado.
   */
  @Override
  @Transactional
  public void deleteStandard(UUID id) {
    logger.info("Intentando eliminar estándar con ID: {}", id);
    if (!standardRepository.existsById(id)) {
      logger.warn("Fallo la eliminación: Estándar no encontrado con ID: {}", id);
      throw new ResourceNotFoundException("Estándar no encontrado con ID: " + id);
    }
    standardRepository.deleteById(id);
    logger.info("Estándar eliminado exitosamente con ID: {}", id);
  }

  /**
   * Método auxiliar para mapear una entidad Standard a un DTO StandardResponse.
   * 
   * @param standard La entidad Standard a mapear.
   * @return El DTO StandardResponse resultante.
   */
  private StandardResponse toDto(Standard standard) {
    return StandardResponse.builder()
        .id(standard.getId())
        .name(standard.getName())
        .description(standard.getDescription())
        .code(standard.getCode())
        .competencyId(standard.getCompetency().getId()) // Obtiene solo el ID de la competencia padre
        .createdAt(standard.getCreatedAt())
        .updatedAt(standard.getUpdatedAt())
        .build();
  }
}
