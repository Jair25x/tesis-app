package com.tesis.curriculum_service.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.config.SecurityConfig;
import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.dto.CurriculumStatsResponse;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Clase de pruebas de integración para el CurriculumController.
 * Levanta el contexto completo de la aplicación Spring Boot en un puerto
 * aleatorio
 * para probar la interacción entre todas las capas (controlador, servicio,
 * repositorio, DB).
 * Utiliza TestRestTemplate para realizar llamadas HTTP reales a los endpoints,
 * pasando la información de autenticación mediante cabeceras personalizadas.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(SecurityConfig.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class CurriculumIntegrationTest {

  @LocalServerPort
  private int port;

  @Autowired
  private TestRestTemplate restTemplate;

  @Autowired
  private CurriculumRepository curriculumRepository;

  @Autowired
  private ObjectMapper objectMapper;

  private String baseUrl;

  @BeforeEach
  void setUp() {
    curriculumRepository.deleteAll();
    baseUrl = "http://localhost:" + port + "/api/curriculum";
  }

  // Helper para crear HttpHeaders con la información de autenticación simulada
  private HttpHeaders createAuthHeaders(String username, String... roles) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Auth-Username", username);
    headers.set("X-Auth-Roles", String.join(",", roles));
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    // ✅ AÑADIDO: La cabecera X-Internal-Call para que el filtro JWT reconozca la
    // petición como interna
    headers.set("X-Internal-Call", "gateway");
    return headers;
  }

  // --- Tests de Creación (POST /api/curriculum) ---

  @Test
  @DisplayName("POST /api/curriculum - Debe crear un currículo exitosamente con rol ADMIN")
  void createCurriculum_shouldReturnCreated_whenAdmin() {
    String uniqueCode = "MATH-CREATE-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Matemática Creada " + UUID.randomUUID().toString().substring(0, 8);

    CurriculumRequest request = CurriculumRequest.builder()
        .name(uniqueName)
        .description("Descripción detallada del currículo de matemática para 7mo grado.")
        .code(uniqueCode)
        .grade("7th Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<CurriculumResponse> response = restTemplate.postForEntity(baseUrl, entity, CurriculumResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isNotNull();
    assertThat(response.getBody().getName()).isEqualTo(uniqueName);
    assertThat(response.getBody().getCode()).isEqualTo(uniqueCode);
    assertThat(curriculumRepository.findByCode(uniqueCode)).isPresent();
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe devolver 403 Forbidden cuando un usuario sin rol ADMIN intenta crear")
  void createCurriculum_shouldReturnForbidden_whenNotAdmin() {
    String uniqueCode = "MATH-FORBIDDEN-CREATE-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Matemática Prohibida " + UUID.randomUUID().toString().substring(0, 8);

    CurriculumRequest request = CurriculumRequest.builder()
        .name(uniqueName)
        .description("Descripción detallada del currículo de matemática para 8vo grado.")
        .code(uniqueCode)
        .grade("8th Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario con rol USER
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    assertThat(curriculumRepository.findByCode(uniqueCode)).isNotPresent(); // Asegura que no se guardó
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe devolver 401 Unauthorized cuando no se envía autenticación para crear")
  void createCurriculum_shouldReturnUnauthorized_whenNoAuth() {
    String uniqueCode = "MATH-UNAUTH-CREATE-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Matemática No Autorizada " + UUID.randomUUID().toString().substring(0, 8);

    CurriculumRequest request = CurriculumRequest.builder()
        .name(uniqueName)
        .description("Descripción detallada del currículo de matemática para 9no grado.")
        .code(uniqueCode)
        .grade("9th Grade")
        .build();

    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(request); // Sin cabeceras de auth

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(curriculumRepository.findByCode(uniqueCode)).isNotPresent(); // Asegura que no se guardó
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe devolver 400 Bad Request cuando la validación del RequestBody falla")
  void createCurriculum_shouldReturnBadRequest_whenValidationFails() {
    String uniqueCode = "MATH-BADREQUEST-" + UUID.randomUUID().toString().substring(0, 8);

    CurriculumRequest invalidRequest = CurriculumRequest.builder()
        .name("") // Nombre en blanco
        .description("Descripción detallada del currículo de matemática para 7mo grado.")
        .code(uniqueCode)
        .grade("7th Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(invalidRequest, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).contains("Name cannot be blank");
    assertThat(curriculumRepository.findByCode(uniqueCode)).isNotPresent();
  }

  // --- Tests de Consulta por ID (GET /api/curriculum/{id}) ---

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe obtener un currículo por ID exitosamente con autenticación")
  void getCurriculumById_shouldReturnCurriculum_whenAuthenticated() {
    // 1. Crear un currículo con un código/nombre único para este test específico
    String uniqueCode = "MATH-GETBYID-TEST-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Matemática Test GetByID " + UUID.randomUUID().toString().substring(0, 8);

    Curriculum savedCurriculum = curriculumRepository.save(Curriculum.builder()
        .name(uniqueName)
        .description("Descripción para test GET by ID.")
        .code(uniqueCode)
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build());

    // Asegurarse de que el currículo existe en la DB antes de la llamada HTTP
    assertThat(curriculumRepository.findById(savedCurriculum.getId())).isPresent();
    System.out
        .println("DEBUG: Curriculum saved with ID: " + savedCurriculum.getId() + " Name: " + savedCurriculum.getName());

    // 2. Realizar la petición HTTP con TestRestTemplate y cabeceras de auth
    HttpHeaders headers = createAuthHeaders("user1", "USER");
    HttpEntity<Void> entity = new HttpEntity<>(headers); // Sin cuerpo, solo cabeceras

    ResponseEntity<CurriculumResponse> response = restTemplate.exchange(
        baseUrl + "/" + savedCurriculum.getId().toString(),
        HttpMethod.GET,
        entity,
        CurriculumResponse.class);

    // 3. Afirmar el resultado
    System.out.println("DEBUG: HTTP Response Status: " + response.getStatusCode());
    System.out.println("DEBUG: HTTP Response Body: " + response.getBody());

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isEqualTo(savedCurriculum.getId());
    assertThat(response.getBody().getName()).isEqualTo(uniqueName);
  }

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo no existe")
  void getCurriculumById_shouldReturnNotFound() {
    UUID nonExistentId = UUID.randomUUID();
    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Autenticado, pero el recurso no existe
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + nonExistentId.toString(),
        HttpMethod.GET,
        entity,
        String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Currículo no encontrado con ID");
  }

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe devolver 401 Unauthorized si no está autenticado")
  void getCurriculumById_shouldReturnUnauthorized_whenNoAuth() {
    UUID dummyId = UUID.randomUUID();
    ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/" + dummyId.toString(), String.class); // Sin
    // cabeceras
    // de
    // auth

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe devolver 400 Bad Request para ID con formato inválido")
  void getCurriculumById_shouldReturnBadRequest_whenInvalidIdFormat() {
    String invalidId = "invalid-uuid-format";
    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Autenticado, para que llegue al controlador
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + invalidId,
        HttpMethod.GET,
        entity,
        String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody()).contains("no pudo ser convertido al tipo requerido 'UUID'");
  }

  // --- Tests de Consulta Todos (GET /api/curriculum) ---

  @Test
  @DisplayName("GET /api/curriculum - Debe obtener todos los currículos exitosamente (permitAll)")
  void getAllCurricula_shouldReturnAllCurricula() {
    // Crear datos para este test. @Transactional hará rollback después.
    curriculumRepository.save(Curriculum.builder().name("Matemática 1-" + UUID.randomUUID().toString().substring(0, 4))
        .code("M1-" + UUID.randomUUID().toString().substring(0, 4)).grade("1st Grade").build());
    curriculumRepository.save(Curriculum.builder().name("Matemática 2-" + UUID.randomUUID().toString().substring(0, 4))
        .code("M2-" + UUID.randomUUID().toString().substring(0, 4)).grade("2nd Grade").build());

    // Este endpoint es permitAll, no necesita cabeceras de autenticación.
    ResponseEntity<CurriculumResponse[]> response = restTemplate.getForEntity(baseUrl, CurriculumResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().length).isEqualTo(2);
    // Aserciones para nombres con UUID para mayor robustez
    assertThat(response.getBody()).anyMatch(c -> c.getName().startsWith("Matemática 1-"));
    assertThat(response.getBody()).anyMatch(c -> c.getName().startsWith("Matemática 2-"));
  }

  @Test
  @DisplayName("GET /api/curriculum - Debe devolver lista vacía si no hay currículos")
  void getAllCurricula_shouldReturnEmptyList_whenNoCurricula() {
    // No creamos datos para este test, esperamos que la base de datos esté vacía
    ResponseEntity<CurriculumResponse[]> response = restTemplate.getForEntity(baseUrl, CurriculumResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().length).isEqualTo(0);
  }

  // --- Tests de Consulta por Grado (GET /api/curriculum/grade/{grade}) ---

  @Test
  @DisplayName("GET /api/curriculum/grade/{grade} - Debe obtener currículos por grado exitosamente con autenticación")
  void getCurriculaByGrade_shouldReturnCurricula_whenAuthenticated() {
    // Arrange: inserta datos de prueba
    curriculumRepository.save(Curriculum.builder()
        .name("Matematica 6th-" + UUID.randomUUID().toString().substring(0, 4))
        .code("M6-" + UUID.randomUUID().toString().substring(0, 4))
        .grade("6th Grade")
        .active(true)
        .build());

    curriculumRepository.save(Curriculum.builder()
        .name("Matematica 5th-" + UUID.randomUUID().toString().substring(0, 4))
        .code("M5-" + UUID.randomUUID().toString().substring(0, 4))
        .grade("5th Grade")
        .active(true)
        .build());

    HttpHeaders headers = new HttpHeaders();
    headers.add("X-Auth-Username", "user1");
    headers.add("X-Auth-Roles", "USER");
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    // ✅ AÑADIDO: La cabecera X-Internal-Call para que el filtro JWT reconozca la
    // petición como interna
    headers.set("X-Internal-Call", "gateway"); // Importante: no usar add si queremos reemplazar un valor existente, set
                                               // es más seguro
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    String gradeToSearch = "6th Grade";
    String url = UriComponentsBuilder
        .fromUriString(baseUrl)
        .pathSegment("grade", gradeToSearch)
        .build()
        .toUriString();

    // Act: realiza la solicitud GET
    ResponseEntity<String> rawResponse = restTemplate.exchange(
        url,
        HttpMethod.GET,
        entity,
        String.class);

    // Assert: valida respuesta
    assertThat(rawResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(rawResponse.getBody()).isNotNull();

    try {
      List<CurriculumResponse> responseList = objectMapper.readValue(
          rawResponse.getBody(),
          new com.fasterxml.jackson.core.type.TypeReference<>() {
          });

      assertThat(responseList).isNotEmpty();
      assertThat(responseList).hasSize(1);
      assertThat(responseList.get(0).getGrade()).isEqualTo("6th Grade");
      assertThat(responseList.get(0).getName()).startsWith("Matematica 6th-");

    } catch (Exception e) {
      throw new RuntimeException("Fallo al deserializar la respuesta JSON", e);
    }
  }

  @Test
  @DisplayName("GET /api/curriculum/grade/{grade} - Debe devolver 401 Unauthorized si no está autenticado")
  void getCurriculaByGrade_shouldReturnUnauthorized_whenNoAuth() {
    ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/grade/AnyGrade", String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  // --- Tests de Estadísticas (GET /api/curriculum/stats) ---

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe obtener estadísticas exitosamente con rol ADMIN")
  void getCurriculumStats_shouldReturnStats_whenAdmin() {
    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CurriculumStatsResponse> response = restTemplate.exchange(
        baseUrl + "/stats", HttpMethod.GET, entity, CurriculumStatsResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getTotalCurriculums()).isGreaterThanOrEqualTo(0);
  }

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe obtener estadísticas exitosamente con rol TEACHER")
  void getCurriculumStats_shouldReturnStats_whenTeacher() {
    HttpHeaders headers = createAuthHeaders("teacheruser", "TEACHER");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CurriculumStatsResponse> response = restTemplate.exchange(
        baseUrl + "/stats", HttpMethod.GET, entity, CurriculumStatsResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
  }

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe devolver 403 Forbidden si no es ADMIN o TEACHER")
  void getCurriculumStats_shouldReturnForbidden_whenNotAdminOrTeacher() {
    HttpHeaders headers = createAuthHeaders("studentuser", "STUDENT");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/stats", HttpMethod.GET, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
  }

  // --- Tests de Actualización (PUT /api/curriculum/{id}) ---

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe actualizar un currículo exitosamente con rol ADMIN")
  void updateCurriculum_shouldReturnUpdatedCurriculum_whenAdmin() {
    String initialCode = "OLD-M6-" + UUID.randomUUID().toString().substring(0, 8);
    String initialName = "Old Math 6 " + UUID.randomUUID().toString().substring(0, 8);
    Curriculum savedCurriculum = curriculumRepository.save(Curriculum.builder()
        .name(initialName)
        .description("Old Description")
        .code(initialCode)
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build());

    String updatedCode = "UPD-M6-" + UUID.randomUUID().toString().substring(0, 8);
    String updatedName = "Updated Math 6 " + UUID.randomUUID().toString().substring(0, 8);
    CurriculumRequest updateRequest = CurriculumRequest.builder()
        .name(updatedName)
        .description("New Description")
        .code(updatedCode)
        .grade("6th Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<CurriculumResponse> response = restTemplate.exchange(
        baseUrl + "/" + savedCurriculum.getId().toString(),
        HttpMethod.PUT,
        entity,
        CurriculumResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getName()).isEqualTo(updatedName);
    assertThat(curriculumRepository.findById(savedCurriculum.getId()).get().getName()).isEqualTo(updatedName);
  }

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe devolver 403 Forbidden si un usuario sin rol ADMIN intenta actualizar")
  void updateCurriculum_shouldReturnForbidden_whenNotAdmin() {
    String initialCode = "FORBIDDEN-M6-" + UUID.randomUUID().toString().substring(0, 8);
    String initialName = "Math 6 for Forbidden " + UUID.randomUUID().toString().substring(0, 8);
    Curriculum savedCurriculum = curriculumRepository.save(Curriculum.builder()
        .name(initialName)
        .description("Description for Forbidden")
        .code(initialCode)
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build());

    String updateCode = "FORBIDDEN-UPD-" + UUID.randomUUID().toString().substring(0, 8);
    String updateName = "Forbidden Update " + UUID.randomUUID().toString().substring(0, 8);
    CurriculumRequest updateRequest = CurriculumRequest.builder()
        .name(updateName)
        .description("Forbidden Description")
        .code(updateCode)
        .grade("6th Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario sin ADMIN
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + savedCurriculum.getId().toString(),
        HttpMethod.PUT,
        entity,
        String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    assertThat(curriculumRepository.findById(savedCurriculum.getId()).get().getName()).isEqualTo(initialName);
  }

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo a actualizar no existe")
  void updateCurriculum_shouldReturnNotFound_whenCurriculumNotFound() {
    UUID nonExistentId = UUID.randomUUID();
    String uniqueCode = "NON-EXISTENT-" + UUID.randomUUID().toString().substring(0, 4);
    String uniqueName = "Non Existent Update " + UUID.randomUUID().toString().substring(0, 4);
    CurriculumRequest updateRequest = CurriculumRequest.builder()
        .name(uniqueName)
        .description("Non Existent Description")
        .code(uniqueCode)
        .grade("1st Grade")
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN"); // Autenticado, para que llegue al controlador
    HttpEntity<CurriculumRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + nonExistentId.toString(),
        HttpMethod.PUT,
        entity,
        String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Currículo no encontrado con ID: " + nonExistentId);
  }

  // --- Tests de Eliminación (DELETE /api/curriculum/{id}) ---

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe eliminar un currículo exitosamente con rol ADMIN")
  void deleteCurriculum_shouldReturnNoContent_whenAdmin() {
    String uniqueCode = "DEL-M-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Curriculum to Delete " + UUID.randomUUID().toString().substring(0, 8);

    // ✅ Persistir antes y forzar commit
    Curriculum savedCurriculum = curriculumRepository.saveAndFlush(Curriculum.builder()
        .name(uniqueName)
        .description("Description to Delete")
        .code(uniqueCode)
        .grade("1st Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build());

    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Auth-Username", "adminuser");
    headers.set("X-Auth-Roles", "ADMIN");
    headers.set("X-Internal-Call", "gateway"); // ✅ AÑADIDO: Asegurar que el filtro JWT lo procese
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<Void> response = restTemplate.exchange(
        baseUrl + "/" + savedCurriculum.getId(),
        HttpMethod.DELETE,
        entity,
        Void.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    // Para soft delete, ahora esperamos que el currículo esté presente pero
    // inactivo y con deletedAt.
    // Asume que tu entidad Curriculum tiene el campo 'active'.
    Optional<Curriculum> deletedCurriculum = curriculumRepository.findByIdIncludingInactive(savedCurriculum.getId());

    assertThat(deletedCurriculum).isPresent();
    assertThat(deletedCurriculum.get().getActive()).isFalse();
    assertThat(deletedCurriculum.get().getDeletedAt()).isNotNull();
  }

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe devolver 403 Forbidden si un usuario sin rol ADMIN intenta eliminar")
  void deleteCurriculum_shouldReturnForbidden_whenNotAdmin() {
    String uniqueCode = "NOT-DEL-M-" + UUID.randomUUID().toString().substring(0, 8);
    String uniqueName = "Curriculum not to Delete " + UUID.randomUUID().toString().substring(0, 8);
    Curriculum savedCurriculum = curriculumRepository.save(Curriculum.builder()
        .name(uniqueName)
        .description("Description not to Delete")
        .code(uniqueCode)
        .grade("1st Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build());

    HttpHeaders headers = createAuthHeaders("user1", "USER");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + savedCurriculum.getId().toString(),
        HttpMethod.DELETE,
        entity,
        String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    // Para soft delete, esperamos que el currículo siga activo.
    Optional<Curriculum> foundCurriculum = curriculumRepository.findById(savedCurriculum.getId());
    assertThat(foundCurriculum).isPresent();
    assertThat(foundCurriculum.get().getActive()).isTrue(); // Sigue activo si no se pudo borrar
  }

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo a eliminar no existe")
  void deleteCurriculum_shouldReturnNotFound_whenCurriculumNotFound() {
    UUID nonExistentId = UUID.randomUUID();
    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + nonExistentId.toString(),
        HttpMethod.DELETE,
        entity,
        String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Currículo no encontrado con ID: " + nonExistentId);
  }
}
