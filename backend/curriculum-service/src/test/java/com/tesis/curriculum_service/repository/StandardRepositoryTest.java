package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Competency; // Importa la entidad Competency (para relaciones)
import com.tesis.curriculum_service.model.Curriculum; // Importa la entidad Curriculum (para relaciones)
import com.tesis.curriculum_service.model.Standard; // Importa la entidad Standard
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
 * {@link StandardRepository}.
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
public class StandardRepositoryTest {

  @Autowired // Inyecta el repositorio que queremos probar.
  private StandardRepository standardRepository;

  @Autowired // Para operaciones directas de EntityManager en la base de datos de test.
  private TestEntityManager entityManager;

  private Curriculum sampleCurriculum; // Padre de Competency
  private Competency sampleCompetency; // Padre de Standard
  private Standard sampleStandard; // Instancia de estándar de ejemplo

  @BeforeEach // Se ejecuta antes de cada método de test.
  void setUp() {
    entityManager.clear(); // Limpiar el contexto para asegurar estado limpio.

    // Primero, persistir un Curriculum y una Competency, ya que Standard depende de
    // Competency.
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
    entityManager.flush(); // Fuerza la escritura de Curriculum y Competency a la DB

    // Crear una instancia de Standard para usar en los tests
    sampleStandard = Standard.builder()
        .name("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de cantidad")
        .description("Establece relaciones entre datos y acciones de agregar, quitar, comparar...")
        .code("S.01.01.MATH")
        .competency(sampleCompetency) // Asociar con la competencia creada
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @Test
  @DisplayName("Should save a new Standard successfully")
  void shouldSaveStandard() {
    // When: Guardamos el estándar
    Standard savedStandard = standardRepository.save(sampleStandard);

    // Then: Verificamos que el estándar se guardó correctamente y tiene un ID.
    assertThat(savedStandard).isNotNull();
    assertThat(savedStandard.getId()).isNotNull();
    assertThat(savedStandard.getName()).isEqualTo("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de cantidad");
    assertThat(savedStandard.getCompetency()).isEqualTo(sampleCompetency); // Verifica la asociación con la competencia
    assertThat(savedStandard.getCreatedAt()).isNotNull();
    assertThat(savedStandard.getUpdatedAt()).isNotNull();
    assertThat(savedStandard.getCreatedAt()).isEqualTo(savedStandard.getUpdatedAt());
  }

  @Test
  @DisplayName("Should find Standard by ID")
  void shouldFindStandardById() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Buscamos el estándar por su ID
    Optional<Standard> foundStandard = standardRepository.findById(sampleStandard.getId());

    // Then: Verificamos que se encontró y coincide
    assertThat(foundStandard).isPresent();
    assertThat(foundStandard.get().getName()).isEqualTo(sampleStandard.getName());
    assertThat(foundStandard.get().getCompetency().getId()).isEqualTo(sampleCompetency.getId());
  }

  @Test
  @DisplayName("Should return empty Optional when Standard not found by ID")
  void shouldReturnEmptyOptionalWhenStandardNotFoundById() {
    // Given: Un ID que no existe
    UUID nonExistentId = UUID.randomUUID();

    // When: Buscamos un estándar con ese ID
    Optional<Standard> foundStandard = standardRepository.findById(nonExistentId);

    // Then: El Optional debe estar vacío
    assertThat(foundStandard).isEmpty();
  }

  @Test
  @DisplayName("Should find Standard by name ignoring case")
  void shouldFindStandardByNameIgnoreCase() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Buscamos por el nombre en diferentes casos
    Optional<Standard> foundStandard = standardRepository
        .findByNameIgnoreCase("estándar de APRENDIZAJE: nivel 5 - RESUELVE problemas de cantidad");

