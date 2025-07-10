package com.tesis.curriculum_service.repository;

import com.tesis.curriculum_service.model.Curriculum; // Importa la entidad Curriculum
import org.junit.jupiter.api.BeforeEach; // Para configurar antes de cada test
import org.junit.jupiter.api.DisplayName; // Para nombres de tests más legibles
import org.junit.jupiter.api.Test; // Anotación para métodos de test
import org.springframework.beans.factory.annotation.Autowired; // Para inyectar dependencias
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest; // Anotación clave para tests JPA
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager; // Para operaciones directas de EntityManager en tests
import org.springframework.test.context.ActiveProfiles; // Para activar un perfil específico para tests
import org.springframework.test.context.TestPropertySource; // Para propiedades específicas de tests

import java.time.LocalDateTime; // Para comparar fechas
import java.util.Optional; // Para el manejo de resultados nulos
import java.util.UUID; // Para trabajar con UUIDs

import static org.assertj.core.api.Assertions.assertThat; // Para aserciones fluidas

/**
 * Clase de test para verificar las operaciones de persistencia del
 * {@link CurriculumRepository}.
 * Utiliza {@link DataJpaTest} para un test de slice de la capa JPA,
 * configurando
 * una base de datos en memoria (H2) automáticamente.
 */
@DataJpaTest // ✅ Propósito: Configura un contexto Spring para probar componentes JPA.
             // Inicializa una base de datos en memoria (H2 por defecto) y configura un
             // EntityManager.
             // Por defecto, los tests transaccionales se deshacen al final de cada método,
             // asegurando un estado limpio.
@ActiveProfiles("test") // ✅ Propósito: Activa el perfil "test". Aunque las propiedades principales se
                        // inyectan con TestPropertySource,
                        // es una buena práctica indicar explícitamente el perfil para claridad.
@TestPropertySource(properties = {
    "spring.cloud.config.enabled=false", // ✅ Propósito: Deshabilita la conexión al Config Server para tests.
    "eureka.client.enabled=false" // ✅ Propósito: Deshabilita la conexión a Eureka para tests.
})
public class CurriculumRepositoryTest {

  @Autowired // ✅ Propósito: Inyecta el repositorio que queremos probar. Spring Data JPA crea
             // la implementación por nosotros.
  private CurriculumRepository curriculumRepository;

  @Autowired // ✅ Propósito: Proporciona un EntityManager para realizar operaciones directas
             // en la base de datos
             // dentro de los tests, como persistir entidades o vaciar el contexto.
  private TestEntityManager entityManager;

  private Curriculum sampleCurriculum; // Instancia de currículo de ejemplo para usar en los tests

  @BeforeEach // ✅ Propósito: Se ejecuta antes de cada método de test. Asegura un estado
              // inicial limpio y predecible para cada test.
  void setUp() {
    // Limpiar la base de datos antes de cada test (aunque DataJpaTest por defecto
    // hace rollback)
    // Esto es más explícito si por alguna razón el rollback no se comportara como
    // se espera.
    entityManager.clear();

    // Crear una instancia de Curriculum para usar en los tests
    sampleCurriculum = Curriculum.builder()
        .name("Matemática - 6to Grado")
        .description("Currículo de matemáticas para estudiantes de sexto grado de primaria.")
        .code("MATH-6TH-2016")
        .grade("6th Grade")
        .build();
    // Nota: createdAt y updatedAt se manejarán automáticamente por
    // @PrePersist/@PreUpdate
  }

  @Test // ✅ Propósito: Define un método como una prueba unitaria.
  @DisplayName("Should save a new Curriculum successfully") // ✅ Propósito: Proporciona un nombre legible para el test
                                                            // en los reportes.
  void shouldSaveCurriculum() {
    // Given (Dado): Un objeto Curriculum sampleCurriculum ya inicializado en
    // @BeforeEach

    // When (Cuando): Guardamos el currículo en el repositorio
    Curriculum savedCurriculum = curriculumRepository.save(sampleCurriculum);

    // Then (Entonces): Verificamos que el currículo se guardó correctamente y tiene
    // un ID.
    assertThat(savedCurriculum).isNotNull(); // Asegura que el objeto no es nulo
    assertThat(savedCurriculum.getId()).isNotNull(); // Asegura que se le asignó un ID
    assertThat(savedCurriculum.getName()).isEqualTo("Matemática - 6to Grado"); // Verifica que el nombre coincide
    assertThat(savedCurriculum.getCreatedAt()).isNotNull(); // Verifica que la fecha de creación se estableció
    assertThat(savedCurriculum.getUpdatedAt()).isNotNull(); // Verifica que la fecha de actualización se estableció
    assertThat(savedCurriculum.getCreatedAt()).isEqualTo(savedCurriculum.getUpdatedAt()); // Al inicio, deben ser
                                                                                          // iguales
  }

