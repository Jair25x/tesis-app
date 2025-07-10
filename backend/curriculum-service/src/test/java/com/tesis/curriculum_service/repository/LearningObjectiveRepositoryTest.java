package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Competency; // Importa la entidad Competency (para relaciones)
import com.tesis.curriculum_service.model.Curriculum; // Importa la entidad Curriculum (para relaciones)
import com.tesis.curriculum_service.model.LearningObjective; // Importa la entidad LearningObjective
import com.tesis.curriculum_service.model.Standard; // Importa la entidad Standard (para relaciones)
import org.junit.jupiter.api.BeforeEach; // Para configurar antes de cada test
import org.junit.jupiter.api.DisplayName; // Para nombres de tests más legibles
import org.junit.jupiter.api.Test; // Anotación para métodos de test
import org.springframework.beans.factory.annotation.Autowired; // Para inyectar dependencias
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest; // Anotación clave para tests JPA
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager; // Para operaciones directas de EntityManager en tests
import org.springframework.test.context.ActiveProfiles; // Para activar un perfil específico para tests
import org.springframework.test.context.TestPropertySource; // Para propiedades específicas de tests

import java.time.LocalDateTime; // Para comparar fechas
import java.util.List; // Para listas de resultados
import java.util.Optional; // Para el manejo de resultados nulos
import java.util.UUID; // Para trabajar con UUIDs

import static org.assertj.core.api.Assertions.assertThat; // Para aserciones fluidas
import static org.junit.jupiter.api.Assertions.assertThrows; // Para verificar excepciones

/**
 * Clase de test para verificar las operaciones de persistencia del
 * {@link LearningObjectiveRepository}.
 * Utiliza {@link DataJpaTest} para un test de slice de la capa JPA,
 * configurando
 * una base de datos en memoria (H2) automáticamente.
 */
@DataJpaTest // Configura un contexto Spring para probar componentes JPA con H2 en memoria.
@ActiveProfiles("test") // Activa el perfil "test".
@TestPropertySource(properties = {
    "spring.cloud.config.enabled=false", // Deshabilita la conexión al Config Server para tests.
    "eureka.client.enabled=false" // Deshabilita la conexión a Eureka para tests.
})
public class LearningObjectiveRepositoryTest {

  @Autowired // Inyecta el repositorio que queremos probar.
  private LearningObjectiveRepository learningObjectiveRepository;

  @Autowired // Para operaciones directas de EntityManager en la base de datos de test.
  private TestEntityManager entityManager;

  private Curriculum sampleCurriculum; // Padre de Competency
  private Competency sampleCompetency; // Padre de Standard
  private Standard sampleStandard; // Padre de LearningObjective
  private LearningObjective sampleObjective; // Instancia de objetivo de aprendizaje de ejemplo

  @BeforeEach // Se ejecuta antes de cada método de test.
  void setUp() {
    entityManager.clear(); // Limpiar el contexto para asegurar estado limpio.

    // Persistir la jerarquía completa de padres: Curriculum -> Competency ->
    // Standard
    sampleCurriculum = Curriculum.builder()
        .name("Matemática - 6to Grado")
        .description("Currículo de matemáticas para estudiantes de sexto grado de primaria.")
        .code("MATH-6TH-2016")
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleCurriculum);

