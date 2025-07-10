package com.tesis.curriculum_service.service;

import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.dto.CurriculumStatsResponse;
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.model.Curriculum;
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
 * Clase de pruebas unitarias para {@link CurriculumServiceImpl}.
 * Utiliza Mockito para simular el comportamiento de
 * {@link CurriculumRepository}
 * y probar la lógica de negocio del servicio de manera aislada.
 */
@ExtendWith(MockitoExtension.class) // Habilita la integración de Mockito con JUnit 5.
public class CurriculumServiceTest {

  @Mock // ✅ Propósito: Crea un mock de CurriculumRepository. Las interacciones con este
        // objeto serán controladas por Mockito.
  private CurriculumRepository curriculumRepository;

  @InjectMocks // ✅ Propósito: Inyecta los mocks creados (ej. curriculumRepository) en la
               // instancia de CurriculumServiceImpl.
  private CurriculumServiceImpl curriculumService;

  private Curriculum curriculum; // Objeto Curriculum de prueba
  private CurriculumRequest curriculumRequest; // Objeto CurriculumRequest de prueba
  private UUID testId; // ID de prueba

  @BeforeEach // Se ejecuta antes de cada método de prueba.
  void setUp() {
    testId = UUID.randomUUID();
    // Inicializa un objeto Curriculum de prueba.
    curriculum = Curriculum.builder()
        .id(testId)
        .name("Matemática 6to Grado")
        .description("Currículo completo de matemática para sexto grado de primaria")
        .code("MATH-6")
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .active(true) // Asegúrate de que el estado activo sea consistente con el servicio
        .build();

    // Inicializa un objeto CurriculumRequest de prueba.
    curriculumRequest = CurriculumRequest.builder()
        .name("Matemática 6to Grado")
        .description("Currículo completo de matemática para sexto grado de primaria")
        .code("MATH-6")
        .grade("6th Grade")
        .build();
  }

