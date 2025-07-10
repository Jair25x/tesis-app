package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.StandardRequest;
import com.tesis.curriculum_service.dto.StandardResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository;
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
 * Clase de pruebas unitarias para {@link StandardServiceImpl}.
 * Utiliza Mockito para simular el comportamiento de {@link StandardRepository}
 * y {@link CompetencyRepository}, probando la lógica de negocio del servicio
 * de manera aislada.
 */
@ExtendWith(MockitoExtension.class) // Habilita la integración de Mockito con JUnit 5.
public class StandardServiceTest {

  @Mock // Mock del repositorio de Standard.
  private StandardRepository standardRepository;

  @Mock // Mock del repositorio de Competency, necesario para validar la existencia del
        // padre.
  private CompetencyRepository competencyRepository;

  @InjectMocks // Inyecta los mocks en la instancia de StandardServiceImpl.
  private StandardServiceImpl standardService;

  private Curriculum curriculum; // Objeto Curriculum de prueba
  private Competency competency; // Objeto Competency de prueba
  private Standard standard; // Objeto Standard de prueba
  private StandardRequest standardRequest; // Objeto StandardRequest de prueba

  private UUID testCurriculumId; // ID de prueba para el currículo
  private UUID testCompetencyId; // ID de prueba para la competencia
  private UUID testStandardId; // ID de prueba para el estándar

  @BeforeEach // Se ejecuta antes de cada método de prueba.
  void setUp() {
    testCurriculumId = UUID.randomUUID();
    testCompetencyId = UUID.randomUUID();
    testStandardId = UUID.randomUUID();

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

    // Inicializa un objeto StandardRequest de prueba.
    standardRequest = StandardRequest.builder()
        .name("Establece relaciones entre datos")
        .description("Relaciona datos y acciones de agregar, quitar, comparar e igualar cantidades.")
        .code("S-C-MATH-01-01")
        .competencyId(testCompetencyId) // Asocia al ID de la competencia de prueba
        .build();
  }

