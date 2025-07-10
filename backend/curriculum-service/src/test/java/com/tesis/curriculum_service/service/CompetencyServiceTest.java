package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
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
 * Clase de pruebas unitarias para {@link CompetencyServiceImpl}.
 * Utiliza Mockito para simular el comportamiento de
 * {@link CompetencyRepository}
 * y {@link CurriculumRepository}, probando la lógica de negocio del servicio
 * de manera aislada.
 */
@ExtendWith(MockitoExtension.class) // Habilita la integración de Mockito con JUnit 5.
public class CompetencyServiceTest {

  @Mock // Mock del repositorio de Competency.
  private CompetencyRepository competencyRepository;

  @Mock // Mock del repositorio de Curriculum, necesario para validar la existencia del
        // padre.
  private CurriculumRepository curriculumRepository;

  @InjectMocks // Inyecta los mocks en la instancia de CompetencyServiceImpl.
  private CompetencyServiceImpl competencyService;

  private Curriculum curriculum; // Objeto Curriculum de prueba
  private Competency competency; // Objeto Competency de prueba
  private CompetencyRequest competencyRequest; // Objeto CompetencyRequest de prueba
  private UUID testCurriculumId; // ID de prueba para el currículo
  private UUID testCompetencyId; // ID de prueba para la competencia

  @BeforeEach // Se ejecuta antes de cada método de prueba.
  void setUp() {
    testCurriculumId = UUID.randomUUID();
    testCompetencyId = UUID.randomUUID();

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

    // Inicializa un objeto CompetencyRequest de prueba.
    competencyRequest = CompetencyRequest.builder()
        .name("Resuelve problemas de cantidad")
        .description("Implica saber aplicar conceptos de cantidad")
        .code("C-MATH-01")
        .curriculumId(testCurriculumId) // Asocia al ID del currículo de prueba
        .build();
  }