  @Test
  @DisplayName("Debe crear un currículo exitosamente")
  void shouldCreateCurriculumSuccessfully() {
    // Configura el comportamiento del mock:
    // El servicio usa existsByName y existsByCode para la creación.
    when(curriculumRepository.existsByName(curriculumRequest.getName())).thenReturn(false);
    when(curriculumRepository.existsByCode(curriculumRequest.getCode())).thenReturn(false);
    when(curriculumRepository.save(any(Curriculum.class))).thenReturn(curriculum);

    // Llama al método de servicio.
    CurriculumResponse response = curriculumService.createCurriculum(curriculumRequest);

    // Verifica las aserciones:
    assertNotNull(response);
    assertEquals(curriculum.getName(), response.getName());
    assertEquals(curriculum.getCode(), response.getCode());
    assertNotNull(response.getId());

    // Verifica que los métodos del mock fueron llamados:
    verify(curriculumRepository, times(1)).existsByName(curriculumRequest.getName());
    verify(curriculumRepository, times(1)).existsByCode(curriculumRequest.getCode());
    verify(curriculumRepository, times(1)).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el nombre del currículo ya existe")
  void shouldThrowExceptionWhenCurriculumNameExists() {
    // Configura el comportamiento del mock: el nombre ya existe.
    when(curriculumRepository.existsByName(curriculumRequest.getName())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.createCurriculum(curriculumRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un currículo con el nombre: " + curriculumRequest.getName(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(curriculumRepository, times(1)).existsByName(curriculumRequest.getName());
    verify(curriculumRepository, never()).existsByCode(anyString()); // No se llegó a verificar el código.
    verify(curriculumRepository, never()).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el código del currículo ya existe")
  void shouldThrowExceptionWhenCurriculumCodeExists() {
    // Configura el comportamiento del mock: el nombre no existe, pero el código sí.
    when(curriculumRepository.existsByName(curriculumRequest.getName())).thenReturn(false);
    when(curriculumRepository.existsByCode(curriculumRequest.getCode())).thenReturn(true);

    // Verifica que se lanza la excepción esperada.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.createCurriculum(curriculumRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Ya existe un currículo con el código: " + curriculumRequest.getCode(), thrown.getMessage());

    // Verifica que save nunca fue llamado.
    verify(curriculumRepository, times(1)).existsByName(curriculumRequest.getName());
    verify(curriculumRepository, times(1)).existsByCode(curriculumRequest.getCode());
    verify(curriculumRepository, never()).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe obtener un currículo por ID exitosamente")
  void shouldGetCurriculumByIdSuccessfully() {
    // Configura el mock para devolver el currículo cuando se busca por ID.
    when(curriculumRepository.findById(testId)).thenReturn(Optional.of(curriculum));

    // Llama al método de servicio.
    CurriculumResponse response = curriculumService.getCurriculumById(testId);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(curriculum.getId(), response.getId());
    assertEquals(curriculum.getName(), response.getName());

    // Verifica que el método del mock fue llamado.
    verify(curriculumRepository, times(1)).findById(testId);
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException si el currículo no se encuentra por ID")
  void shouldThrowExceptionWhenCurriculumNotFoundById() {
    // Configura el mock para devolver Optional.empty() (currículo no encontrado).
    when(curriculumRepository.findById(testId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      curriculumService.getCurriculumById(testId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Currículo no encontrado con ID: " + testId, thrown.getMessage());
    verify(curriculumRepository, times(1)).findById(testId);
  }

  @Test
  @DisplayName("Debe obtener todos los currículos exitosamente")
  void shouldGetAllCurriculumsSuccessfully() {
    // Crea una lista de currículos de prueba.
    Curriculum anotherCurriculum = Curriculum.builder()
        .id(UUID.randomUUID())
        .name("Física 6to Grado")
        .code("PHYS-6")
        .grade("6th Grade")
        .active(true)
        .build();
    List<Curriculum> curriculums = Arrays.asList(curriculum, anotherCurriculum);

    // Configura el mock para devolver la lista de currículos.
    when(curriculumRepository.findAll()).thenReturn(curriculums);

    // Llama al método de servicio.
    List<CurriculumResponse> responses = curriculumService.getAllCurriculums();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(curriculum.getName(), responses.get(0).getName());
    assertEquals(anotherCurriculum.getName(), responses.get(1).getName());

    // Verifica que el método del mock fue llamado.
    verify(curriculumRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe devolver una lista vacía si no hay currículos")
  void shouldReturnEmptyListWhenNoCurriculumsExist() {
    // Configura el mock para devolver una lista vacía.
    when(curriculumRepository.findAll()).thenReturn(Arrays.asList());

    // Llama al método de servicio.
    List<CurriculumResponse> responses = curriculumService.getAllCurriculums();

    // Verifica las aserciones.
    assertNotNull(responses);
    assertTrue(responses.isEmpty());

    // Verifica que el método del mock fue llamado.
    verify(curriculumRepository, times(1)).findAll();
  }

  @Test
  @DisplayName("Debe actualizar un currículo exitosamente")
  void shouldUpdateCurriculumSuccessfully() {
    // Crea un request de actualización con nuevos datos.
    CurriculumRequest updatedRequest = CurriculumRequest.builder()
        .name("Matemática 6to Grado Actualizado")
        .description("Descripción actualizada")
        .code("MATH-6-UPD")
        .grade("6th Grade")
        .build();

    // Crea una entidad de currículo actualizada que el save debería devolver.
    Curriculum updatedCurriculumEntity = Curriculum.builder()
        .id(testId)
        .name(updatedRequest.getName())
        .description(updatedRequest.getDescription())
        .code(updatedRequest.getCode())
        .grade(updatedRequest.getGrade())
        .createdAt(curriculum.getCreatedAt())
        .updatedAt(LocalDateTime.now()) // Simula la actualización
        .active(true)
        .build();

    // Configura el mock:
    // 1. findById devuelve el currículo existente (curriculum original del setup).
    when(curriculumRepository.findById(testId)).thenReturn(Optional.of(curriculum));

    // 2. Mockear el comportamiento para la verificación de unicidad del nombre
    // El nombre de la solicitud es diferente del original, por lo tanto, el
    // servicio llamará a findByNameIgnoreCase.
    // Y esperamos que devuelva Optional.empty() para que no haya conflicto.
    when(curriculumRepository.findByNameIgnoreCase(updatedRequest.getName())).thenReturn(Optional.empty());

    // 3. Mockear el comportamiento para la verificación de unicidad del código
    // El código de la solicitud es diferente del original, por lo tanto, el
    // servicio llamará a existsByCode.
    // Y esperamos que devuelva false para que no haya conflicto.
    when(curriculumRepository.existsByCode(updatedRequest.getCode())).thenReturn(false);

    // 4. save devuelve la entidad actualizada.
    when(curriculumRepository.save(any(Curriculum.class))).thenReturn(updatedCurriculumEntity);

    // Llama al método de servicio.
    CurriculumResponse response = curriculumService.updateCurriculum(testId, updatedRequest);

    // Verifica las aserciones.
    assertNotNull(response);
    assertEquals(testId, response.getId());
    assertEquals(updatedRequest.getName(), response.getName());
    assertEquals(updatedRequest.getDescription(), response.getDescription());
    assertEquals(updatedRequest.getCode(), response.getCode());

    // Verifica que los métodos del mock fueron llamados.
    verify(curriculumRepository, times(1)).findById(testId);
    // Verificamos que se llama a findByNameIgnoreCase porque el nombre cambia
    verify(curriculumRepository, times(1)).findByNameIgnoreCase(updatedRequest.getName());
    // Verificamos que se llama a existsByCode porque el código cambia
    verify(curriculumRepository, times(1)).existsByCode(updatedRequest.getCode());
    verify(curriculumRepository, times(1)).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al actualizar si el currículo no se encuentra")
  void shouldThrowExceptionWhenUpdatingNonExistentCurriculum() {
    // Configura el mock: currículo no encontrado.
    when(curriculumRepository.findById(testId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      curriculumService.updateCurriculum(testId, curriculumRequest);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Currículo no encontrado con ID: " + testId, thrown.getMessage());

    // Verifica que los métodos de verificación de unicidad y save nunca fueron
    // llamados.
    verify(curriculumRepository, times(1)).findById(testId);
    verify(curriculumRepository, never()).findByNameIgnoreCase(anyString());
    verify(curriculumRepository, never()).existsByCode(anyString());
    verify(curriculumRepository, never()).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo nombre ya existe en otro currículo")
  void shouldThrowExceptionWhenUpdateNameConflicts() {
    // Crea un request de actualización con un nombre que ya existe en otro
    // currículo
    CurriculumRequest updatedRequest = CurriculumRequest.builder()
        .name("Nombre Existente") // Este nombre ya existe en otro currículo
        .description("Descripción")
        .code("NEW-CODE")
        .grade("6th Grade")
        .build();

    // Simula el currículo *existente* que tiene el nombre conflictivo
    Curriculum conflictingCurriculum = Curriculum.builder()
        .id(UUID.randomUUID()) // ID diferente al testId
        .name(updatedRequest.getName())
        .code("CONFLICT-CODE")
        .build();

    // Configura el mock:
    // 1. findById devuelve el currículo que queremos actualizar (el original).
    when(curriculumRepository.findById(testId)).thenReturn(Optional.of(curriculum));
    // 2. findByNameIgnoreCase devuelve el currículo conflictivo (el nuevo nombre ya
    // existe
    // y su ID es diferente al del currículo que estamos actualizando).
    when(curriculumRepository.findByNameIgnoreCase(updatedRequest.getName()))
        .thenReturn(Optional.of(conflictingCurriculum));
    // 3. existsByCode no se llamará porque el conflicto de nombre ocurre antes.

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.updateCurriculum(testId, updatedRequest);
    });

    assertEquals("Ya existe un currículo con el nombre: " + updatedRequest.getName(), thrown.getMessage());
    verify(curriculumRepository, times(1)).findById(testId);
    verify(curriculumRepository, times(1)).findByNameIgnoreCase(updatedRequest.getName());
    verify(curriculumRepository, never()).existsByCode(anyString()); // No se debe llamar existsByCode
    verify(curriculumRepository, never()).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException al actualizar si el nuevo código ya existe en otro currículo")
  void shouldThrowExceptionWhenUpdateCodeConflicts() {
    // Crea un request de actualización con un código que ya existe en otro
    // currículo
    CurriculumRequest updatedRequest = CurriculumRequest.builder()
        .name(curriculum.getName()) // El nombre es el mismo que el original, así que no habrá conflicto por nombre.
        .description("Descripción")
        .code("CODE-EXISTENTE") // Este código ya existe en otro currículo
        .grade("6th Grade")
        .build();

    // Configura el mock:
    // 1. findById devuelve el currículo que queremos actualizar (el original).
    when(curriculumRepository.findById(testId)).thenReturn(Optional.of(curriculum));
    // 2. findByNameIgnoreCase devuelve Optional.empty() porque el nombre no es un
    // conflicto y es el mismo ID.
    // Ojo: Si el nombre es el mismo, la condición
    // `!existingCurriculum.getName().equalsIgnoreCase(request.getName())` será
    // false,
    // por lo que `findByNameIgnoreCase` NO será llamado por el servicio en este
    // caso.
    // Así que no necesitamos mockearlo aquí ni verificarlo como llamado.

    // 3. existsByCode devuelve true porque el código es un conflicto.
    when(curriculumRepository.existsByCode(updatedRequest.getCode())).thenReturn(true);

    // Verifica que se lanza la excepción.
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.updateCurriculum(testId, updatedRequest);
    });

    assertEquals("Ya existe un currículo con el código: " + updatedRequest.getCode(), thrown.getMessage());
    verify(curriculumRepository, times(1)).findById(testId);
    verify(curriculumRepository, never()).findByNameIgnoreCase(anyString()); // NO se llama si el nombre no cambió
    verify(curriculumRepository, times(1)).existsByCode(updatedRequest.getCode()); // Se verifica el código (hay
                                                                                   // conflicto)
    verify(curriculumRepository, never()).save(any(Curriculum.class));
  }

  @Test
  @DisplayName("Debe eliminar un currículo exitosamente")
  void shouldDeleteCurriculumSuccessfully() {
    // Configura el mock: findById devuelve el currículo (existe).
    // El servicio carga el currículo, lo modifica y luego lo guarda.
    when(curriculumRepository.findById(testId)).thenReturn(Optional.of(curriculum));
    when(curriculumRepository.save(any(Curriculum.class))).thenReturn(curriculum); // El save debería devolver la
                                                                                   // entidad modificada.

    // Llama al método de servicio.
    assertDoesNotThrow(() -> curriculumService.deleteCurriculum(testId)); // No debería lanzar excepción.

    // Verifica que el método del mock fue llamado.
    verify(curriculumRepository, times(1)).findById(testId);
    // Verificamos que se llama a save y que el currículo tiene active=false y
    // deletedAt != null
    verify(curriculumRepository, times(1)).save(argThat(c -> c.getId().equals(testId) &&
        !c.getActive() &&
        c.getDeletedAt() != null));
    verify(curriculumRepository, never()).deleteById(any(UUID.class)); // deleteById no se usa
  }

  @Test
  @DisplayName("Debe lanzar ResourceNotFoundException al eliminar si el currículo no se encuentra")
  void shouldThrowExceptionWhenDeletingNonExistentCurriculum() {
    // Configura el mock: findById devuelve Optional.empty() (currículo no
    // encontrado).
    when(curriculumRepository.findById(testId)).thenReturn(Optional.empty());

    // Verifica que se lanza la excepción esperada.
    ResourceNotFoundException thrown = assertThrows(ResourceNotFoundException.class, () -> {
      curriculumService.deleteCurriculum(testId);
    });

    // Verifica el mensaje de la excepción.
    assertEquals("Currículo no encontrado con ID: " + testId, thrown.getMessage());

    // Verifica que save y deleteById nunca fueron llamados.
    verify(curriculumRepository, times(1)).findById(testId);
    verify(curriculumRepository, never()).save(any(Curriculum.class));
    verify(curriculumRepository, never()).deleteById(any(UUID.class));
  }

  // Test para getCurriculaByGrade (siempre asumiendo que el servicio tiene un
  // findByGrade)
  @Test
  @DisplayName("Debe obtener currículos por grado exitosamente")
  void shouldGetCurriculaByGradeSuccessfully() {
    String grade = "6th Grade";
    Curriculum curriculum1 = Curriculum.builder().id(UUID.randomUUID()).name("Matemáticas").grade(grade).active(true)
        .build();
    Curriculum curriculum2 = Curriculum.builder().id(UUID.randomUUID()).name("Lenguaje").grade(grade).active(true)
        .build();
    List<Curriculum> curriculaByGrade = Arrays.asList(curriculum1, curriculum2);

    when(curriculumRepository.findByGrade(grade)).thenReturn(curriculaByGrade);

    List<CurriculumResponse> responses = curriculumService.getCurriculaByGrade(grade);

    assertNotNull(responses);
    assertEquals(2, responses.size());
    assertEquals(grade, responses.get(0).getGrade());
    assertEquals(grade, responses.get(1).getGrade());
    verify(curriculumRepository, times(1)).findByGrade(grade);
  }

  @Test
  @DisplayName("Debe lanzar IllegalArgumentException si el grado es nulo o vacío al buscar por grado")
  void shouldThrowExceptionWhenGradeIsNullForGetCurriculaByGrade() {
    IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.getCurriculaByGrade(null);
    });
    assertEquals("El grado no puede estar vacío.", thrown.getMessage());
    verify(curriculumRepository, never()).findByGrade(anyString());

    thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.getCurriculaByGrade("");
    });
    assertEquals("El grado no puede estar vacío.", thrown.getMessage());
    verify(curriculumRepository, never()).findByGrade(anyString());

    thrown = assertThrows(IllegalArgumentException.class, () -> {
      curriculumService.getCurriculaByGrade("   ");
    });
    assertEquals("El grado no puede estar vacío.", thrown.getMessage());
    verify(curriculumRepository, never()).findByGrade(anyString());
  }

  // Test para getCurriculumStats
  @Test
  @DisplayName("Debe obtener estadísticas del currículo exitosamente")
  void shouldGetCurriculumStatsSuccessfully() {
    long expectedCount = 5L;
    when(curriculumRepository.count()).thenReturn(expectedCount);

    CurriculumStatsResponse response = curriculumService.getCurriculumStats();

    assertNotNull(response);
    assertEquals(expectedCount, response.getTotalCurriculums());
    // Asumiendo que los otros campos se inicializan a 0 en el servicio si no hay
    // lógica para ellos
    assertEquals(0, response.getTotalCompetencies());
    assertEquals(0, response.getTotalStandards());
    assertEquals(0, response.getTotalLearningObjectives());
    verify(curriculumRepository, times(1)).count();
  }
}
