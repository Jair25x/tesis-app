package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import com.tesis.curriculum_service.service.CompetencyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException; // Importar para manejar duplicados
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime; // Necesario si manejas 'deletedAt' o 'createdAt/updatedAt' manualmente (usualmente @CreationTimestamp/@UpdateTimestamp)
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional // Asegura que las operaciones de base de datos se manejen en una transacción
public class CompetencyServiceImpl implements CompetencyService {

  private final CompetencyRepository competencyRepository;
  private final CurriculumRepository curriculumRepository;

  /**
   * Crea una nueva competencia.
   * Valida que el currículo padre exista y que el código de la competencia sea
   * único.
   *
   * @param competencyRequest El DTO de solicitud de la competencia.
   * @return El DTO de respuesta de la competencia creada.
   * @throws ResourceNotFoundException si el currículo padre no es encontrado.
   * @throws IllegalArgumentException  si ya existe una competencia activa con el
   *                                   mismo código.
   */
  @Override
  public CompetencyResponse createCompetency(CompetencyRequest competencyRequest) {
    log.info("Attempting to create new competency with code: {}", competencyRequest.getCode()); // ✅ Logging en inglés,
                                                                                                // más común

    // Validar unicidad del código antes de intentar guardar
    if (competencyRepository.existsByCode(competencyRequest.getCode())) {
      log.warn("Competency creation failed: An active competency with code '{}' already exists.",
          competencyRequest.getCode());
      throw new IllegalArgumentException("Ya existe una competencia con el código: " + competencyRequest.getCode());
    }

    // Buscar el currículo padre
    Curriculum curriculum = curriculumRepository.findById(competencyRequest.getCurriculumId())
        .orElseThrow(() -> {
          log.warn("Parent curriculum not found with ID: {}", competencyRequest.getCurriculumId());
          return new ResourceNotFoundException("Curriculum", "id", competencyRequest.getCurriculumId());
        });

    Competency competency = toEntity(competencyRequest); // Mapeo manual
    competency.setCurriculum(curriculum); // Asignar el currículo encontrado
    competency.setActive(true); // ✅ EXPLÍCITO: Aseguramos que se crea como activo

    try {
      Competency savedCompetency = competencyRepository.save(competency);
      log.info("Competency created successfully, ID: {}", savedCompetency.getId());
      return toDto(savedCompetency);
    } catch (DataIntegrityViolationException e) {
      // ✅ ULTIMA LÍNEA DE DEFENSA: Capturar si la DB lanza la excepción por unicidad.
      // Esto es útil en escenarios de alta concurrencia donde existsByCode podría
      // fallar.
      // Para identificar la violación específica, a veces es necesario revisar el
      // mensaje de la excepción o el constraint name.
      // Si el nombre de tu constraint de unicidad en la DB para 'code' es
      // 'UK_COMPETENCY_CODE', puedes usarlo.
      // Sin esa información, un mensaje genérico es aceptable.
      log.warn("Competency creation failed due to unique code constraint violation in DB for code '{}'",
          competencyRequest.getCode(), e);
      throw new IllegalArgumentException("Ya existe una competencia con el código: " + competencyRequest.getCode(), e);
    }
  }