  @Test
  @DisplayName("Debe crear una competencia exitosamente")
  void shouldCreateCompetencySuccessfully() {
    // Configura el comportamiento de los mocks:
    // 1. Cuando se busque el currículo padre, devolverlo.
    when(curriculumRepository.findById(testCurriculumId)).thenReturn(Optional.of(curriculum));
    // 2. Cuando se verifique el nombre y código de la competencia, indicar que no
    // existen.
    when(competencyRepository.existsByName(competencyRequest.getName())).thenReturn(false);
    when(competencyRepository.existsByCode(competencyRequest.getCode())).thenReturn(false);
    // 3. Cuando se guarde la competencia, devolver la competencia de prueba.
    when(competencyRepository.save(any(Competency.class))).thenReturn(competency);

    // Llama al método de servicio.
    CompetencyResponse response = competencyService.createCompetency(competencyRequest);

    // Verifica las aserciones:
    assertNotNull(response);
    assertEquals(competency.getName(), response.getName());
    assertEquals(competency.getCode(), response.getCode());
    assertEquals(testCurriculumId, response.getCurriculumId());
    assertNotNull(response.getId());

    // Verifica que los métodos del mock fueron llamados:
    verify(curriculumRepository, times(1)).findById(testCurriculumId);
    verify(competencyRepository, times(1)).existsByName(competencyRequest.getName());
    verify(competencyRepository, times(1)).existsByCode(competencyRequest.getCode());
    verify(competencyRepository, times(1)).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el currículo padre no es encontrado al crear competencia")
  void shouldThrowExceptionWhenCurriculumNotFoundOnCreate() {
    // Configura el mock: el currículo padre no existe.
    when(curriculumRepository.findById(testCurriculumId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.createCompetency(competencyRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Currículo padre no encontrado con ID: " + testCurriculumId, thrown.getMessage());

    // Verifica que los métodos subsiguientes no fueron llamados.
    verify(competencyRepository, never()).existsByName(anyString());
    verify(competencyRepository, never()).existsByCode(anyString());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el nombre de la competencia ya existe al crear")
  void shouldThrowExceptionWhenCompetencyNameExistsOnCreate() {
    // Configura el mock: el currículo padre existe, pero el nombre de la
    // competencia ya existe.
    when(curriculumRepository.findById(testCurriculumId)).thenReturn(Optional.of(curriculum));
    when(competencyRepository.existsByName(competencyRequest.getName())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      competencyService.createCompetency(competencyRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe una competencia con el nombre: " + competencyRequest.getName(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(competencyRepository, times(1)).existsByName(competencyRequest.getName());
    verify(competencyRepository, never()).existsByCode(anyString());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el código de la competencia ya existe al crear")
  void shouldThrowExceptionWhenCompetencyCodeExistsOnCreate() {
    // Configura el mock: el currículo padre existe, el nombre no existe, pero el
    // código sí.
    when(curriculumRepository.findById(testCurriculumId)).thenReturn(Optional.of(curriculum));
    when(competencyRepository.existsByName(competencyRequest.getName())).thenReturn(false);
    when(competencyRepository.existsByCode(competencyRequest.getCode())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      competencyService.createCompetency(competencyRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe una competencia con el código: " + competencyRequest.getCode(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(competencyRepository, times(1)).existsByName(competencyRequest.getName());
    verify(competencyRepository, times(1)).existsByCode(competencyRequest.getCode());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe obtener una competencia por ID exitosamente")
  void shouldGetCompetencyByIdSuccessfully() {
    // Configura el mock para devolver la competencia cuando se busca por ID.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));

    // Llama al método de servicio.
    CompetencyResponse response = competencyService.getCompetencyById(testCompetencyId);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(competency.getId(), response.getId());
    assertEquals(competency.getName(), response.getName());
    assertEquals(testCurriculumId, response.getCurriculumId());

    // Verifica que el método del mock fue llamado.
    verify(competencyRepository, times(1)).findById(testCompetencyId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si la competencia no se encuentra por ID")
  void shouldThrowExceptionWhenCompetencyNotFoundById() {
    // Configura el mock para devolver Optional.empty() (competencia no encontrada).
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.getCompetencyById(testCompetencyId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Competencia no encontrada con ID: " + testCompetencyId, thrown.getMessage());
    verify(competencyRepository, times(1)).findById(testCompetencyId);
  }

  @Test
  @DisplayName("Debe obtener todas las competencias exitosamente")
  void shouldGetAllCompetenciesSuccessfully() {
    // Crea una lista de competencias de prueba.
    Competency anotherCompetency = Competency.builder()
        .id(UUID.randomUUID())
        .name("Resuelve problemas de forma, movimiento y localización")
        .code("C-MATH-02")
        .curriculum(curriculum)
        .build();
    List<Competency> competencies = Arrays.asList(competency, anotherCompetency);

    // Configura el mock para devolver la lista de competencias.
    when(competencyRepository.findAll()).thenReturn(competencies);

    // Llama al método de servicio.
    List<CompetencyResponse> responses = competencyService.getAllCompetencies();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(competency.getName(), responses.get(0).getName());
    assertEquals(anotherCompetency.getName(), responses.get(1).getName());
    assertEquals(testCurriculumId, responses.get(0).getCurriculumId());

    // Verifica que el método del mock fue llamado.
    verify(competencyRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe devolver una lista vacía si no hay competencias")
  void shouldReturnEmptyListWhenNoCompetenciesExist() {
    // Configura el mock para devolver una lista vacía.
    when(competencyRepository.findAll()).thenReturn(Arrays.asList());

    // Llama al método de servicio.
    List<CompetencyResponse> responses = competencyService.getAllCompetencies();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertTrue(responses.isEmpty());

    // Verifica que el método del mock fue llamado.
    verify(competencyRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe obtener competencias por ID de currículo exitosamente")
  void shouldGetCompetenciesByCurriculumIdSuccessfully() {
    // Configura el mock: el currículo padre existe.
    when(curriculumRepository.existsById(testCurriculumId)).thenReturn(true);
    // Crea una lista de competencias para este currículo.
    Competency comp1 = Competency.builder().id(UUID.randomUUID()).name("Comp1").code("CC1").curriculum(curriculum)
        .build();
    Competency comp2 = Competency.builder().id(UUID.randomUUID()).name("Comp2").code("CC2").curriculum(curriculum)
        .build();
    List<Competency> competenciesForCurriculum = Arrays.asList(comp1, comp2);

    // Configura el mock para devolver las competencias asociadas al ID del
    // currículo.
    when(competencyRepository.findAllByCurriculumId(testCurriculumId)).thenReturn(competenciesForCurriculum);

    // Llama al método de servicio.
    List<CompetencyResponse> responses = competencyService.getCompetenciesByCurriculumId(testCurriculumId);

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(testCurriculumId, responses.get(0).getCurriculumId());
    assertEquals("Comp1", responses.get(0).getName());

    // Verifica que los métodos del mock fueron llamados.
    verify(curriculumRepository, times(1)).existsById(testCurriculumId);
    verify(competencyRepository, times(1)).findAllByCurriculumId(testCurriculumId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el currículo padre no existe al buscar por currículo ID")
  void shouldThrowExceptionWhenCurriculumNotFoundOnFindByCurriculumId() {
    // Configura el mock: el currículo padre no existe.
    when(curriculumRepository.existsById(testCurriculumId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.getCompetenciesByCurriculumId(testCurriculumId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Currículo padre no encontrado con ID: " + testCurriculumId, thrown.getMessage());

    // Verifica que findAllByCurriculumId nunca fue llamado.
    verify(competencyRepository, never()).findAllByCurriculumId(any(UUID.class));
  }

  @Test
  @DisplayName("Debe actualizar una competencia exitosamente")
  void shouldUpdateCompetencySuccessfully() {
    // Crea un request de actualización con nuevos datos.
    CompetencyRequest updatedRequest = CompetencyRequest.builder()
        .name("Resuelve problemas de regularidad, equivalencia y cambio (ACT)")
        .description("Descripción actualizada de la competencia")
        .code("C-MATH-03-ACT")
        .curriculumId(testCurriculumId) // Mismo currículo padre para esta prueba.
        .build();

    // Crea una entidad de competencia actualizada que el save debería devolver.
    Competency updatedCompetency = Competency.builder()
        .id(testCompetencyId)
        .name(updatedRequest.getName())
        .description(updatedRequest.getDescription())
        .code(updatedRequest.getCode())
        .curriculum(curriculum)
        .createdAt(competency.getCreatedAt())
        .updatedAt(LocalDateTime.now())
        .build();

    // Configura el mock:
    // 1. findById devuelve la competencia existente.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    // 2. Dado que curriculumId NO CAMBIA, no se llama a
    // curriculumRepository.findById() para el nuevo currículo.
    // 3. existsByName y existsByCode devuelven false (no hay conflictos de unicidad
    // con otros).
    when(competencyRepository.existsByName(updatedRequest.getName())).thenReturn(false);
    when(competencyRepository.existsByCode(updatedRequest.getCode())).thenReturn(false);
    // 4. save devuelve la entidad actualizada.
    when(competencyRepository.save(any(Competency.class))).thenReturn(updatedCompetency);

    // Llama al método de servicio.
    CompetencyResponse response = competencyService.updateCompetency(testCompetencyId, updatedRequest);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(testCompetencyId, response.getId());
    assertEquals(updatedRequest.getName(), response.getName());
    assertEquals(updatedRequest.getDescription(), response.getDescription());
    assertEquals(updatedRequest.getCode(), response.getCode());
    assertEquals(updatedRequest.getCurriculumId(), response.getCurriculumId());

    // Verifica que los métodos del mock fueron llamados.
    verify(competencyRepository, times(1)).findById(testCompetencyId);
    // existsByName/Code SÍ deberían llamarse porque el nombre/código en
    // updatedRequest son DIFERENTES al 'competency' original.
    verify(competencyRepository, times(1)).existsByName(updatedRequest.getName());
    verify(competencyRepository, times(1)).existsByCode(updatedRequest.getCode());
    // ✅ CORRECCIÓN: curriculumRepository.findById no debería ser invocado si
    // curriculumId no cambia.
    verify(curriculumRepository, never()).findById(any(UUID.class));
    verify(competencyRepository, times(1)).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si la competencia no se encuentra")
  void shouldThrowExceptionWhenUpdatingNonExistentCompetency() {
    // Configura el mock: competencia no encontrada.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.updateCompetency(testCompetencyId, competencyRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Competencia no encontrada con ID: " + testCompetencyId, thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(competencyRepository, times(1)).findById(testCompetencyId);
    verify(competencyRepository, never()).existsByName(anyString());
    verify(competencyRepository, never()).existsByCode(anyString());
    verify(competencyRepository, never()).save(any(Competency.class));
    verify(curriculumRepository, never()).findById(any(UUID.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si el nuevo currículo padre no es encontrado")
  void shouldThrowExceptionWhenNewCurriculumNotFoundOnUpdate() {
    CompetencyRequest updatedRequest = CompetencyRequest.builder()
        .name("New Name")
        .description("New Desc")
        .code("NEW-CODE")
        .curriculumId(UUID.randomUUID()) // Un nuevo ID de currículo que no existe
        .build();

    // Configura el mock: la competencia existe.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    // Configura el mock: el nuevo currículo padre NO existe.
    when(curriculumRepository.findById(updatedRequest.getCurriculumId())).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.updateCompetency(testCompetencyId, updatedRequest);
    });

    assertEquals("Nuevo currículo padre no encontrado con ID: " + updatedRequest.getCurriculumId(),
        thrown.getMessage());

    verify(competencyRepository, times(1)).findById(testCompetencyId);
    verify(curriculumRepository, times(1)).findById(updatedRequest.getCurriculumId());
    verify(competencyRepository, never()).existsByName(anyString());
    verify(competencyRepository, never()).existsByCode(anyString());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo nombre ya existe en otra competencia")
  void shouldThrowExceptionWhenUpdateNameConflicts() {
    // La request tendrá un nombre diferente al original
    CompetencyRequest updatedRequest = CompetencyRequest.builder()
        .name("Nombre Existente") // Este nombre ya existe en otra competencia
        .description("Descripción")
        .code("NEW-CODE")
        .curriculumId(testCurriculumId) // Mismo currículo padre
        .build();

    // Configura el mock:
    // 1. findById devuelve la competencia que queremos actualizar.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency)); // competency.getName()
                                                                                               // es "Resuelve problemas
                                                                                               // de cantidad"
    // 2. El nombre en updatedRequest es "Nombre Existente". Son DIFERENTES, por lo
    // que la primera parte de la condición `!equals()` es true.
    // Por lo tanto, existsByName SÍ DEBE LLAMARSE.
    when(competencyRepository.existsByName(updatedRequest.getName())).thenReturn(true);
    // ✅ CORRECCIÓN: El curriculumId en la request es el mismo, así que findById no
    // se llama en la lógica del servicio.
    verify(curriculumRepository, never()).findById(any(UUID.class));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      competencyService.updateCompetency(testCompetencyId, updatedRequest);
    });

    assertEquals("Ya existe una competencia con el nombre: " + updatedRequest.getName(), thrown.getMessage());
    verify(competencyRepository, times(1)).findById(testCompetencyId);
    verify(competencyRepository, times(1)).existsByName(updatedRequest.getName()); // ✅ AHORA ES TIMES(1)
    verify(competencyRepository, never()).existsByCode(anyString());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo código ya existe en otra competencia")
  void shouldThrowExceptionWhenUpdateCodeConflicts() {
    // La request tendrá el mismo nombre que la competencia original, pero código
    // diferente y conflictivo.
    CompetencyRequest updatedRequest = CompetencyRequest.builder()
        .name(competency.getName()) // Mismo nombre que el original: "Resuelve problemas de cantidad"
        .description("Descripción")
        .code("CODE-EXISTENTE") // Este código ya existe en otra competencia
        .curriculumId(testCurriculumId) // Mismo currículo padre
        .build();

    // Configura el mock:
    // 1. findById devuelve la competencia que queremos actualizar.
    when(competencyRepository.findById(testCompetencyId)).thenReturn(Optional.of(competency));
    // 2. El nombre en updatedRequest es el MISMO que el original. La condición
    // `!existing.getName().equals(request.getName())` será FALSE.
    // Por lo tanto, `competencyRepository.existsByName` NO SERÁ LLAMADO.
    // ✅ CORRECCIÓN: Esto es para verificar que NO se llame.
    // no es necesario un `when` para esto si esperamos `never()`
    // when(competencyRepository.existsByName(updatedRequest.getName())).thenReturn(false);
    // 3. existsByCode devuelve true (el nuevo código "CODE-EXISTENTE" ya existe en
    // otro lugar).
    when(competencyRepository.existsByCode(updatedRequest.getCode())).thenReturn(true);
    // ✅ CORRECCIÓN: El curriculumId en la request es el mismo, así que findById no
    // se llama en la lógica del servicio.
    verify(curriculumRepository, never()).findById(any(UUID.class));

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      competencyService.updateCompetency(testCompetencyId, updatedRequest);
    });

    assertEquals("Ya existe una competencia con el código: " + updatedRequest.getCode(), thrown.getMessage());
    verify(competencyRepository, times(1)).findById(testCompetencyId);
    verify(competencyRepository, never()).existsByName(anyString()); // ✅ AHORA ES NEVER()
    verify(competencyRepository, times(1)).existsByCode(updatedRequest.getCode());
    verify(competencyRepository, never()).save(any(Competency.class));
  }

  @Test
  @DisplayName("Debe eliminar una competencia exitosamente")
  void shouldDeleteCompetencySuccessfully() {
    // Configura el mock: existsById devuelve true (la competencia existe).
    when(competencyRepository.existsById(testCompetencyId)).thenReturn(true);
    // No necesitamos configurar deleteById porque es un método void.

    // Llama al método de servicio.
    assertDoesNotThrow(() -> competencyService.deleteCompetency(testCompetencyId)); // No debería lanzar excepción.

    // Verifica que el método del mock fue llamado.
    verify(competencyRepository, times(1)).existsById(testCompetencyId);
    verify(competencyRepository, times(1)).deleteById(testCompetencyId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al eliminar si la competencia no se encuentra")
  void shouldThrowExceptionWhenDeletingNonExistentCompetency() {
    // Configura el mock: existsById devuelve false (la competencia no existe).
    when(competencyRepository.existsById(testCompetencyId)).thenReturn(false);

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      competencyService.deleteCompetency(testCompetencyId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Competencia no encontrada con ID: " + testCompetencyId, thrown.getMessage());

    // Verifica que deleteById nunca fue llamado.
    verify(competencyRepository, times(1)).existsById(testCompetencyId);
    verify(competencyRepository, never()).deleteById(any(UUID.class));
  }
}
