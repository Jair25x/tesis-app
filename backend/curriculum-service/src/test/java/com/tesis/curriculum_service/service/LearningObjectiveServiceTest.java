package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.LearningObjectiveRequest;
import com.tesis.curriculum_service.dto.LearningObjectiveResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.repository.StandardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Clase de pruebas unitarias para {@link LearningObjectiveServiceImpl}.
 * Utiliza Mockito para simular el comportamiento de
 * {@link LearningObjectiveRepository}
 * y {@link StandardRepository}, probando la lógica de negocio del servicio
 * de manera aislada.
 */
@ExtendWith(MockitoExtension.class) // Habilita la integración de Mockito con JUnit 5.
public class LearningObjectiveServiceTest {

  @Mock // Mock del repositorio de LearningObjective.
  private LearningObjectiveRepository learningObjectiveRepository;

  @Mock // Mock del repositorio de Standard, necesario para validar la existencia del
        // padre.
  private StandardRepository standardRepository;

  @InjectMocks // Inyecta los mocks en la instancia de LearningObjectiveServiceImpl.
  private LearningObjectiveServiceImpl learningObjectiveService;

  private Curriculum curriculum; // Objeto Curriculum de prueba
  private Competency competency; // Objeto Competency de prueba
  private Standard standard; // Objeto Standard de prueba
  private LearningObjective learningObjective; // Objeto LearningObjective de prueba
  private LearningObjectiveRequest learningObjectiveRequest; // Objeto LearningObjectiveRequest de prueba

  private UUID testCurriculumId; // ID de prueba para el currículo
  private UUID testCompetencyId; // ID de prueba para la competencia
  private UUID testStandardId; // ID de prueba para el estándar
  private UUID testLearningObjectiveId; // ID de prueba para el objetivo de aprendizaje

  @BeforeEach // Se ejecuta antes de cada método de prueba.
  void setUp() {
    testCurriculumId = UUID.randomUUID();
    testCompetencyId = UUID.randomUUID();
    testStandardId = UUID.randomUUID();
    testLearningObjectiveId = UUID.randomUUID();

    // Inicializa un objeto Curriculum de prueba.
    curriculum = Curriculum.builder()
        .id(testCurriculumId)
        .name("Matemática 6to Grado")
        .description("Currículo completo de matemática para sexto grado de primaria")
        .code("MATH-6")
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    // Inicializa un objeto Competency de prueba, asociado al curriculum.
    competency = Competency.builder()
        .id(testCompetencyId)
        .name("Resuelve problemas de cantidad")
        .description("Implica saber aplicar conceptos de cantidad")
        .code("C-MATH-01")
        .curriculum(curriculum)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    // Inicializa un objeto Standard de prueba, asociado a la competency.
    standard = Standard.builder()
        .id(testStandardId)
        .name("Establece relaciones entre datos")
        .description("Relaciona datos y acciones de agregar, quitar, comparar e igualar cantidades.")
        .code("S-C-MATH-01-01")
        .competency(competency) // Asocia al objeto competency
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    // Inicializa un objeto LearningObjective de prueba, asociado al standard.
    learningObjective = LearningObjective.builder()
        .id(testLearningObjectiveId)
        .name("Identifica y utiliza números primos y compuestos en problemas.")
        .description("Aplica criterios de divisibilidad.") // ✅ AGREGADO: Descripción en el objeto de prueba
        .code("LO-S-C-MATH-01-01-01")
        .standard(standard) // Asocia al objeto standard
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();

    // Inicializa un objeto LearningObjectiveRequest de prueba.
    learningObjectiveRequest = LearningObjectiveRequest.builder()
        .name("Identifica y utiliza números primos y compuestos en problemas.")
        .description("Aplica criterios de divisibilidad.") // ✅ AGREGADO: Descripción en el request de prueba
        .code("LO-S-C-MATH-01-01-01")
        .standardId(testStandardId) // Asocia al ID del estándar de prueba
        .build();
  }