  @Test
  @DisplayName("Should find Curriculum by ID")
  void shouldFindCurriculumById() {
    // Given: Guardamos un currículo y obtenemos su ID
    entityManager.persist(sampleCurriculum); // Usamos entityManager.persist para asegurar que está en la DB
    entityManager.flush(); // Fuerza la sincronización con la DB

    // When: Buscamos el currículo por su ID
    Optional<Curriculum> foundCurriculum = curriculumRepository.findById(sampleCurriculum.getId());

    // Then: Verificamos que se encontró y coincide
    assertThat(foundCurriculum).isPresent(); // Asegura que se encontró un valor
    assertThat(foundCurriculum.get().getName()).isEqualTo(sampleCurriculum.getName());
  }

  @Test
  @DisplayName("Should return empty Optional when Curriculum not found by ID")
  void shouldReturnEmptyOptionalWhenCurriculumNotFoundById() {
    // Given: Un ID que sabemos que no existe
    UUID nonExistentId = UUID.randomUUID();

    // When: Buscamos un currículo con ese ID
    Optional<Curriculum> foundCurriculum = curriculumRepository.findById(nonExistentId);

    // Then: Verificamos que el Optional está vacío
    assertThat(foundCurriculum).isEmpty();
  }

  @Test
  @DisplayName("Should find Curriculum by name ignoring case")
  void shouldFindCurriculumByNameIgnoreCase() {
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush();

    // When: Buscamos por el nombre en diferentes casos
    Optional<Curriculum> foundCurriculum = curriculumRepository.findByNameIgnoreCase("matemática - 6to grado");

    // Then: Debe encontrarlo
    assertThat(foundCurriculum).isPresent();
    assertThat(foundCurriculum.get().getName()).isEqualTo(sampleCurriculum.getName());
  }

  @Test
  @DisplayName("Should find Curriculum by code")
  void shouldFindCurriculumByCode() {
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush();

    // When: Buscamos por el código
    Optional<Curriculum> foundCurriculum = curriculumRepository.findByCode("MATH-6TH-2016");

    // Then: Debe encontrarlo
    assertThat(foundCurriculum).isPresent();
    assertThat(foundCurriculum.get().getCode()).isEqualTo(sampleCurriculum.getCode());
  }

  @Test
  @DisplayName("Should return true when Curriculum exists by name")
  void shouldReturnTrueWhenCurriculumExistsByName() {
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush();

    // When: Verificamos si existe por nombre
    boolean exists = curriculumRepository.existsByName("Matemática - 6to Grado");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Curriculum does not exist by name")
  void shouldReturnFalseWhenCurriculumDoesNotExistByName() {
    // Given: No hay currículos guardados con este nombre
    // When: Verificamos si existe por nombre
    boolean exists = curriculumRepository.existsByName("Non Existent Curriculum");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should return true when Curriculum exists by code")
  void shouldReturnTrueWhenCurriculumExistsByCode() {
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush();

    // When: Verificamos si existe por código
    boolean exists = curriculumRepository.existsByCode("MATH-6TH-2016");

    // Then: Debe ser true
    assertThat(exists).isTrue();
  }

  @Test
  @DisplayName("Should return false when Curriculum does not exist by code")
  void shouldReturnFalseWhenCurriculumDoesNotExistByCode() {
    // Given: No hay currículos guardados con este código
    // When: Verificamos si existe por código
    boolean exists = curriculumRepository.existsByCode("NON-EXISTENT-CODE");

    // Then: Debe ser false
    assertThat(exists).isFalse();
  }

  @Test
  @DisplayName("Should update Curriculum successfully")
  void shouldUpdateCurriculum() throws InterruptedException { // ✅ Añadir throws InterruptedException
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush(); // Fuerza la escritura a la DB antes de la actualización

    // ✅ Introducir una pequeña pausa para asegurar que LocalDateTime.now() genere
    // un valor diferente
    Thread.sleep(10); // Pausar 10 milisegundos.

    // Cuando: Modificamos el nombre y la descripción
    sampleCurriculum.setName("Matemática - Primaria Superior");
    sampleCurriculum.setDescription("Nueva descripción para el currículo de matemáticas.");
    Curriculum updatedCurriculum = curriculumRepository.save(sampleCurriculum);
    entityManager.flush(); // Fuerza la actualización y el callback @PreUpdate

    // Then: Verificamos que se actualizó y la fecha de actualización cambió
    assertThat(updatedCurriculum).isNotNull();
    assertThat(updatedCurriculum.getName()).isEqualTo("Matemática - Primaria Superior");
    assertThat(updatedCurriculum.getDescription()).isEqualTo("Nueva descripción para el currículo de matemáticas.");
    // Verifica que updatedAt es estrictamente posterior a createdAt
    assertThat(updatedCurriculum.getUpdatedAt()).isAfter(updatedCurriculum.getCreatedAt());
  }

  @Test
  @DisplayName("Should delete Curriculum by ID")
  void shouldDeleteCurriculumById() {
    // Given: Guardamos un currículo
    entityManager.persist(sampleCurriculum);
    entityManager.flush(); // Asegura que está en la DB

    // When: Eliminamos el currículo por su ID
    curriculumRepository.deleteById(sampleCurriculum.getId());
    entityManager.flush(); // Fuerza la eliminación

    // Then: Verificamos que ya no existe
    Optional<Curriculum> foundCurriculum = curriculumRepository.findById(sampleCurriculum.getId());
    assertThat(foundCurriculum).isEmpty();
  }
}
