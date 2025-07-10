package com.tesis.curriculum_service.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.config.SecurityConfig;
import com.tesis.curriculum_service.dto.CompetencyRequest;
import com.tesis.curriculum_service.dto.CompetencyResponse;
import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Clase de pruebas de integración para CompetencyController.
 * Levanta el contexto completo de la aplicación Spring Boot en un puerto
 * aleatorio,
 * utiliza H2 en memoria configurada por 'application-test.properties', y
 * TestRestTemplate para realizar llamadas HTTP reales a los endpoints,
 * pasando la información de autenticación mediante cabeceras personalizadas
 * (X-Auth-Username, X-Auth-Roles).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test") // Activa el perfil 'test' para cargar application-test.properties
@Import(SecurityConfig.class) // Importa la configuración de seguridad para que el filtro JWT esté activo
@DisplayName("Competency Integration Tests with TestRestTemplate and H2")
public class CompetencyIntegrationTest {

  @LocalServerPort
  private int port; // Puerto aleatorio en el que se ejecuta la aplicación

  @Autowired
  private TestRestTemplate restTemplate; // Cliente HTTP para pruebas de integración

  @Autowired
  private CurriculumRepository curriculumRepository; // Repositorio de Currículo para pre-requisitos
  @Autowired
  private CompetencyRepository competencyRepository; // Repositorio de Competencia para verificar el estado de la DB

  @Autowired
  private ObjectMapper objectMapper; // Para serializar/deserializar JSON

  private String baseUrl; // URL base para los endpoints de competencia

  private UUID curriculumId;

  @BeforeEach
  void setUp() {
    // Inicializar la URL base
    baseUrl = "http://localhost:" + port + "/api/competencies";

    // Limpiar la base de datos antes de cada test para asegurar un estado limpio
    competencyRepository.deleteAll();
    curriculumRepository.deleteAll();

    // Crear un currículo de prueba para asociar competencias
    // Generar un código y nombre únicos para el currículo para evitar colisiones
    // entre diferentes test methods
    Curriculum curriculum = Curriculum.builder()
        .code("TEST-CUR-COMP-" + UUID.randomUUID().toString().substring(0, 8))
        .name("Currículo para Competencias Test-" + UUID.randomUUID().toString().substring(0, 8))
        .description("Descripción del currículo para pruebas de Competencia.")
        .grade("1st Grade")
        .active(true)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    curriculum = curriculumRepository.save(curriculum);
    curriculumId = curriculum.getId();
  }