    // Then: Debe encontrarlo
    assertThat(foundStandard).isPresent();
    assertThat(foundStandard.get().getName()).isEqualTo(sampleStandard.getName());
  }

  @Test
  @DisplayName("Should find Standard by code")
  void shouldFindStandardByCode() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Buscamos por el código
    Optional<Standard> foundStandard = standardRepository.findByCode("S.01.01.MATH");

    // Then: Debe encontrarlo
    assertThat(foundStandard).isPresent();
    assertThat(foundStandard.get().getCode()).isEqualTo(sampleStandard.getCode());
  }

  @Test
  @DisplayName("Should return true when Standard exists by name")
  void shouldReturnTrueWhenStandardExistsByName() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Verificamos si existe por nombre
    boolean exists = standardRepository
        .existsByName("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de cantidad");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Standard does not exist by name")
  void shouldReturnFalseWhenStandardDoesNotExistByName() {
    // Given: No hay estándar con este nombre
    // When: Verificamos si existe por nombre
    boolean exists = standardRepository.existsByName("Non Existent Standard");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should return true when Standard exists by code")
  void shouldReturnTrueWhenStandardExistsByCode() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Verificamos si existe por código
    boolean exists = standardRepository.existsByCode("S.01.01.MATH");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Standard does not exist by code")
  void shouldReturnFalseWhenStandardDoesNotExistByCode() {
    // Given: No hay estándar con este código
    // When: Verificamos si existe por código
    boolean exists = standardRepository.existsByCode("NON-EXISTENT-CODE");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should find all Standards by Competency ID")
  void shouldFindAllStandardsByCompetencyId() {
    // Given: Creamos otro estándar para la misma competencia
    Standard anotherStandard = Standard.builder()
        .name("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de regularidad")
        .description("Otro estándar...")
        .code("S.01.02.MATH")
        .competency(sampleCompetency)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleStandard);
    entityManager.persist(anotherStandard);
    entityManager.flush();

    // When: Buscamos todos los estándares de la competencia
    List<Standard> standards = standardRepository.findAllByCompetencyId(sampleCompetency.getId());

    // Then: Debe encontrar ambos estándares
    assertThat(standards).isNotNull();
    assertThat(standards).hasSize(2);
    assertThat(standards).extracting(Standard::getName)
        .containsExactlyInAnyOrder("Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de cantidad",
            "Estándar de Aprendizaje: Nivel 5 - Resuelve problemas de regularidad");
  }

  @Test
  @DisplayName("Should find Standard by ID and Competency ID")
  void shouldFindStandardByIdAndCompetencyId() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Buscamos el estándar por su ID y el ID de su competencia
    Optional<Standard> foundStandard = standardRepository.findByIdAndCompetencyId(sampleStandard.getId(),
        sampleCompetency.getId());

    // Then: Debe encontrarlo
    assertThat(foundStandard).isPresent();
    assertThat(foundStandard.get().getName()).isEqualTo(sampleStandard.getName());
  }

  @Test
  @DisplayName("Should not find Standard by ID and wrong Competency ID")
  void shouldNotFindStandardByIdAndWrongCompetencyId() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Buscamos el estándar por su ID, pero con un ID de competencia
    // incorrecto
    Optional<Standard> foundStandard = standardRepository.findByIdAndCompetencyId(sampleStandard.getId(),
        UUID.randomUUID());

    // Then: No debe encontrarlo
    assertThat(foundStandard).isEmpty();
  }

  @Test
  @DisplayName("Should update Standard successfully")
  void shouldUpdateStandard() throws InterruptedException { // ✅ Añadir throws InterruptedException
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // ✅ Introducir una pequeña pausa para asegurar que LocalDateTime.now() genere
    // un valor diferente
    Thread.sleep(10); // Pausar 10 milisegundos.

    // Cuando: Modificamos la descripción
    sampleStandard.setDescription("Descripción actualizada del estándar.");
    Standard updatedStandard = standardRepository.save(sampleStandard);
    entityManager.flush();

    // Then: Verificamos la actualización
    assertThat(updatedStandard).isNotNull();
    assertThat(updatedStandard.getDescription()).isEqualTo("Descripción actualizada del estándar.");
    assertThat(updatedStandard.getUpdatedAt()).isAfter(updatedStandard.getCreatedAt());
  }

  @Test
  @DisplayName("Should delete Standard by ID")
  void shouldDeleteStandardById() {
    // Given: Guardamos un estándar
    entityManager.persist(sampleStandard);
    entityManager.flush();

    // When: Eliminamos el estándar
    standardRepository.deleteById(sampleStandard.getId());
    entityManager.flush();

    // Then: Verificamos que ya no existe
    Optional<Standard> foundStandard = standardRepository.findById(sampleStandard.getId());
    assertThat(foundStandard).isEmpty();
  }

  @Test
  @DisplayName("Should not delete Competency when deleting Standard (due to Many-to-One ownership)")
  void shouldNotDeleteCompetencyWhenDeletingStandard() {
    // Given: Persistir el estándar que ya tiene una competencia asociada
    entityManager.persist(sampleStandard);
    entityManager.flush();

    UUID competencyId = sampleCompetency.getId();

    // When: Eliminamos el estándar
    standardRepository.delete(sampleStandard);
    entityManager.flush();

    // Then: La competencia padre aún debe existir
    Competency foundCompetency = entityManager.find(Competency.class, competencyId);
    assertThat(foundCompetency).isNotNull(); // La competencia padre NO debe ser eliminada
  }

  @Test
  @DisplayName("Should throw exception when saving Standard without Competency")
  void shouldThrowExceptionWhenSavingStandardWithoutCompetency() {
    // Given: Un estándar sin competencia asociada (nullable = false en @JoinColumn)
    Standard invalidStandard = Standard.builder()
        .name("Estándar sin competencia")
        .description("Descripción")
        .code("INVALID-S")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build(); // No se le asigna una competencia

    // When & Then: Intentamos guardarla, y esperamos una excepción de violación de
    // restricción
    assertThrows(jakarta.persistence.PersistenceException.class, () -> {
      standardRepository.save(invalidStandard);
      entityManager.flush(); // La excepción se lanza al sincronizar con la DB
    });
  }
}
