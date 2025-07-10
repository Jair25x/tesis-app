package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Competency; // Importa la entidad Competency
import com.tesis.curriculum_service.model.Curriculum; // Importa la entidad Curriculum (para relaciones)
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
 * {@link CompetencyRepository}.
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
public class CompetencyRepositoryTest {

  @Autowired // Inyecta el repositorio que queremos probar.
  private CompetencyRepository competencyRepository;

  @Autowired // Para operaciones directas de EntityManager en la base de datos de test.
  private TestEntityManager entityManager;

  private Curriculum sampleCurriculum; // Instancia de currículo padre
  private Competency sampleCompetency; // Instancia de competencia de ejemplo

  @BeforeEach // Se ejecuta antes de cada método de test.
  void setUp() {
    entityManager.clear(); // Limpiar el contexto para asegurar estado limpio.

    // Primero, persistir un Curriculum ya que Competency depende de él.
    sampleCurriculum = Curriculum.builder()
        .name("Matemática - 6to Grado")
        .description("Currículo de matemáticas para estudiantes de sexto grado de primaria.")
        .code("MATH-6TH-2016")
        .grade("6th Grade")
        .createdAt(LocalDateTime.now()) // Manualmente setting for test consistency, @PrePersist will also run
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleCurriculum); // Persistir el currículo padre
    entityManager.flush(); // Fuerza la escritura a la DB

    // Crear una instancia de Competency para usar en los tests
    sampleCompetency = Competency.builder()
        .name("Resuelve problemas de cantidad")
        .description("Consiste en que el estudiante solucione problemas...")
        .code("C.01.MATH")
        .curriculum(sampleCurriculum) // Asociar con el currículo creado
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  @Test
  @DisplayName("Should save a new Competency successfully")
  void shouldSaveCompetency() {
    // When: Guardamos la competencia
    Competency savedCompetency = competencyRepository.save(sampleCompetency);

    // Then: Verificamos que la competencia se guardó correctamente y tiene un ID.
    assertThat(savedCompetency).isNotNull();
    assertThat(savedCompetency.getId()).isNotNull();
    assertThat(savedCompetency.getName()).isEqualTo("Resuelve problemas de cantidad");
    assertThat(savedCompetency.getCurriculum()).isEqualTo(sampleCurriculum); // Verifica la asociación con el currículo
    assertThat(savedCompetency.getCreatedAt()).isNotNull();
    assertThat(savedCompetency.getUpdatedAt()).isNotNull();
    assertThat(savedCompetency.getCreatedAt()).isEqualTo(savedCompetency.getUpdatedAt());
  }

  @Test
  @DisplayName("Should find Competency by ID")
  void shouldFindCompetencyById() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Buscamos la competencia por su ID
    Optional<Competency> foundCompetency = competencyRepository.findById(sampleCompetency.getId());