  /**
   * Obtiene una competencia por su ID.
   *
   * @param id El ID de la competencia.
   * @return El DTO de respuesta de la competencia encontrada.
   * @throws ResourceNotFoundException si la competencia no es encontrada (ya
   *                                   considera @Where).
   */
  @Override
  @Transactional(readOnly = true) // Solo lectura, optimiza transacciones
  public CompetencyResponse getCompetencyById(UUID id) {
    log.info("Searching for competency with ID: {}", id);
    // Gracias a @Where(clause = "active = true") en la entidad, findById solo
    // buscará entre los activos.
    Competency competency = competencyRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Competency not found with ID: {}", id);
          return new ResourceNotFoundException("Competency", "id", id);
        });
    log.info("Competency found: {}", competency.getName());
    return toDto(competency);
  }

  /**
   * Obtiene todas las competencias activas.
   *
   * @return Una lista de DTOs de respuesta de competencias.
   */
  @Override
  @Transactional(readOnly = true)
  public List<CompetencyResponse> getAllCompetencies() {
    log.info("Retrieving all active competencies.");
    // Gracias a @Where(clause = "active = true") en la entidad, findAll solo traerá
    // los activos.
    List<Competency> competencies = competencyRepository.findAll();
    List<CompetencyResponse> responses = competencies.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
    log.info("Found {} active competencies.", responses.size());
    return responses;
  }

  /**
   * Obtiene todas las competencias activas asociadas a un currículo específico.
   *
   * @param curriculumId El ID del currículo padre.
   * @return Una lista de DTOs de respuesta de competencias.
   * @throws ResourceNotFoundException si el currículo padre no es encontrado.
   */
  @Override
  @Transactional(readOnly = true)
  public List<CompetencyResponse> getCompetenciesByCurriculumId(UUID curriculumId) {
    log.info("Retrieving competencies for curriculum with ID: {}", curriculumId);
    // Validar que el curriculum padre exista y esté activo antes de buscar sus
    // competencias
    // existsById también respeta @Where si Curriculum lo tiene (buena práctica)
    if (!curriculumRepository.existsById(curriculumId)) {
      throw new ResourceNotFoundException("Curriculum", "id", curriculumId);
    }
    // findByCurriculumId también respeta @Where en Competency
    return competencyRepository.findByCurriculumId(curriculumId).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  /**
   * Actualiza una competencia existente.
   * Valida que la competencia y el currículo padre existan y que el código sea
   * único (si cambia).
   *
   * @param id                El ID de la competencia a actualizar.
   * @param competencyRequest El DTO de solicitud con los datos actualizados.
   * @return El DTO de respuesta de la competencia actualizada.
   * @throws ResourceNotFoundException si la competencia o el currículo padre no
   *                                   son encontrados.
   * @throws IllegalArgumentException  si ya existe otra competencia activa con el
   *                                   mismo código.
   */
  @Override
  public CompetencyResponse updateCompetency(UUID id, CompetencyRequest competencyRequest) {
    log.info("Attempting to update competency with ID: {}", id);
    Competency existingCompetency = competencyRepository.findById(id) // @Where(active = true) se aplica aquí
        .orElseThrow(() -> {
          log.warn("Update failed: Competency not found with ID: {}", id);
          return new ResourceNotFoundException("Competency", "id", id);
        });

    // Validar que el código de la competencia sea único si ha cambiado
    if (!existingCompetency.getCode().equalsIgnoreCase(competencyRequest.getCode())) {
      // Asegúrate de que existsByCode también respete @Where si la entidad Competency
      // lo usa
      if (competencyRepository.existsByCode(competencyRequest.getCode())) {
        log.warn("Update failed: Another active competency with code '{}' already exists.",
            competencyRequest.getCode());
        throw new IllegalArgumentException("Ya existe una competencia con el código: " + competencyRequest.getCode());
      }
    }

    // Validar que el currículo padre exista y esté activo
    Curriculum curriculum = curriculumRepository.findById(competencyRequest.getCurriculumId())
        .orElseThrow(() -> {
          log.warn("Update failed: Parent curriculum not found with ID: {}",
              competencyRequest.getCurriculumId());
          return new ResourceNotFoundException("Curriculum", "id", competencyRequest.getCurriculumId());
        });

    // Actualizar campos manualmente
    existingCompetency.setName(competencyRequest.getName());
    existingCompetency.setDescription(competencyRequest.getDescription());
    existingCompetency.setCode(competencyRequest.getCode());
    existingCompetency.setCurriculum(curriculum); // Actualizar el currículo asociado si ha cambiado
    // updatedAt se manejará automáticamente por los callbacks de JPA (@PreUpdate)

    try {
      Competency updatedCompetency = competencyRepository.save(existingCompetency);
      log.info("Competency updated successfully, ID: {}", updatedCompetency.getId());
      return toDto(updatedCompetency);
    } catch (DataIntegrityViolationException e) {
      // ✅ ULTIMA LÍNEA DE DEFENSA para la actualización
      log.warn("Competency update failed due to unique code constraint violation in DB for code '{}'",
          competencyRequest.getCode(), e);
      throw new IllegalArgumentException("Ya existe una competencia con el código: " + competencyRequest.getCode(), e);
    }
  }

  /**
   * Elimina lógicamente una competencia por su ID.
   * Utiliza el mecanismo de Soft Delete configurado en la entidad Competency
   * mediante @SQLDelete y @Where.
   *
   * @param id El ID de la competencia a eliminar lógicamente.
   * @throws ResourceNotFoundException si la competencia no es encontrada o ya
   *                                   está inactiva.
   */
  @Override
  public void deleteCompetency(UUID id) {
    log.info("Attempting to logically delete competency with ID: {}", id);

    // findById respeta @Where, por lo que solo buscará competencias activas
    Competency competencyToDelete = competencyRepository.findById(id)
        .orElseThrow(() -> {
          log.warn("Deletion failed: Competency not found or already inactive with ID: {}", id);
          return new ResourceNotFoundException("Competency not found with ID: " + id);
        });

    // Al llamar a deleteById, @SQLDelete se encargará de establecer active = false
    // y deletedAt = NOW()
    competencyRepository.deleteById(id);
    log.info("Competency marked as inactive (logically deleted) with ID: {}", id);
  }

  /**
   * Mapea un DTO CompetencyRequest a una entidad Competency.
   *
   * @param request El DTO de solicitud de la competencia.
   * @return La entidad Competency.
   */
  private Competency toEntity(CompetencyRequest request) {
    return Competency.builder()
        .name(request.getName())
        .description(request.getDescription())
        .code(request.getCode())
        // .curriculum se setea aparte en createCompetency porque necesita la entidad
        // Curriculum
        .active(true) // Se asume que al crear, siempre está activo
        .build();
  }

  /**
   * Mapea una entidad Competency a un DTO CompetencyResponse.
   * No se incluyen 'active' ni 'deletedAt' en el DTO de respuesta, siguiendo el
   * patrón de CurriculumResponse.
   *
   * @param competency La entidad Competency.
   * @return El DTO CompetencyResponse.
   */
  private CompetencyResponse toDto(Competency competency) {
    return CompetencyResponse.builder()
        .id(competency.getId())
        .name(competency.getName())
        .description(competency.getDescription())
        .code(competency.getCode())
        .curriculumId(competency.getCurriculum() != null ? competency.getCurriculum().getId() : null)
        .curriculumName(competency.getCurriculum() != null ? competency.getCurriculum().getName() : null)
        .createdAt(competency.getCreatedAt())
        .updatedAt(competency.getUpdatedAt())
        .build();
  }
}