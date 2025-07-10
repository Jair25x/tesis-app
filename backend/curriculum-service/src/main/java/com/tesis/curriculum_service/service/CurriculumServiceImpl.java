package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.dto.CurriculumStatsResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // Necesario para 'deletedAt'
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de lógica de negocio para la gestión de
 * currículos.
 * Maneja las operaciones CRUD, el mapeo entre DTOs y entidades, y la lógica de
 * negocio específica, incluyendo el borrado lógico.
 */
@Service
@RequiredArgsConstructor
public class CurriculumServiceImpl implements CurriculumService {

  private static final Logger logger = LoggerFactory.getLogger(CurriculumServiceImpl.class);

  private final CurriculumRepository curriculumRepository;

  @Override
  @Transactional
  public CurriculumResponse createCurriculum(CurriculumRequest request) {
    logger.info("Intentando crear un nuevo currículo con nombre: {} y código: {}", request.getName(),
        request.getCode());

    if (curriculumRepository.existsByName(request.getName())) {
      logger.warn("Falló la creación del currículo: Ya existe un currículo con el nombre '{}'", request.getName());
      throw new IllegalArgumentException("Ya existe un currículo con el nombre: " + request.getName());
    }
    if (curriculumRepository.existsByCode(request.getCode())) {
      logger.warn("Falló la creación del currículo: Ya existe un currículo con el código '{}'", request.getCode());
      throw new IllegalArgumentException("Ya existe un currículo con el código: " + request.getCode());
    }

    Curriculum curriculum = Curriculum.builder()
        .name(request.getName())
        .description(request.getDescription())
        .code(request.getCode())
        .grade(request.getGrade())
        .active(true) // ✅ EXPLICITO: Aseguramos que se crea como activo
        .build();

    Curriculum savedCurriculum = curriculumRepository.save(curriculum);
    logger.info("Currículo creado exitosamente con ID: {}", savedCurriculum.getId());

    return toDto(savedCurriculum);
  }