    sampleCompetency = Competency.builder()
        .name("Resuelve problemas de cantidad")
        .description("Consiste en que el estudiante solucione problemas...")
        .code("C.01.MATH")
        .curriculum(sampleCurriculum)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleCompetency);

    sampleStandard = Standard.builder()
        .name("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de cantidad")
        .description("Establece relaciones entre datos y acciones de agregar, quitar, comparar...")
        .code("S.01.01.MATH")
        .competency(sampleCompetency)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleStandard);
    entityManager.flush(); // Fuerza la escritura de todos los padres a la DB

    // Crear una instancia de LearningObjective para usar en los tests
    sampleObjective = LearningObjective.builder()
        .name("Identifica y utiliza números primos y compuestos en problemas de la vida diaria.")
        .code("LO.01.01.01")
        .standard(sampleStandard) // Asociar con el estándar creado
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @Test
  @DisplayName("Should save a new Learning Objective successfully")
  void shouldSaveLearningObjective() {
    // When: Guardamos el objetivo de aprendizaje
    LearningObjective savedObjective = learningObjectiveRepository.save(sampleObjective);

    // Then: Verificamos que se guardó correctamente y tiene un ID.
    assertThat(savedObjective).isNotNull();
    assertThat(savedObjective.getId()).isNotNull();
    assertThat(savedObjective.getName())
        .isEqualTo("Identifica y utiliza números primos y compuestos en problemas de la vida diaria.");
    assertThat(savedObjective.getStandard()).isEqualTo(sampleStandard); // Verifica la asociación con el estándar
    assertThat(savedObjective.getCreatedAt()).isNotNull();
    assertThat(savedObjective.getUpdatedAt()).isNotNull();
    assertThat(savedObjective.getCreatedAt()).isEqualTo(savedObjective.getUpdatedAt());
  }

  @Test
  @DisplayName("Should find Learning Objective by ID")
  void shouldFindLearningObjectiveById() {
    // Given: Guardamos un objetivo de aprendizaje
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Buscamos el objetivo por su ID
    Optional<LearningObjective> foundObjective = learningObjectiveRepository.findById(sampleObjective.getId());

    // Then: Verificamos que se encontró y coincide
    assertThat(foundObjective).isPresent();
    assertThat(foundObjective.get().getName()).isEqualTo(sampleObjective.getName());
    assertThat(foundObjective.get().getStandard().getId()).isEqualTo(sampleStandard.getId());
  }

  @Test
  @DisplayName("Should return empty Optional when Learning Objective not found by ID")
  void shouldReturnEmptyOptionalWhenLearningObjectiveNotFoundById() {
    // Given: Un ID que no existe
    UUID nonExistentId = UUID.randomUUID();

    // When: Buscamos un objetivo con ese ID
    Optional<LearningObjective> foundObjective = learningObjectiveRepository.findById(nonExistentId);

    // Then: El Optional debe estar vacío
    assertThat(foundObjective).isEmpty();
  }

  @Test
  @DisplayName("Should find Learning Objective by name ignoring case")
  void shouldFindLearningObjectiveByNameIgnoreCase() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Buscamos por el nombre en diferentes casos
    Optional<LearningObjective> foundObjective = learningObjectiveRepository
        .findByNameIgnoreCase("identifica y UTILIZA NÚMEROS primos y compuestos en problemas de la vida diaria.");

    // Then: Debe encontrarlo
    assertThat(foundObjective).isPresent();
    assertThat(foundObjective.get().getName()).isEqualTo(sampleObjective.getName());
  }

  @Test
  @DisplayName("Should find Learning Objective by code")
  void shouldFindLearningObjectiveByCode() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Buscamos por el código
    Optional<LearningObjective> foundObjective = learningObjectiveRepository.findByCode("LO.01.01.01");

    // Then: Debe encontrarlo
    assertThat(foundObjective).isPresent();
    assertThat(foundObjective.get().getCode()).isEqualTo(sampleObjective.getCode());
  }

  @Test
  @DisplayName("Should return true when Learning Objective exists by name")
  void shouldReturnTrueWhenLearningObjectiveExistsByName() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Verificamos si existe por nombre
    boolean exists = learningObjectiveRepository
        .existsByName("Identifica y utiliza números primos y compuestos en problemas de la vida diaria.");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Learning Objective does not exist by name")
  void shouldReturnFalseWhenLearningObjectiveDoesNotExistByName() {
    // Given: No hay objetivo con este nombre
    // When: Verificamos si existe por nombre
    boolean exists = learningObjectiveRepository.existsByName("Non Existent Objective");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should return true when Learning Objective exists by code")
  void shouldReturnTrueWhenLearningObjectiveExistsByCode() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Verificamos si existe por código
    boolean exists = learningObjectiveRepository.existsByCode("LO.01.01.01");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Learning Objective does not exist by code")
  void shouldReturnFalseWhenLearningObjectiveDoesNotExistByCode() {
    // Given: No hay objetivo con este código
    // When: Verificamos si existe por código
    boolean exists = learningObjectiveRepository.existsByCode("NON-EXISTENT-CODE");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should find all Learning Objectives by Standard ID")
  void shouldFindAllLearningObjectivesByStandardId() {
    // Given: Creamos otro objetivo para el mismo estándar
    LearningObjective anotherObjective = LearningObjective.builder()
        .name("Calcula el mínimo común múltiplo y el máximo común divisor de números naturales.")
        .code("LO.01.01.02")
        .standard(sampleStandard)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleObjective);
    entityManager.persist(anotherObjective);
    entityManager.flush();

    // When: Buscamos todos los objetivos del estándar
    List<LearningObjective> objectives = learningObjectiveRepository.findAllByStandardId(sampleStandard.getId());

    // Then: Debe encontrar ambos objetivos
    assertThat(objectives).isNotNull();
    assertThat(objectives).hasSize(2);
    assertThat(objectives).extracting(LearningObjective::getName)
        .containsExactlyInAnyOrder("Identifica y utiliza números primos y compuestos en problemas de la vida diaria.",
            "Calcula el mínimo común múltiplo y el máximo común divisor de números naturales.");
  }

  @Test
  @DisplayName("Should find Learning Objective by ID and Standard ID")
  void shouldFindLearningObjectiveByIdAndStandardId() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Buscamos el objetivo por su ID y el ID de su estándar
    Optional<LearningObjective> foundObjective = learningObjectiveRepository
        .findByIdAndStandardId(sampleObjective.getId(), sampleStandard.getId());

    // Then: Debe encontrarlo
    assertThat(foundObjective).isPresent();
    assertThat(foundObjective.get().getName()).isEqualTo(sampleObjective.getName());
  }

  @Test
  @DisplayName("Should not find Learning Objective by ID and wrong Standard ID")
  void shouldNotFindLearningObjectiveByIdAndWrongStandardId() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Buscamos el objetivo por su ID, pero con un ID de estándar incorrecto
    Optional<LearningObjective> foundObjective = learningObjectiveRepository
        .findByIdAndStandardId(sampleObjective.getId(), UUID.randomUUID());

    // Then: No debe encontrarlo
    assertThat(foundObjective).isEmpty();
  }

  @Test
  @DisplayName("Should update Learning Objective successfully")
  void shouldUpdateLearningObjective() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // Cuando: Modificamos el nombre
    sampleObjective.setName("Nuevo nombre actualizado para el objetivo de aprendizaje.");
    LearningObjective updatedObjective = learningObjectiveRepository.save(sampleObjective);
    entityManager.flush();

    // Then: Verificamos la actualización
    assertThat(updatedObjective).isNotNull();
    assertThat(updatedObjective.getName()).isEqualTo("Nuevo nombre actualizado para el objetivo de aprendizaje.");
    assertThat(updatedObjective.getUpdatedAt()).isAfter(updatedObjective.getCreatedAt());
  }

  @Test
  @DisplayName("Should delete Learning Objective by ID")
  void shouldDeleteLearningObjectiveById() {
    // Given: Guardamos un objetivo
    entityManager.persist(sampleObjective);
    entityManager.flush();

    // When: Eliminamos el objetivo
    learningObjectiveRepository.deleteById(sampleObjective.getId());
    entityManager.flush();

    // Then: Verificamos que ya no existe
    Optional<LearningObjective> foundObjective = learningObjectiveRepository.findById(sampleObjective.getId());
    assertThat(foundObjective).isEmpty();
  }

  @Test
  @DisplayName("Should not delete Standard when deleting Learning Objective (due to Many-to-One ownership)")
  void shouldNotDeleteStandardWhenDeletingLearningObjective() {
    // Given: Persistir el objetivo que ya tiene un estándar asociado
    entityManager.persist(sampleObjective);
    entityManager.flush();

    UUID standardId = sampleStandard.getId();

    // When: Eliminamos el objetivo
    learningObjectiveRepository.delete(sampleObjective);
    entityManager.flush();

    // Then: El estándar padre aún debe existir
    Standard foundStandard = entityManager.find(Standard.class, standardId);
    assertThat(foundStandard).isNotNull(); // El estándar padre NO debe ser eliminado
  }

  @Test
  @DisplayName("Should throw exception when saving Learning Objective without Standard")
  void shouldThrowExceptionWhenSavingLearningObjectiveWithoutStandard() {
    // Given: Un objetivo sin estándar asociado (nullable = false en @JoinColumn)
    LearningObjective invalidObjective = LearningObjective.builder()
        .name("Objetivo sin estándar")
        .code("INVALID-LO")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build(); // No se le asigna un estándar

    // When & Then: Intentamos guardarlo, y esperamos una excepción de violación de
    // restricción
    assertThrows(jakarta.persistence.PersistenceException.class, () -> {
      learningObjectiveRepository.save(invalidObjective);
      entityManager.flush(); // La excepción se lanza al sincronizar con la DB
    });
  }
}