  @Test
  @DisplayName("Debe crear un estándar exitosamente")
  void shouldCreateStandardSuccessfully() {
    // Configura el comportamiento de los mocks:
    // 1. Cuando se busque la competencia padre, devolverla.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    // 2. Cuando se verifique el nombre y código del estándar, indicar que no
    // existen.
    when(standardRepository.existsByName(standardRequest.getName())).thenReturn(false);
    when(standardRepository.existsByCode(standardRequest.getCode())).thenReturn(false);
    // 3. Cuando se guarde el estándar, devolver el estándar de prueba.
    when(standardRepository.save(any(Standard.class))).thenReturn(standard);

    // Llama al método de servicio.
    StandardResponse response = standardService.createStandard(standardRequest);

    // Verifica las aserciones:
    assertNotNull(response);
    assertEquals(standard.getName(), response.getName());
    assertEquals(standard.getCode(), response.getCode());
    assertEquals(testCompetencyId, response.getCompetencyId());
    assertNotNull(response.getId());

    // Verifica que los métodos del mock fueron llamados:
    verify(competencyRepository, times(1)).findById(testCompetencyId);
    verify(standardRepository, times(1)).existsByName(standardRequest.getName());
    verify(standardRepository, times(1)).existsByCode(standardRequest.getCode());
    verify(standardRepository, times(1)).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si la competencia padre no es encontrada al crear estándar")
  void shouldThrowExceptionWhenCompetencyNotFoundOnCreate() {
    // Configura el mock: la competencia padre no existe.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.createStandard(standardRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Competencia padre no encontrada con ID: " + testCompetencyId, thrown.getMessage());

    // Verifica que los métodos subsiguientes no fueron llamados.
    verify(standardRepository, never()).existsByName(anyString());
    verify(standardRepository, never()).existsByCode(anyString());
    verify(standardRepository, never()).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el nombre del estándar ya existe al crear")
  void shouldThrowExceptionWhenStandardNameExistsOnCreate() {
    // Configura el mock: la competencia padre existe, pero el nombre del estándar
    // ya existe.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    when(standardRepository.existsByName(standardRequest.getName())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      standardService.createStandard(standardRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un estándar con el nombre: " + standardRequest.getName(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(standardRepository, times(1)).existsByName(standardRequest.getName());
    verify(standardRepository, never()).existsByCode(anyString());
    verify(standardRepository, never()).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el código del estándar ya existe al crear")
  void shouldThrowExceptionWhenStandardCodeExistsOnCreate() {
    // Configura el mock: la competencia padre existe, el nombre no existe, pero el
    // código sí.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    when(standardRepository.existsByName(standardRequest.getName())).thenReturn(false);
    when(standardRepository.existsByCode(standardRequest.getCode())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      standardService.createStandard(standardRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un estándar con el código: " + standardRequest.getCode(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(standardRepository, times(1)).existsByName(standardRequest.getName());
    verify(standardRepository, times(1)).existsByCode(standardRequest.getCode());
    verify(standardRepository, never()).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe obtener un estándar por ID exitosamente")
  void shouldGetStandardByIdSuccessfully() {
    // Configura el mock para devolver el estándar cuando se busca por ID.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));

    // Llama al método de servicio.
    StandardResponse response = standardService.getStandardById(testStandardId);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(standard.getId(), response.getId());
    assertEquals(standard.getName(), response.getName());
    assertEquals(testCompetencyId, response.getCompetencyId());

    // Verifica que el método del mock fue llamado.
    verify(standardRepository, times(1)).findById(testStandardId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el estándar no se encuentra por ID")
  void shouldThrowExceptionWhenStandardNotFoundById() {
    // Configura el mock para devolver Optional.empty() (estándar no encontrado).
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.getStandardById(testStandardId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Estándar no encontrado con ID: " + testStandardId, thrown.getMessage());
    verify(standardRepository, times(1)).findById(testStandardId);
  }

  @Test
  @DisplayName("Debe obtener todos los estándares exitosamente")
  void shouldGetAllStandardsSuccessfully() {
    // Crea una lista de estándares de prueba.
    Standard anotherStandard = Standard.builder()
        .id(UUID.randomUUID())
        .name("Comunica su comprensión sobre los números")
        .code("S-C-MATH-01-02")
        .competency(competency)
        .build();
    List<Standard> standards = Arrays.asList(standard, anotherStandard);

    // Configura el mock para devolver la lista de estándares.
    when(standardRepository.findAll()).thenReturn(standards);

    // Llama al método de servicio.
    List<StandardResponse> responses = standardService.getAllStandards();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(standard.getName(), responses.get(0).getName());
    assertEquals(anotherStandard.getName(), responses.get(1).getName());
    assertEquals(testCompetencyId, responses.get(0).getCompetencyId());

    // Verifica que el método del mock fue llamado.
    verify(standardRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe devolver una lista vacía si no hay estándares")
  void shouldReturnEmptyListWhenNoStandardsExist() {
    // Configura el mock para devolver una lista vacía.
    when(standardRepository.findAll()).thenReturn(Arrays.asList());

    // Llama al método de servicio.
    List<StandardResponse> responses = standardService.getAllStandards();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertTrue(responses.isEmpty());

    // Verifica que el método del mock fue llamado.
    verify(standardRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe obtener estándares por ID de competencia exitosamente")
  void shouldGetStandardsByCompetencyIdSuccessfully() {
    // Configura el mock: la competencia padre existe.
    when(competencyRepository.existsById(testCompetencyId)).thenReturn(true);
    // Crea una lista de estándares para esta competencia.
    Standard s1 = Standard.builder().id(UUID.randomUUID()).name("Std1").code("SS1").competency(competency).build();
    Standard s2 = Standard.builder().id(UUID.randomUUID()).name("Std2").code("SS2").competency(competency).build();
    List<Standard> standardsForCompetency = Arrays.asList(s1, s2);

    // Configura el mock para devolver los estándares asociados al ID de la
    // competencia.
    when(standardRepository.findAllByCompetencyId(testCompetencyId)).thenReturn(standardsForCompetency);

    // Llama al método de servicio.
    List<StandardResponse> responses = standardService.getStandardsByCompetencyId(testCompetencyId);

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(testCompetencyId, responses.get(0).getCompetencyId());
    assertEquals("Std1", responses.get(0).getName());

    // Verifica que los métodos del mock fueron llamados.
    verify(competencyRepository, times(1)).existsById(testCompetencyId);
    verify(standardRepository, times(1)).findAllByCompetencyId(testCompetencyId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si la competencia padre no existe al buscar por competencia ID")
  void shouldThrowExceptionWhenCompetencyNotFoundOnFindByCompetencyId() {
    // Configura el mock: la competencia padre no existe.
    when(competencyRepository.existsById(testCompetencyId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.getStandardsByCompetencyId(testCompetencyId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Competencia padre no encontrada con ID: " + testCompetencyId, thrown.getMessage());

    // Verifica que findAllByCompetencyId nunca fue llamado.
    verify(standardRepository, never()).findAllByCompetencyId(any(UUID.class));
  }

  @Test
  @DisplayName("Debe actualizar un estándar exitosamente")
  void shouldUpdateStandardSuccessfully() {
    // Crea un request de actualización con nuevos datos.
    StandardRequest updatedRequest = StandardRequest.builder()
        .name("Actualizado: Establece relaciones de equivalencia")
        .description("Descripción actualizada del estándar.")
        .code("S-C-MATH-01-01-UPD")
        .competencyId(testCompetencyId) // Mismo competencia padre para esta prueba.
        .build();

    // Crea una entidad de estándar actualizada que el save debería devolver.
    Standard updatedStandard = Standard.builder()
        .id(testStandardId)
        .name(updatedRequest.getName())
        .description(updatedRequest.getDescription())
        .code(updatedRequest.getCode())
        .competency(competency) // Asegúrate de que el objeto competency original se usa aquí
        .createdAt(standard.getCreatedAt())
        .updatedAt(LocalDateTime.now())
        .build();

    // Configura los mocks:
    // 1. findById devuelve el estándar existente.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    // 2. existsByName y existsByCode devuelven false (no hay conflictos de
    // unicidad).
    when(standardRepository.existsByName(updatedRequest.getName())).thenReturn(false);
    when(standardRepository.existsByCode(updatedRequest.getCode())).thenReturn(false);
    // ✅ CORRECCIÓN: El competencyId en la request es el mismo, así que findById no
    // se llama en la lógica del servicio.
    // REMOVIDO:
    // when(competencyRepository.findById(updatedRequest.getCompetencyId())).thenReturn(Optional.of(competency));
    // 3. save devuelve la entidad actualizada.
    when(standardRepository.save(any(Standard.class))).thenReturn(updatedStandard);

    // Llama al método de servicio.
    StandardResponse response = standardService.updateStandard(testStandardId, updatedRequest);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(testStandardId, response.getId());
    assertEquals(updatedRequest.getName(), response.getName());
    assertEquals(updatedRequest.getDescription(), response.getDescription());
    assertEquals(updatedRequest.getCode(), response.getCode());
    assertEquals(updatedRequest.getCompetencyId(), response.getCompetencyId());

    // Verifica que los métodos del mock fueron llamados.
    verify(standardRepository, times(1)).findById(testStandardId);
    // El nombre y código son diferentes al original, por lo tanto existsByName/Code
    // SÍ deberían llamarse.
    verify(standardRepository, times(1)).existsByName(updatedRequest.getName());
    verify(standardRepository, times(1)).existsByCode(updatedRequest.getCode());
    // ✅ CORRECCIÓN: Verify que competencyRepository.findById NO se llama.
    verify(competencyRepository, never()).findById(any(UUID.class));
    verify(standardRepository, times(1)).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si el estándar no se encuentra")
  void shouldThrowExceptionWhenUpdatingNonExistentStandard() {
    // Configura el mock: estándar no encontrado.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.updateStandard(testStandardId, standardRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Estándar no encontrado con ID: " + testStandardId, thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(standardRepository, times(1)).findById(testStandardId);
    verify(standardRepository, never()).existsByName(anyString());
    verify(standardRepository, never()).existsByCode(anyString());
    verify(standardRepository, never()).save(any(Standard.class));
    verify(competencyRepository, never()).findById(any(UUID.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si la nueva competencia padre no es encontrada")
  void shouldThrowExceptionWhenNewCompetencyNotFoundOnUpdate() {
    StandardRequest updatedRequest = StandardRequest.builder()
        .name("New Name")
        .description("New Desc")
        .code("NEW-CODE")
        .competencyId(UUID.randomUUID()) // Un nuevo ID de competencia que no existe
        .build();

    // Configura el mock: el estándar existe, pero la nueva competencia padre no.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    // ✅ Mantener esta configuración porque el competencyId en la request es
    // diferente al original.
    when(competencyRepository.findById(updatedRequest.getCompetencyId())).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.updateStandard(testStandardId, updatedRequest);
    });

    assertEquals("Nueva competencia padre no encontrada con ID: " + updatedRequest.getCompetencyId(),
        thrown.getMessage());

    verify(standardRepository, times(1)).findById(testStandardId);
    verify(competencyRepository, times(1)).findById(updatedRequest.getCompetencyId()); // ✅ Se invoca findById para la
                                                                                       // nueva competencia
    verify(standardRepository, never()).existsByName(anyString()); // No se llega a estas validaciones
    verify(standardRepository, never()).existsByCode(anyString());
    verify(standardRepository, never()).save(any(Standard.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo nombre ya existe en otro estándar")
  void shouldThrowExceptionWhenUpdateNameConflicts() {
    // La request tendrá un nombre diferente al original
    StandardRequest updatedRequest = StandardRequest.builder()
        .name("Nombre Existente de Estándar") // Este nombre ya existe en otro estándar
        .description("Descripción")
        .code("NEW-CODE")
        .competencyId(testCompetencyId) // Mismo competencia padre
        .build();

    // Configura el mock:
    // 1. findById devuelve el estándar que queremos actualizar.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard)); // standard.getName() es
                                                                                         // "Establece relaciones entre
                                                                                         // datos"
    // 2. existsByName devuelve true (el nuevo nombre "Nombre Existente de Estándar"
    // ya existe en otro lugar).
    when(standardRepository.existsByName(updatedRequest.getName())).thenReturn(true);
    // ✅ CORRECCIÓN: El competencyId en la request es el mismo, así que findById
    // para el padre NO se llama.
    // REMOVIDO:
    // when(competencyRepository.findById(updatedRequest.getCompetencyId())).thenReturn(Optional.of(competency));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      standardService.updateStandard(testStandardId, updatedRequest);
    });

    assertEquals("Ya existe un estándar con el nombre: " + updatedRequest.getName(), thrown.getMessage());
    verify(standardRepository, times(1)).findById(testStandardId);
    verify(standardRepository, times(1)).existsByName(updatedRequest.getName());
    verify(standardRepository, never()).existsByCode(anyString()); // No se llega a esta verificación por el
                                                                   // cortocircuito
    verify(standardRepository, never()).save(any(Standard.class));
    verify(competencyRepository, never()).findById(any(UUID.class)); // ✅ AHORA ES NEVER()
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo código ya existe en otro estándar")
  void shouldThrowExceptionWhenUpdateCodeConflicts() {
    // La request tendrá el mismo nombre que el estándar original, pero código
    // diferente y conflictivo.
    StandardRequest updatedRequest = StandardRequest.builder()
        .name(standard.getName()) // Mismo nombre que el original: "Establece relaciones entre datos"
        .description("Descripción")
        .code("CODE-EXISTENTE-STD") // Este código ya existe en otro estándar
        .competencyId(testCompetencyId) // Mismo competencia padre
        .build();

    // Configura el mock:
    // 1. findById devuelve el estándar que queremos actualizar.
    when(standardRepository.findById(testStandardId)).thenReturn(Optional.of(standard));
    // 2. existsByName NO es llamado porque el nombre no cambia (cortocircuito).
    // 3. existsByCode devuelve true (el nuevo código "CODE-EXISTENTE-STD" ya
    // existe).
    when(standardRepository.existsByCode(updatedRequest.getCode())).thenReturn(true);
    // ✅ CORRECCIÓN: El competencyId en la request es el mismo, así que findById
    // para el padre NO se llama.
    // REMOVIDO:
    // when(competencyRepository.findById(updatedRequest.getCompetencyId())).thenReturn(Optional.of(competency));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      standardService.updateStandard(testStandardId, updatedRequest);
    });

    assertEquals("Ya existe un estándar con el código: " + updatedRequest.getCode(), thrown.getMessage());
    verify(standardRepository, times(1)).findById(testStandardId);
    verify(standardRepository, never()).existsByName(anyString()); // ✅ AHORA ES NEVER()
    verify(standardRepository, times(1)).existsByCode(updatedRequest.getCode());
    verify(standardRepository, never()).save(any(Standard.class));
    verify(competencyRepository, never()).findById(any(UUID.class)); // ✅ AHORA ES NEVER()
  }

  @Test
  @DisplayName("Debe eliminar un estándar exitosamente")
  void shouldDeleteStandardSuccessfully() {
    // Configura el mock: existsById devuelve true (el estándar existe).
    when(standardRepository.existsById(testStandardId)).thenReturn(true);
    // No necesitamos configurar deleteById porque es un método void.

    // Llama al método de servicio.
    assertDoesNotThrow(() -> standardService.deleteStandard(testStandardId)); // No debería lanzar excepción.

    // Verifica que el método del mock fue llamado.
    verify(standardRepository, times(1)).existsById(testStandardId);
    verify(standardRepository, times(1)).deleteById(testStandardId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al eliminar si el estándar no se encuentra")
  void shouldThrowExceptionWhenDeletingNonExistentStandard() {
    // Configura el mock: existsById devuelve false (el estándar no existe).
    when(standardRepository.existsById(testStandardId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      standardService.deleteStandard(testStandardId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Estándar no encontrado con ID: " + testStandardId, thrown.getMessage());

    // Verifica que deleteById nunca fue llamado.
    verify(standardRepository, times(1)).existsById(testStandardId);
    verify(standardRepository, never()).deleteById(any(UUID.class));
  }
}