    // Then: Verificamos que se encontró y coincide
    assertThat(foundCompetency).isPresent();
    assertThat(foundCompetency.get().getName()).isEqualTo(sampleCompetency.getName());
    assertThat(foundCompetency.get().getCurriculum().getId()).isEqualTo(sampleCurriculum.getId());
  }

  @Test
  @DisplayName("Should return empty Optional when Competency not found by ID")
  void shouldReturnEmptyOptionalWhenCompetencyNotFoundById() {
    // Given: Un ID que no existe
    UUID nonExistentId = UUID.randomUUID();

    // When: Buscamos una competencia con ese ID
    Optional<Competency> foundCompetency = competencyRepository.findById(nonExistentId);

    // Then: El Optional debe estar vacío
    assertThat(foundCompetency).isEmpty();
  }

  @Test
  @DisplayName("Should find Competency by name ignoring case")
  void shouldFindCompetencyByNameIgnoreCase() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Buscamos por el nombre en diferentes casos
    Optional<Competency> foundCompetency = competencyRepository.findByNameIgnoreCase("resuelve problemas de CANTIDAD");

    // Then: Debe encontrarla
    assertThat(foundCompetency).isPresent();
    assertThat(foundCompetency.get().getName()).isEqualTo(sampleCompetency.getName());
  }

  @Test
  @DisplayName("Should find Competency by code")
  void shouldFindCompetencyByCode() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Buscamos por el código
    Optional<Competency> foundCompetency = competencyRepository.findByCode("C.01.MATH");

    // Then: Debe encontrarla
    assertThat(foundCompetency).isPresent();
    assertThat(foundCompetency.get().getCode()).isEqualTo(sampleCompetency.getCode());
  }

  @Test
  @DisplayName("Should return true when Competency exists by name")
  void shouldReturnTrueWhenCompetencyExistsByName() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Verificamos si existe por nombre
    boolean exists = competencyRepository.existsByName("Resuelve problemas de cantidad");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Competency does not exist by name")
  void shouldReturnFalseWhenCompetencyDoesNotExistByName() {
    // Given: No hay competencia con este nombre
    // When: Verificamos si existe por nombre
    boolean exists = competencyRepository.existsByName("Non Existent Competency");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should return true when Competency exists by code")
  void shouldReturnTrueWhenCompetencyExistsByCode() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Verificamos si existe por código
    boolean exists = competencyRepository.existsByCode("C.01.MATH");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Competency does not exist by code")
  void shouldReturnFalseWhenCompetencyDoesNotExistByCode() {
    // Given: No hay competencia con este código
    // When: Verificamos si existe por código
    boolean exists = competencyRepository.existsByCode("NON-EXISTENT-CODE");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should find all Competencies by Curriculum ID")
  void shouldFindAllCompetenciesByCurriculumId() {
    // Given: Creamos otra competencia para el mismo currículo
    Competency anotherCompetency = Competency.builder()
        .name("Resuelve problemas de regularidad, equivalencia y cambio")
        .description("Otra competencia...")
        .code("C.02.MATH")
        .curriculum(sampleCurriculum)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    entityManager.persist(sampleCompetency);
    entityManager.persist(anotherCompetency);
    entityManager.flush();

    // When: Buscamos todas las competencias del currículo
    List<Competency> competencies = competencyRepository.findAllByCurriculumId(sampleCurriculum.getId());

    // Then: Debe encontrar ambas competencias
    assertThat(competencies).isNotNull();
    assertThat(competencies).hasSize(2); // Debería haber 2 competencias asociadas
    assertThat(competencies).extracting(Competency::getName)
        .containsExactlyInAnyOrder("Resuelve problemas de cantidad",
            "Resuelve problemas de regularidad, equivalencia y cambio");
  }

  @Test
  @DisplayName("Should find Competency by ID and Curriculum ID")
  void shouldFindCompetencyByIdAndCurriculumId() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Buscamos la competencia por su ID y el ID de su currículo
    Optional<Competency> foundCompetency = competencyRepository.findByIdAndCurriculumId(sampleCompetency.getId(),
        sampleCurriculum.getId());

    // Then: Debe encontrarla
    assertThat(foundCompetency).isPresent();
    assertThat(foundCompetency.get().getName()).isEqualTo(sampleCompetency.getName());
  }

  @Test
  @DisplayName("Should not find Competency by ID and wrong Curriculum ID")
  void shouldNotFindCompetencyByIdAndWrongCurriculumId() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Buscamos la competencia por su ID, pero con un ID de currículo
    // incorrecto
    Optional<Competency> foundCompetency = competencyRepository.findByIdAndCurriculumId(sampleCompetency.getId(),
        UUID.randomUUID());

    // Then: No debe encontrarla
    assertThat(foundCompetency).isEmpty();
  }

  @Test
  @DisplayName("Should update Competency successfully")
  void shouldUpdateCompetency() throws InterruptedException { // ✅ Añadido throws InterruptedException
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // ✅ Introducir una pequeña pausa para asegurar que LocalDateTime.now() genere
    // un valor diferente
    Thread.sleep(10); // Pausar 10 milisegundos.

    // Cuando: Modificamos la descripción
    sampleCompetency.setDescription("Descripción actualizada de la competencia.");
    Competency updatedCompetency = competencyRepository.save(sampleCompetency);
    entityManager.flush();

    // Then: Verificamos la actualización
    assertThat(updatedCompetency).isNotNull();
    assertThat(updatedCompetency.getDescription()).isEqualTo("Descripción actualizada de la competencia.");
    assertThat(updatedCompetency.getUpdatedAt()).isAfter(updatedCompetency.getCreatedAt());
  }

  @Test
  @DisplayName("Should delete Competency by ID")
  void shouldDeleteCompetencyById() {
    // Given: Guardamos una competencia
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    // When: Eliminamos la competencia
    competencyRepository.deleteById(sampleCompetency.getId());
    entityManager.flush();

    // Then: Verificamos que ya no existe
    Optional<Competency> foundCompetency = competencyRepository.findById(sampleCompetency.getId());
    assertThat(foundCompetency).isEmpty();
  }

  @Test
  @DisplayName("Should not delete Curriculum when deleting Competency (due to Many-to-One ownership)")
  void shouldNotDeleteCurriculumWhenDeletingCompetency() {
    // Given: Persistir la competencia que ya tiene un currículo asociado
    entityManager.persist(sampleCompetency);
    entityManager.flush();

    UUID curriculumId = sampleCurriculum.getId();

    // When: Eliminamos la competencia
    competencyRepository.delete(sampleCompetency);
    entityManager.flush();

    // Then: El currículo padre aún debe existir
    Curriculum foundCurriculum = entityManager.find(Curriculum.class, curriculumId);
    assertThat(foundCurriculum).isNotNull(); // El currículo padre NO debe ser eliminado
  }

  @Test
  @DisplayName("Should throw exception when saving Competency without Curriculum")
  void shouldThrowExceptionWhenSavingCompetencyWithoutCurriculum() {
    // Given: Una competencia sin currículo asociado (nullable = false en
    // @JoinColumn)
    Competency invalidCompetency = Competency.builder()
        .name("Competencia sin currículo")
        .description("Descripción")
        .code("INVALID-C")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build(); // No se le asigna un currículo

    // When & Then: Intentamos guardarla, y esperamos una excepción de violación de
    // restricción
    assertThrows(jakarta.persistence.PersistenceException.class, () -> {
      competencyRepository.save(invalidCompetency);
      entityManager.flush(); // La excepción se lanza al sincronizar con la DB
    });
  }
}