  @Test
  @DisplayName("Debe crear un objetivo de aprendizaje exitosamente")
  void shouldCreateLearningObjectiveSuccessfully() {
    // Configura el comportamiento de los mocks:
    // 1. Cuando se busque el estándar padre, devolverlo.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    // 2. Cuando se verifique el nombre y código del objetivo de aprendizaje,
    // indicar que no existen.
    when(learningObjectiveRepository.existsByName(learningObjectiveRequest.getName())).thenReturn(false);
    when(learningObjectiveRepository.existsByCode(learningObjectiveRequest.getCode())).thenReturn(false);
    // 3. Cuando se guarde el objetivo de aprendizaje, devolver el objetivo de
    // aprendizaje de prueba.
    when(learningObjectiveRepository.save(any(LearningObjective.class))).thenReturn(learningObjective);

    // Llama al método de servicio.
    LearningObjectiveResponse response = learningObjectiveService.createLearningObjective(learningObjectiveRequest);

    // Verifica las aserciones:
    assertNotNull(response);
    assertEquals(learningObjective.getName(), response.getName());
    assertEquals(learningObjective.getDescription(), response.getDescription()); // ✅ AGREGADO: Verificación de la
                                                                                 // descripción
    assertEquals(learningObjective.getCode(), response.getCode());
    assertEquals(testStandardId, response.getStandardId());
    assertNotNull(response.getId());

    // Verifica que los métodos del mock fueron llamados:
    verify(standardRepository, times(1)).findById(testStandardId);
    verify(learningObjectiveRepository, times(1)).existsByName(learningObjectiveRequest.getName());
    verify(learningObjectiveRepository, times(1)).existsByCode(learningObjectiveRequest.getCode());
    verify(learningObjectiveRepository, times(1)).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el estándar padre no es encontrado al crear objetivo")
  void shouldThrowExceptionWhenStandardNotFoundOnCreate() {
    // Configura el mock: el estándar padre no existe.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.createLearningObjective(learningObjectiveRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Estándar padre no encontrado con ID: " + testStandardId, thrown.getMessage());

    // Verifica que los métodos subsiguientes no fueron llamados.
    verify(learningObjectiveRepository, never()).existsByName(anyString());
    verify(learningObjectiveRepository, never()).existsByCode(anyString());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el nombre del objetivo ya existe al crear")
  void shouldThrowExceptionWhenLearningObjectiveNameExistsOnCreate() {
    // Configura el mock: el estándar padre existe, pero el nombre del objetivo ya
    // existe.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    when(learningObjectiveRepository.existsByName(learningObjectiveRequest.getName())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      learningObjectiveService.createLearningObjective(learningObjectiveRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un objetivo de aprendizaje con el nombre: " + learningObjectiveRequest.getName(),
        thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(learningObjectiveRepository, times(1)).existsByName(learningObjectiveRequest.getName());
    verify(learningObjectiveRepository, never()).existsByCode(anyString());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el código del objetivo ya existe al crear")
  void shouldThrowExceptionWhenLearningObjectiveCodeExistsOnCreate() {
    // Configura el mock: el estándar padre existe, el nombre no existe, pero el
    // código sí.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    when(learningObjectiveRepository.existsByName(learningObjectiveRequest.getName())).thenReturn(false);
    when(learningObjectiveRepository.existsByCode(learningObjectiveRequest.getCode())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      learningObjectiveService.createLearningObjective(learningObjectiveRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un objetivo de aprendizaje con el código: " + learningObjectiveRequest.getCode(),
        thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(learningObjectiveRepository, times(1)).existsByName(learningObjectiveRequest.getName());
    verify(learningObjectiveRepository, times(1)).existsByCode(learningObjectiveRequest.getCode());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe obtener un objetivo de aprendizaje por ID exitosamente")
  void shouldGetLearningObjectiveByIdSuccessfully() {
    // Configura el mock para devolver el objetivo de aprendizaje cuando se busca
    // por ID.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.of(learningObjective));

    // Llama al método de servicio.
    LearningObjectiveResponse response = learningObjectiveService.getLearningObjectiveById(testLearningObjectiveId);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(learningObjective.getId(), response.getId());
    assertEquals(learningObjective.getName(), response.getName());
    assertEquals(learningObjective.getDescription(), response.getDescription()); // ✅ AGREGADO: Verificación de la
                                                                                 // descripción
    assertEquals(testStandardId, response.getStandardId());

    // Verifica que el método del mock fue llamado.
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el objetivo no se encuentra por ID")
  void shouldThrowExceptionWhenLearningObjectiveNotFoundById() {
    // Configura el mock para devolver Optional.empty() (objetivo no encontrado).
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.getLearningObjectiveById(testLearningObjectiveId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Objetivo de aprendizaje no encontrado con ID: " + testLearningObjectiveId, thrown.getMessage());
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
  }

  @Test
  @DisplayName("Debe obtener todos los objetivos de aprendizaje exitosamente")
  void shouldGetAllLearningObjectivesSuccessfully() {
    // Crea una lista de objetivos de aprendizaje de prueba.
    LearningObjective anotherLearningObjective = LearningObjective.builder()
        .id(UUID.randomUUID())
        .name("Resuelve problemas de proporcionalidad.")
        .description("Calcula razones y proporciones.") // ✅ AGREGADO: Descripción para otro objetivo
        .code("LO-S-C-MATH-01-01-02")
        .standard(standard)
        .build();
    List<LearningObjective> learningObjectives = Arrays.asList(learningObjective, anotherLearningObjective);

    // Configura el mock para devolver la lista de objetivos de aprendizaje.
    when(learningObjectiveRepository.findAll()).thenReturn(learningObjectives);

    // Llama al método de servicio.
    List<LearningObjectiveResponse> responses = learningObjectiveService.getAllLearningObjectives();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(learningObjective.getName(), responses.get(0).getName());
    assertEquals(learningObjective.getDescription(), responses.get(0).getDescription()); // ✅ AGREGADO
    assertEquals(anotherLearningObjective.getName(), responses.get(1).getName());
    assertEquals(anotherLearningObjective.getDescription(), responses.get(1).getDescription()); // ✅ AGREGADO
    assertEquals(testStandardId, responses.get(0).getStandardId());

    // Verifica que el método del mock fue llamado.
    verify(learningObjectiveRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe devolver una lista vacía si no hay objetivos de aprendizaje")
  void shouldReturnEmptyListWhenNoLearningObjectivesExist() {
    // Configura el mock para devolver una lista vacía.
    when(learningObjectiveRepository.findAll()).thenReturn(Arrays.asList());

    // Llama al método de servicio.
    List<LearningObjectiveResponse> responses = learningObjectiveService.getAllLearningObjectives();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertTrue(responses.isEmpty());

    // Verifica que el método del mock fue llamado.
    verify(learningObjectiveRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe obtener objetivos de aprendizaje por ID de estándar exitosamente")
  void shouldGetLearningObjectivesByStandardIdSuccessfully() {
    // Configura el mock: el estándar padre existe.
    when(standardRepository.existsById(testStandardId)).thenReturn(true);
    // Crea una lista de objetivos de aprendizaje para este estándar.
    LearningObjective lo1 = LearningObjective.builder().id(UUID.randomUUID()).name("LO1").description("Desc LO1")
        .code("LO1").standard(standard).build(); // ✅ AGREGADO
    LearningObjective lo2 = LearningObjective.builder().id(UUID.randomUUID()).name("LO2").description("Desc LO2")
        .code("LO2").standard(standard).build(); // ✅ AGREGADO
    List<LearningObjective> learningObjectivesForStandard = Arrays.asList(lo1, lo2);

    // Configura el mock para devolver los objetivos de aprendizaje asociados al ID
    // del estándar.
    when(learningObjectiveRepository.findAllByStandardId(testStandardId)).thenReturn(learningObjectivesForStandard);

    // Llama al método de servicio.
    List<LearningObjectiveResponse> responses = learningObjectiveService
        .getLearningObjectivesByStandardId(testStandardId);

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(testStandardId, responses.get(0).getStandardId());
    assertEquals("LO1", responses.get(0).getName());
    assertEquals("Desc LO1", responses.get(0).getDescription()); // ✅ AGREGADO

    // Verifica que los métodos del mock fueron llamados.
    verify(standardRepository, times(1)).existsById(testStandardId);
    verify(learningObjectiveRepository, times(1)).findAllByStandardId(testStandardId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el estándar padre no existe al buscar por estándar ID")
  void shouldThrowExceptionWhenStandardNotFoundOnFindByStandardId() {
    // Configura el mock: el estándar padre no existe.
    when(standardRepository.existsById(testStandardId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.getLearningObjectivesByStandardId(testStandardId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Estándar padre no encontrado con ID: " + testStandardId, thrown.getMessage());

    // Verifica que findAllByStandardId nunca fue llamado.
    verify(learningObjectiveRepository, never()).findAllByStandardId(any(UUID.class));
  }

  @Test
  @DisplayName("Debe actualizar un objetivo de aprendizaje exitosamente")
  void shouldUpdateLearningObjectiveSuccessfully() {
    // Crea un request de actualización con nuevos datos.
    LearningObjectiveRequest updatedRequest = LearningObjectiveRequest.builder()
        .name("Actualizado: Identifica patrones numéricos")
        .description("Descripción actualizada del objetivo.") // ✅ AGREGADO: Descripción en request de actualización
        .code("LO-S-C-MATH-01-01-01-UPD")
        .standardId(testStandardId) // Mismo estándar padre para esta prueba.
        .build();

    // Crea una entidad de objetivo de aprendizaje actualizada que el save debería
    // devolver.
    LearningObjective updatedLearningObjective = LearningObjective.builder()
        .id(testLearningObjectiveId)
        .name(updatedRequest.getName())
        .description(updatedRequest.getDescription()) // ✅ AGREGADO: Descripción en entidad actualizada
        .code(updatedRequest.getCode())
        .standard(standard) // Asegúrate de que el objeto standard original se usa aquí
        .createdAt(learningObjective.getCreatedAt())
        .updatedAt(LocalDateTime.now())
        .build();

    // Configura los mocks:
    // 1. findById devuelve el objetivo de aprendizaje existente.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.of(learningObjective));
    // 2. existsByName y existsByCode devuelven false (no hay conflictos de
    // unicidad).
    when(learningObjectiveRepository.existsByName(updatedRequest.getName())).thenReturn(false);
    when(learningObjectiveRepository.existsByCode(updatedRequest.getCode())).thenReturn(false);
    // ✅ CORRECCIÓN: El standardId en la request es el mismo, así que findById no se
    // llama en la lógica del servicio.
    // REMOVIDO:
    // when(standardRepository.findById(updatedRequest.getStandardId())).thenReturn(Optional.of(standard));
    // 3. save devuelve la entidad actualizada.
    when(learningObjectiveRepository.save(any(LearningObjective.class))).thenReturn(updatedLearningObjective);

    // Llama al método de servicio.
    LearningObjectiveResponse response = learningObjectiveService.updateLearningObjective(testLearningObjectiveId,
        updatedRequest);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(testLearningObjectiveId, response.getId());
    assertEquals(updatedRequest.getName(), response.getName());
    assertEquals(updatedRequest.getDescription(), response.getDescription()); // ✅ AGREGADO: Verificación de la
                                                                              // descripción
    assertEquals(updatedRequest.getCode(), response.getCode());
    assertEquals(updatedRequest.getStandardId(), response.getStandardId());

    // Verifica que los métodos del mock fueron llamados.
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
    // El nombre y código son diferentes al original, por lo tanto existsByName/Code
    // SÍ deberían llamarse.
    verify(learningObjectiveRepository, times(1)).existsByName(updatedRequest.getName());
    verify(learningObjectiveRepository, times(1)).existsByCode(updatedRequest.getCode());
    // ✅ CORRECCIÓN: Verify que standardRepository.findById NO se llama.
    verify(standardRepository, never()).findById(any(UUID.class));
    verify(learningObjectiveRepository, times(1)).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si el objetivo no se encuentra")
  void shouldThrowExceptionWhenUpdatingNonExistentLearningObjective() {
    // Configura el mock: objetivo no encontrado.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.updateLearningObjective(testLearningObjectiveId, learningObjectiveRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Objetivo de aprendizaje no encontrado con ID: " + testLearningObjectiveId, thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
    verify(learningObjectiveRepository, never()).existsByName(anyString());
    verify(learningObjectiveRepository, never()).existsByCode(anyString());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
    verify(standardRepository, never()).findById(any(UUID.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si el nuevo estándar padre no es encontrado")
  void shouldThrowExceptionWhenNewStandardNotFoundOnUpdate() {
    LearningObjectiveRequest updatedRequest = LearningObjectiveRequest.builder()
        .name("New Name")
        .description("New Desc") // ✅ AGREGADO: Descripción en request de actualización
        .code("NEW-CODE")
        .standardId(UUID.randomUUID()) // Un nuevo ID de estándar que no existe
        .build();

    // Configura el mock: el objetivo existe, pero el nuevo estándar padre no.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.of(learningObjective));
    when(standardRepository.findById(updatedRequest.getStandardId())).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.updateLearningObjective(testLearningObjectiveId, updatedRequest);
    });

    assertEquals("Nuevo estándar padre no encontrado con ID: " + updatedRequest.getStandardId(), thrown.getMessage());

    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
    verify(standardRepository, times(1)).findById(updatedRequest.getStandardId()); // ✅ Se invoca findById para el nuevo
                                                                                   // estándar
    verify(learningObjectiveRepository, never()).existsByName(anyString()); // No se llega a estas validaciones
    verify(learningObjectiveRepository, never()).existsByCode(anyString());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo nombre ya existe en otro objetivo")
  void shouldThrowExceptionWhenUpdateNameConflicts() {
    // La request tendrá un nombre diferente al original
    LearningObjectiveRequest updatedRequest = LearningObjectiveRequest.builder()
        .name("Nombre Existente de Objetivo") // Este nombre ya existe en otro objetivo
        .description("Descripción") // ✅ AGREGADO: Descripción
        .code("NEW-CODE")
        .standardId(testStandardId) // Mismo estándar padre
        .build();

    // Configura el mock:
    // 1. findById devuelve el objetivo que queremos actualizar.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.of(learningObjective));
    // 2. existsByName devuelve true (el nuevo nombre "Nombre Existente de Objetivo"
    // ya existe en otro lugar).
    when(learningObjectiveRepository.existsByName(updatedRequest.getName())).thenReturn(true);
    // ✅ CORRECCIÓN: El standardId en la request es el mismo, así que findById para
    // el padre NO se llama.
    // REMOVIDO:
    // when(standardRepository.findById(updatedRequest.getStandardId())).thenReturn(Optional.of(standard));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      learningObjectiveService.updateLearningObjective(testLearningObjectiveId, updatedRequest);
    });

    assertEquals("Ya existe un objetivo de aprendizaje con el nombre: " + updatedRequest.getName(),
        thrown.getMessage());
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
    verify(learningObjectiveRepository, times(1)).existsByName(updatedRequest.getName());
    verify(learningObjectiveRepository, never()).existsByCode(anyString()); // No se llega a esta verificación por el
                                                                            // cortocircuito
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
    verify(standardRepository, never()).findById(any(UUID.class)); // ✅ AHORA ES NEVER()
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo código ya existe en otro objetivo")
  void shouldThrowExceptionWhenUpdateCodeConflicts() {
    // La request tendrá el mismo nombre que el objetivo original, pero código
    // diferente y conflictivo.
    LearningObjectiveRequest updatedRequest = LearningObjectiveRequest.builder()
        .name(learningObjective.getName()) // Mismo nombre que el original
        .description(learningObjective.getDescription()) // ✅ AGREGADO: Descripción
        .code("CODE-EXISTENTE-LO") // Este código ya existe en otro objetivo
        .standardId(testStandardId) // Mismo estándar padre
        .build();

    // Configura el mock:
    // 1. findById devuelve el objetivo que queremos actualizar.
    when(learningObjectiveRepository.findById(testLearningObjectiveId)).thenReturn(Optional.of(learningObjective));
    // 2. existsByName NO es llamado porque el nombre no cambia (cortocircuito).
    // 3. existsByCode devuelve true (el nuevo código "CODE-EXISTENTE-LO" ya
    // existe).
    when(learningObjectiveRepository.existsByCode(updatedRequest.getCode())).thenReturn(true);
    // ✅ CORRECCIÓN: El standardId en la request es el mismo, así que findById para
    // el padre NO se llama.
    // REMOVIDO:
    // when(standardRepository.findById(updatedRequest.getStandardId())).thenReturn(Optional.of(standard));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      learningObjectiveService.updateLearningObjective(testLearningObjectiveId, updatedRequest);
    });

    assertEquals("Ya existe un objetivo de aprendizaje con el código: " + updatedRequest.getCode(),
        thrown.getMessage());
    verify(learningObjectiveRepository, times(1)).findById(testLearningObjectiveId);
    verify(learningObjectiveRepository, never()).existsByName(anyString()); // ✅ AHORA ES NEVER()
    verify(learningObjectiveRepository, times(1)).existsByCode(updatedRequest.getCode());
    verify(learningObjectiveRepository, never()).save(any(LearningObjective.class));
    verify(standardRepository, never()).findById(any(UUID.class)); // ✅ AHORA ES NEVER()
  }

  @Test
  @DisplayName("Debe eliminar un objetivo de aprendizaje exitosamente")
  void shouldDeleteLearningObjectiveSuccessfully() {
    // Configura el mock: existsById devuelve true (el objetivo existe).
    when(learningObjectiveRepository.existsById(testLearningObjectiveId)).thenReturn(true);
    // No necesitamos configurar deleteById porque es un método void.

    // Llama al método de servicio.
    assertDoesNotThrow(() -> learningObjectiveService.deleteLearningObjective(testLearningObjectiveId)); // No debería
                                                                                                         // lanzar
                                                                                                         // excepción.

    // Verifica que el método del mock fue llamado.
    verify(learningObjectiveRepository, times(1)).existsById(testLearningObjectiveId);
    verify(learningObjectiveRepository, times(1)).deleteById(testLearningObjectiveId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al eliminar si el objetivo no se encuentra")
  void shouldThrowExceptionWhenDeletingNonExistentLearningObjective() {
    // Configura el mock: objetivo no existe.
    when(learningObjectiveRepository.existsById(testLearningObjectiveId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      learningObjectiveService.deleteLearningObjective(testLearningObjectiveId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Objetivo de aprendizaje no encontrado con ID: " + testLearningObjectiveId, thrown.getMessage());

    // Verifica que deleteById nunca fue llamado.
    verify(learningObjectiveRepository, times(1)).existsById(testLearningObjectiveId);
    verify(learningObjectiveRepository, never()).deleteById(any(UUID.class));
  }
}