  @Override
  @Transactional(readOnly = true)
  public CurriculumResponse getCurriculumById(UUID id) {
    logger.info("Buscando currículo con ID: {}", id);
    // Gracias a @Where(clause = "active = true") en la entidad, findById solo
    // buscará entre los activos.
    Curriculum curriculum = curriculumRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Currículo no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Currículo no encontrado con ID: " + id);
        });
    logger.info("Currículo encontrado con ID: {}", id);
    return toDto(curriculum);
  }

  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getAllCurriculums() {
    logger.info("Obteniendo todos los currículos activos.");
    // Gracias a @Where(clause = "active = true") en la entidad, findAll solo traerá
    // los activos.
    List<Curriculum> curriculums = curriculumRepository.findAll();
    List<CurriculumResponse> responses = curriculums.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    logger.info("Encontrados {} currículos activos.", responses.size());
    return responses;
  }

  @Override
  @Transactional
  public CurriculumResponse updateCurriculum(UUID id, CurriculumRequest request) {
    logger.info("Intentando actualizar currículo con ID: {}", id);
    Curriculum existingCurriculum = curriculumRepository.findById(id) // @Where(active = true) se aplica aquí
        .orElseThrow(() -> {
          logger.warn("Fallo la actualización: Currículo no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Currículo no encontrado con ID: " + id);
        });

    if (!existingCurriculum.getName().equalsIgnoreCase(request.getName())
        && curriculumRepository.findByNameIgnoreCase(request.getName())
            .filter(c -> !c.getId().equals(id))
            .isPresent()) {
      throw new IllegalArgumentException("Ya existe un currículo con el nombre: " + request.getName());
    }
    if (!existingCurriculum.getCode().equals(request.getCode())
        && curriculumRepository.existsByCode(request.getCode())) {
      logger.warn("Fallo la actualización: Ya existe un currículo con el código '{}'", request.getCode());
      throw new IllegalArgumentException("Ya existe un currículo con el código: " + request.getCode());
    }

    existingCurriculum.setName(request.getName());
    existingCurriculum.setDescription(request.getDescription());
    existingCurriculum.setCode(request.getCode());
    existingCurriculum.setGrade(request.getGrade());
    // updatedAt se manejará automáticamente por los callbacks de JPA (@PreUpdate)

    Curriculum updatedCurriculum = curriculumRepository.save(existingCurriculum);
    logger.info("Currículo actualizado exitosamente con ID: {}", updatedCurriculum.getId());

    return toDto(updatedCurriculum);
  }

  /**
   * Elimina lógicamente un currículo por su ID.
   * Utiliza el mecanismo de Soft Delete configurado en la entidad Curriculum
   * mediante @SQLDelete y @Where.
   * Adicionalmente, actualiza el campo 'deletedAt'.
   *
   * @param id El ID del currículo a eliminar lógicamente.
   * @throws ResourceNotFoundException si el currículo no es encontrado o ya está
   *                                   inactivo.
   */
  @Override
  @Transactional // Crucial para asegurar que la eliminación se maneje correctamente.
  public void deleteCurriculum(UUID id) {
    logger.info("Intentando eliminar lógicamente currículo con ID: {}", id);

    // Primero, obtener el currículo para poder establecer deletedAt
    // Usamos findById que gracias a @Where, solo buscará activos.
    Curriculum curriculumToDelete = curriculumRepository.findById(id)
        .orElseThrow(() -> {
          logger.warn("Fallo la eliminación: Currículo no encontrado con ID: {}", id);
          return new ResourceNotFoundException("Currículo no encontrado con ID: " + id);
        });

    // ✅ NUEVO: Establecer la fecha de borrado lógico
    curriculumToDelete.setDeletedAt(LocalDateTime.now());
    // El campo 'active' será establecido a 'false' automáticamente por @SQLDelete
    // cuando llamemos a deleteById, pero si lo hacemos vía save aquí, debemos ser
    // explícitos
    // o asegurarnos de que la entidad se refresca o que el update ocurre.
    // Para asegurar que `deletedAt` se persista junto con `active=false`,
    // es más robusto hacer el update explícito aquí si es que el `deleteById`
    // solo cambia `active`.

    // Opción 1: Si @SQLDelete es el único que maneja el 'active', entonces
    // simplemente llama deleteById
    // y @SQLDelete se encargará de 'active = false'. Para `deletedAt`, debemos
    // persistirlo.
    // La forma más sencilla y robusta es cargar la entidad, actualizar los campos,
    // y luego guardar.
    // Aunque @SQLDelete está configurado, si modificamos la entidad y la guardamos,
    // esto es más directo para establecer `deletedAt`.

    // Marcamos como inactivo y establecemos la fecha de eliminación.
    curriculumToDelete.setActive(false); // ✅ Establecemos explícitamente a false
    curriculumRepository.save(curriculumToDelete); // Guardamos los cambios, esto disparará un UPDATE

    // Si solo se llamara `curriculumRepository.deleteById(id);`
    // Hibernate ejecutaría el SQL de @SQLDelete (active = false).
    // Pero no establecería `deletedAt` a menos que se haga en un @PreRemove
    // listener
    // o se modifique el @SQLDelete para incluirlo, lo cual es más complejo.
    // La aproximación actual (findById, setDeletedAt, setActive, save) es más
    // directa
    // y clara para manejar el `deletedAt` en una operación de "delete lógico".

    logger.info("Currículo marcado como inactivo (eliminado lógicamente) con ID: {}", id);
  }

  @Override
  @Transactional(readOnly = true)
  public List<CurriculumResponse> getCurriculaByGrade(String grade) {

    if (grade == null || grade.trim().isEmpty()) {
      logger.warn("Grado proporcionado es nulo o vacío.");
      throw new IllegalArgumentException("El grado no puede estar vacío.");
    }
    logger.info("Obteniendo currículos activos para el grado: {}", grade);
    List<Curriculum> curriculums = curriculumRepository.findByGrade(grade);
    return curriculums.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public CurriculumStatsResponse getCurriculumStats() {
    logger.info("Generando estadísticas del currículo activo.");
    long totalActiveCurriculums = curriculumRepository.count(); // @Where(active = true) se aplica a count() también.
    // Si necesitas el total de currículos incluyendo los inactivos para alguna
    // estadística:
    // long totalAllCurriculums = curriculumRepository.countAllIncludingInactive();
    // // Necesitarías un método custom con @Query

    return CurriculumStatsResponse.builder()
        .totalCurriculums(totalActiveCurriculums) // Cuenta solo los activos
        .totalCompetencies(0)
        .totalStandards(0)
        .totalLearningObjectives(0)
        .build();
  }

  private CurriculumResponse toDto(Curriculum curriculum) {
    return CurriculumResponse.builder()
        .id(curriculum.getId())
        .name(curriculum.getName())
        .description(curriculum.getDescription())
        .code(curriculum.getCode())
        .grade(curriculum.getGrade())
        .createdAt(curriculum.getCreatedAt())
        .updatedAt(curriculum.getUpdatedAt())
        // No es necesario incluir 'active' ni 'deletedAt' en el DTO de respuesta
        // a menos que la lógica de negocio lo requiera para el cliente.
        .build();
  }
}