  // Helper para crear HttpHeaders con la información de autenticación simulada
  // (como en CurriculumIntegrationTest)
  private HttpHeaders createAuthHeaders(String username, String... roles) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("X-Auth-Username", username);
    headers.set("X-Auth-Roles", String.join(",", roles));
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    // Esta cabecera es crucial para que tu JwtAuthenticationFilter procese el token
    // simulado
    headers.set("X-Internal-Call", "gateway");
    return headers;
  }

  // --- Tests para POST /api/competencies (Crear Competencia) ---

  @Test
  @DisplayName("POST /api/competencies - Debe crear una competencia exitosamente con rol ADMIN")
  void createCompetency_shouldReturnCreated_whenAdmin() {
    CompetencyRequest request = CompetencyRequest.builder()
        .name("Competencia de Diseño Gráfico")
        .description("Habilidad para crear diseños visuales atractivos.")
        .code("GRAPHIC-DES-001")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<CompetencyResponse> response = restTemplate.postForEntity(baseUrl, entity, CompetencyResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isNotNull();
    assertThat(response.getBody().getName()).isEqualTo("Competencia de Diseño Gráfico");
    assertThat(response.getBody().getCode()).isEqualTo("GRAPHIC-DES-001");
    assertThat(competencyRepository.findByCode("GRAPHIC-DES-001")).isPresent();
  }

  @Test
  @DisplayName("POST /api/competencies - No debe crear una competencia sin rol ADMIN (Forbidden)")
  void createCompetency_shouldReturnForbidden_whenNotAdmin() {
    CompetencyRequest request = CompetencyRequest.builder()
        .name("Competencia Prohibida")
        .description("No debe ser creada.")
        .code("FORBIDDEN-COMP-001")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario con rol USER
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    assertThat(competencyRepository.findByCode("FORBIDDEN-COMP-001")).isNotPresent();
  }

  @Test
  @DisplayName("POST /api/competencies - No debe crear una competencia sin autenticar (Unauthorized)")
  void createCompetency_shouldReturnUnauthorized_whenNoAuth() {
    CompetencyRequest request = CompetencyRequest.builder()
        .name("Competencia No Autorizada")
        .description("No debe ser creada.")
        .code("UNAUTH-COMP-001")
        .curriculumId(curriculumId)
        .build();

    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(request); // Sin cabeceras de auth

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    assertThat(competencyRepository.findByCode("UNAUTH-COMP-001")).isNotPresent();
  }

  @Test
  @DisplayName("POST /api/competencies - No debe crear una competencia con datos inválidos (Bad Request)")
  void createCompetency_shouldReturnBadRequest_whenValidationFails() {
    CompetencyRequest invalidRequest = CompetencyRequest.builder()
        .name("N") // Nombre muy corto (min 3)
        .description("Descripción corta.")
        .code("INVALID-CODE")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(invalidRequest, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    // Ajustado para coincidir con el formato del GlobalExceptionHandler:
    // "Validation failed: {campo=mensaje}"
    assertThat(response.getBody())
        .contains("Validation failed: {name=El nombre de la competencia debe tener entre 3 y 255 caracteres}");
    assertThat(competencyRepository.findByCode("INVALID-CODE")).isNotPresent();
  }

  @Test
  @DisplayName("POST /api/competencies - No debe crear una competencia con curriculumId no existente (Not Found)")
  void createCompetency_shouldReturnNotFound_whenNonExistingCurriculumId() {
    CompetencyRequest request = CompetencyRequest.builder()
        .name("Competencia con Currículo Inexistente")
        .description("Debe fallar la creación.")
        .code("NON-EXIST-CUR-COMP-001")
        .curriculumId(UUID.randomUUID()) // ID de currículo que no existe
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(request, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Curriculum no encontrada con id");
    assertThat(competencyRepository.findByCode("NON-EXIST-CUR-COMP-001")).isNotPresent();
  }

  @Test
  @DisplayName("POST /api/competencies - No debe crear una competencia con código duplicado (Conflict)")
  void createCompetency_shouldReturnConflict_whenDuplicateCode() {
    // Crear la primera competencia
    CompetencyRequest firstRequest = CompetencyRequest.builder()
        .name("Competencia Original")
        .description("Descripción Original.")
        .code("DUPLICATE-CODE")
        .curriculumId(curriculumId)
        .build();
    restTemplate.postForEntity(baseUrl, new HttpEntity<>(firstRequest, createAuthHeaders("adminuser", "ADMIN")),
        CompetencyResponse.class);

    // Intentar crear una segunda competencia con el mismo código
    CompetencyRequest secondRequest = CompetencyRequest.builder()
        .name("Competencia Duplicada")
        .description("Esta debería fallar.")
        .code("DUPLICATE-CODE") // Código duplicado
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(secondRequest, headers);

    ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT); // ✅ Espera 409 CONFLICT
    assertThat(response.getBody()).contains("Ya existe una competencia con el código: DUPLICATE-CODE"); // ✅ Mensaje
                                                                                                        // esperado
  }

  // --- Tests para GET /api/competencies/{id} (Obtener Competencia por ID) ---

  @Test
  @DisplayName("GET /api/competencies/{id} - Debe obtener una competencia por ID exitosamente con autenticación (ADMIN)")
  void getCompetencyById_shouldReturnCompetency_whenAdmin() {
    Competency createdCompetency = createCompetencyInDb("GET-BY-ID-COMP-001", "Competencia GetByID", curriculumId);

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse> response = restTemplate.exchange(
        baseUrl + "/" + createdCompetency.getId(), HttpMethod.GET, entity, CompetencyResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isEqualTo(createdCompetency.getId());
    assertThat(response.getBody().getCode()).isEqualTo("GET-BY-ID-COMP-001");
  }

  @Test
  @DisplayName("GET /api/competencies/{id} - Debe obtener una competencia por ID exitosamente con autenticación (USER)")
  void getCompetencyById_shouldReturnCompetency_whenUser() {
    Competency createdCompetency = createCompetencyInDb("GET-BY-ID-COMP-002", "Competencia GetByID User", curriculumId);

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario USER
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse> response = restTemplate.exchange(
        baseUrl + "/" + createdCompetency.getId(), HttpMethod.GET, entity, CompetencyResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isEqualTo(createdCompetency.getId());
  }

  @Test
  @DisplayName("GET /api/competencies/{id} - No debe obtener una competencia sin autenticar (Unauthorized)")
  void getCompetencyById_shouldReturnUnauthorized_whenNoAuth() {
    ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/" + UUID.randomUUID(), String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  @DisplayName("GET /api/competencies/{id} - Debe devolver 404 Not Found si la competencia no existe")
  void getCompetencyById_shouldReturnNotFound_whenCompetencyDoesNotExist() {
    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + UUID.randomUUID(), HttpMethod.GET, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Competency no encontrada con id");
  }

  // --- Tests para GET /api/competencies (Obtener Todas las Competencias) ---

  @Test
  @DisplayName("GET /api/competencies - Debe obtener todas las competencias activas con rol ADMIN")
  void getAllCompetencies_shouldReturnAllActive_whenAdmin() {
    createCompetencyInDb("ALL-COMP-001", "Competencia All 1", curriculumId);
    createCompetencyInDb("ALL-COMP-002", "Competencia All 2", curriculumId);
    // Crear una inactiva para asegurar que no se liste
    Competency inactiveComp = Competency.builder()
        .code("ALL-COMP-INACTIVE")
        .name("Competencia Inactiva para All")
        .description("Desc.")
        .curriculum(curriculumRepository.findById(curriculumId).get())
        .active(false)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    competencyRepository.save(inactiveComp);

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse[]> response = restTemplate.exchange(
        baseUrl, HttpMethod.GET, entity, CompetencyResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody()).hasSize(2);
    assertThat(response.getBody()).extracting(CompetencyResponse::getCode).containsExactlyInAnyOrder("ALL-COMP-001",
        "ALL-COMP-002");
  }

  @Test
  @DisplayName("GET /api/competencies - Debe obtener todas las competencias activas con rol USER")
  void getAllCompetencies_shouldReturnAllActive_whenUser() {
    createCompetencyInDb("ALL-COMP-003", "Competencia All 3", curriculumId);
    createCompetencyInDb("ALL-COMP-004", "Competencia All 4", curriculumId);

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario USER
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse[]> response = restTemplate.exchange(
        baseUrl, HttpMethod.GET, entity, CompetencyResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody()).hasSize(2);
  }

  @Test
  @DisplayName("GET /api/competencies - No debe obtener todas las competencias sin autenticar (Unauthorized)")
  void getAllCompetencies_shouldReturnUnauthorized_whenNoAuth() {
    ResponseEntity<String> response = restTemplate.getForEntity(baseUrl, String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  // --- Tests para GET /api/competencies/by-curriculum/{curriculumId} (Obtener
  // Competencias por Currículo) ---

  @Test
  @DisplayName("GET /api/competencies/by-curriculum/{curriculumId} - Debe obtener competencias activas por curriculumId con rol ADMIN")
  void getCompetenciesByCurriculumId_shouldReturnCompetencies_whenAdmin() {
    // Generar un código único para el currículo para evitar colisiones
    UUID otherCurriculumId = curriculumRepository.save(Curriculum.builder()
        .code("OTHER-CUR-COMP-" + UUID.randomUUID().toString().substring(0, 8))
        .name("Otro Currículo-" + UUID.randomUUID().toString().substring(0, 8))
        .description("").grade("2nd Grade").active(true)
        .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()).getId();

    createCompetencyInDb("BY-CUR-COMP-001", "Comp Cur 1", curriculumId);
    createCompetencyInDb("BY-CUR-COMP-002", "Comp Cur 2", curriculumId);
    createCompetencyInDb("BY-CUR-COMP-003", "Comp Other Cur 1", otherCurriculumId); // De otro currículo
    // Inactiva en el currículo principal
    Competency inactiveComp = Competency.builder()
        .code("BY-CUR-INACTIVE")
        .name("Comp Inactiva Cur")
        .description("Desc.")
        .curriculum(curriculumRepository.findById(curriculumId).get())
        .active(false)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    competencyRepository.save(inactiveComp);

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse[]> response = restTemplate.exchange(
        baseUrl + "/by-curriculum/" + curriculumId, HttpMethod.GET, entity, CompetencyResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody()).hasSize(2);
    assertThat(response.getBody()).extracting(CompetencyResponse::getCurriculumId).containsOnly(curriculumId);
    assertThat(response.getBody()).extracting(CompetencyResponse::getCode).containsExactlyInAnyOrder("BY-CUR-COMP-001",
        "BY-CUR-COMP-002");
  }

  @Test
  @DisplayName("GET /api/competencies/by-curriculum/{curriculumId} - Debe obtener competencias activas por curriculumId con rol USER")
  void getCompetenciesByCurriculumId_shouldReturnCompetencies_whenUser() {
    createCompetencyInDb("BY-CUR-COMP-004", "Comp Cur 4", curriculumId);
    createCompetencyInDb("BY-CUR-COMP-005", "Comp Cur 5", curriculumId);

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario USER
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<CompetencyResponse[]> response = restTemplate.exchange(
        baseUrl + "/by-curriculum/" + curriculumId, HttpMethod.GET, entity, CompetencyResponse[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody()).hasSize(2);
    assertThat(response.getBody()).extracting(CompetencyResponse::getCurriculumId).containsOnly(curriculumId);
  }

  @Test
  @DisplayName("GET /api/competencies/by-curriculum/{curriculumId} - No debe obtener competencias por curriculumId sin autenticar (Unauthorized)")
  void getCompetenciesByCurriculumId_shouldReturnUnauthorized_whenNoAuth() {
    ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/by-curriculum/" + curriculumId,
        String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  @DisplayName("GET /api/competencies/by-curriculum/{curriculumId} - Debe devolver 404 si el curriculumId no existe")
  void getCompetenciesByCurriculumId_shouldReturnNotFound_whenCurriculumDoesNotExist() {
    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/by-curriculum/" + UUID.randomUUID(), HttpMethod.GET, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Curriculum no encontrada con id");
  }

  // --- Tests para PUT /api/competencies/{id} (Actualizar Competencia) ---

  @Test
  @DisplayName("PUT /api/competencies/{id} - Debe actualizar una competencia exitosamente con rol ADMIN")
  void updateCompetency_shouldReturnOk_whenAdmin() {
    Competency originalCompetency = createCompetencyInDb("UPDATE-COMP-001", "Comp Original", curriculumId);

    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("Competencia Actualizada")
        .description("Descripción Nueva.")
        .code("UPDATED-COMP-001")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN"); // Usuario ADMIN
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<CompetencyResponse> response = restTemplate.exchange(
        baseUrl + "/" + originalCompetency.getId(), HttpMethod.PUT, entity, CompetencyResponse.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isEqualTo(originalCompetency.getId());
    assertThat(response.getBody().getName()).isEqualTo("Competencia Actualizada");
    assertThat(response.getBody().getCode()).isEqualTo("UPDATED-COMP-001");

    Optional<Competency> updatedInDb = competencyRepository.findById(originalCompetency.getId());
    assertThat(updatedInDb).isPresent();
    assertThat(updatedInDb.get().getActive()).isTrue();
    assertThat(updatedInDb.get().getName()).isEqualTo("Competencia Actualizada");
    assertThat(updatedInDb.get().getCode()).isEqualTo("UPDATED-COMP-001");
  }

  @Test
  @DisplayName("PUT /api/competencies/{id} - No debe actualizar una competencia sin rol ADMIN (Forbidden)")
  void updateCompetency_shouldReturnForbidden_whenNotAdmin() {
    Competency originalCompetency = createCompetencyInDb("UPDATE-COMP-002", "Comp Forbidden", curriculumId);

    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("Competencia Actualizada por User")
        .description("Descripción Nueva.")
        .code("UPDATED-COMP-002")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario USER
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + originalCompetency.getId(), HttpMethod.PUT, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    Optional<Competency> notUpdated = competencyRepository.findById(originalCompetency.getId());
    assertThat(notUpdated).isPresent();
    assertThat(notUpdated.get().getName()).isEqualTo("Comp Forbidden");
  }

  @Test
  @DisplayName("PUT /api/competencies/{id} - No debe actualizar una competencia sin autenticar (Unauthorized)")
  void updateCompetency_shouldReturnUnauthorized_whenNoAuth() {
    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("Cualquier Nombre")
        .description("Cualquier Desc.")
        .code("ANY-CODE")
        .curriculumId(curriculumId)
        .build();

    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + UUID.randomUUID(), HttpMethod.PUT, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  @DisplayName("PUT /api/competencies/{id} - Debe devolver 404 Not Found si la competencia a actualizar no existe")
  void updateCompetency_shouldReturnNotFound_whenCompetencyDoesNotExist() {
    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("Non Existent Comp")
        .description("Desc.")
        .code("NON-EXIST-CODE")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + UUID.randomUUID(), HttpMethod.PUT, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Competency no encontrada con id");
  }

  @Test
  @DisplayName("PUT /api/competencies/{id} - No debe actualizar una competencia con datos inválidos (Bad Request)")
  void updateCompetency_shouldReturnBadRequest_whenValidationFails() {
    Competency originalCompetency = createCompetencyInDb("UPDATE-COMP-003", "Comp Invalid Update", curriculumId);

    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("") // Nombre inválido (vacío)
        .description("Desc.")
        .code("VALID-CODE")
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + originalCompetency.getId(), HttpMethod.PUT, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    assertThat(response.getBody())
        .containsAnyOf(
            "Validation failed: {name=El nombre de la competencia no puede estar en blanco}",
            "Validation failed: {name=El nombre de la competencia debe tener entre 3 y 255 caracteres}");
  }

  @Test
  @DisplayName("PUT /api/competencies/{id} - No debe actualizar una competencia con código duplicado (Conflict)")
  void updateCompetency_shouldReturnConflict_whenDuplicateCode() {
    Competency comp1 = createCompetencyInDb("CODE-X", "Comp X", curriculumId);
    createCompetencyInDb("CODE-Y", "Comp Y", curriculumId); // Esta tendrá el código duplicado

    CompetencyRequest updateRequest = CompetencyRequest.builder()
        .name("Comp X Updated")
        .description("Desc.")
        .code("CODE-Y") // Intentar actualizar la comp1 con el código de compY
        .curriculumId(curriculumId)
        .build();

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<CompetencyRequest> entity = new HttpEntity<>(updateRequest, headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + comp1.getId(), HttpMethod.PUT, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT); // ✅ Espera 409 CONFLICT
    assertThat(response.getBody()).contains("Ya existe una competencia con el código: CODE-Y"); // ✅ Mensaje esperado
  }

  // --- Tests para DELETE /api/competencies/{id} (Eliminar Lógicamente
  // Competencia) ---

  @Test
  @DisplayName("DELETE /api/competencies/{id} - Debe eliminar lógicamente una competencia exitosamente con rol ADMIN")
  void deleteCompetency_shouldReturnNoContent_whenAdmin() {
    Competency competencyToDelete = createCompetencyInDb("DELETE-COMP-001", "Comp a Borrar", curriculumId);

    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN"); // Usuario ADMIN
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<Void> response = restTemplate.exchange(
        baseUrl + "/" + competencyToDelete.getId(), HttpMethod.DELETE, entity, Void.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

    Optional<Competency> deletedInDb = competencyRepository.findByIdIncludingInactive(competencyToDelete.getId());
    assertThat(deletedInDb).isPresent();
    assertThat(deletedInDb.get().getActive()).isFalse();
    assertThat(deletedInDb.get().getDeletedAt()).isNotNull();

    ResponseEntity<String> getResponse = restTemplate.exchange(
        baseUrl + "/" + competencyToDelete.getId(), HttpMethod.GET, entity, String.class);
    assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
  }

  @Test
  @DisplayName("DELETE /api/competencies/{id} - No debe eliminar lógicamente una competencia sin rol ADMIN (Forbidden)")
  void deleteCompetency_shouldReturnForbidden_whenNotAdmin() {
    Competency competencyToDelete = createCompetencyInDb("DELETE-COMP-002", "Comp Borrar Forbidden", curriculumId);

    HttpHeaders headers = createAuthHeaders("user1", "USER"); // Usuario USER
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + competencyToDelete.getId(), HttpMethod.DELETE, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    Optional<Competency> notDeleted = competencyRepository.findById(competencyToDelete.getId());
    assertThat(notDeleted).isPresent();
    assertThat(notDeleted.get().getActive()).isTrue();
  }

  @Test
  @DisplayName("DELETE /api/competencies/{id} - No debe eliminar lógicamente una competencia sin autenticar (Unauthorized)")
  void deleteCompetency_shouldReturnUnauthorized_whenNoAuth() {
    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + UUID.randomUUID(), HttpMethod.DELETE, new HttpEntity<>(new HttpHeaders()), String.class);
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
  }

  @Test
  @DisplayName("DELETE /api/competencies/{id} - Debe devolver 404 Not Found si la competencia a eliminar no existe")
  void deleteCompetency_shouldReturnNotFound_whenCompetencyDoesNotExist() {
    HttpHeaders headers = createAuthHeaders("adminuser", "ADMIN");
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    ResponseEntity<String> response = restTemplate.exchange(
        baseUrl + "/" + UUID.randomUUID(), HttpMethod.DELETE, entity, String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    assertThat(response.getBody()).contains("Competency not found with ID:");
  }

  // --- Métodos Auxiliares ---

  /**
   * Crea una competencia directamente en la base de datos para los tests.
   * No pasa por el controlador, lo que es útil para configurar pre-requisitos.
   */
  private Competency createCompetencyInDb(String code, String name, UUID curriculumRefId) {
    Curriculum refCurriculum = curriculumRepository.findById(curriculumRefId)
        .orElseThrow(() -> new IllegalStateException("Currículo de referencia no encontrado."));

    Competency competency = Competency.builder()
        .name(name)
        .description("Descripción para " + name)
        .code(code)
        .curriculum(refCurriculum)
        .active(true)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
    return competencyRepository.saveAndFlush(competency);
  }
}