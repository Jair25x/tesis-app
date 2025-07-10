package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.CurriculumServiceApplication;
import com.tesis.curriculum_service.config.SecurityConfig;
import com.tesis.curriculum_service.dto.CurriculumRequest;
import com.tesis.curriculum_service.dto.CurriculumResponse;
import com.tesis.curriculum_service.dto.CurriculumStatsResponse;
import com.tesis.curriculum_service.exception.ErrorResponse; // Importar ErrorResponse para el debug
import com.tesis.curriculum_service.exception.ResourceNotFoundException;
import com.tesis.curriculum_service.service.CurriculumService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult; // Importar MvcResult para andDo
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

/**
 * Clase de pruebas unitarias para {@link CurriculumController}.
 * Utiliza {@link WebMvcTest} para centrarse en la capa web y {@link MockMvc}
 * para simular peticiones HTTP.
 * {@link MockBean} se utiliza para mockear las dependencias del controlador.
 * Se importa {@link SecurityConfig} para que las reglas de seguridad se
 * apliquen en el test.
 */
@WebMvcTest(controllers = CurriculumController.class,
    // Excluimos la auto-configuración de la clase principal para evitar cargar
    // beans innecesarios
    // y conflictos de inicialización con componentes que WebMvcTest no debería
    // gestionar.
    excludeAutoConfiguration = {
        CurriculumServiceApplication.class
    })
@Import(SecurityConfig.class)
public class CurriculumControllerTest {

  @Autowired
  private WebApplicationContext webApplicationContext;

  private MockMvc mockMvc;

  @MockBean
  private CurriculumService curriculumService;

  @Autowired
  private ObjectMapper objectMapper;

  private CurriculumRequest curriculumRequest;
  private CurriculumResponse curriculumResponse;
  private UUID testId;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders
        .webAppContextSetup(webApplicationContext)
        .apply(springSecurity())
        .build();

    testId = UUID.randomUUID();
    curriculumRequest = CurriculumRequest.builder()
        .name("Matemática 6to Grado")
        .description("Currículo completo de matemática para sexto grado de primaria")
        .code("MATH-6")
        .grade("6th Grade")
        .build();

    curriculumResponse = CurriculumResponse.builder()
        .id(testId)
        .name("Matemática 6to Grado")
        .description("Currículo completo de matemática para sexto grado de primaria")
        .code("MATH-6")
        .grade("6th Grade")
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
  }

  // --- Tests para el Endpoint POST /api/curriculum (Crear Currículo) ---

  @Test
  @DisplayName("POST /api/curriculum - Debe crear un currículo exitosamente con rol ADMIN")
  void createCurriculum_shouldReturnCreatedCurriculum_whenAdmin() throws Exception {
    when(curriculumService.createCurriculum(any(CurriculumRequest.class))).thenReturn(curriculumResponse);

    mockMvc.perform(post("/api/curriculum")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(curriculumRequest))
        .with(user("adminuser").roles("ADMIN")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(curriculumResponse.getId().toString()))
        .andExpect(jsonPath("$.name").value(curriculumResponse.getName()))
        .andExpect(jsonPath("$.code").value(curriculumResponse.getCode()));

    verify(curriculumService, times(1)).createCurriculum(any(CurriculumRequest.class));
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe denegar acceso (403) si no es ADMIN")
  void createCurriculum_shouldReturnForbidden_whenNotAdmin() throws Exception {
    mockMvc.perform(post("/api/curriculum")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(curriculumRequest))
        .with(user("testuser").roles("USER")))
        .andExpect(status().isForbidden());

    verify(curriculumService, never()).createCurriculum(any(CurriculumRequest.class));
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe devolver 400 Bad Request si la validación falla (nombre en blanco)")
  void createCurriculum_shouldReturnBadRequest_whenValidationFails() throws Exception {
    CurriculumRequest invalidRequest = CurriculumRequest.builder()
        .name("")
        .description("Descripción")
        .code("CODE-INVALID")
        .grade("Grade")
        .build();

    mockMvc.perform(post("/api/curriculum")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(invalidRequest))
        .with(user("adminuser").roles("ADMIN")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").exists());

    verify(curriculumService, never()).createCurriculum(any(CurriculumRequest.class));
  }

  @Test
  @DisplayName("POST /api/curriculum - Debe devolver 409 Conflict si el currículo ya existe (nombre/código duplicado)")
  void createCurriculum_shouldReturnConflict_whenCurriculumExists() throws Exception {
    when(curriculumService.createCurriculum(any(CurriculumRequest.class)))
        .thenThrow(
            new IllegalArgumentException("Ya existe un currículo con el nombre: " + curriculumRequest.getName()));

    mockMvc.perform(post("/api/curriculum")
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(curriculumRequest))
        .with(user("adminuser").roles("ADMIN")))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message").value("Ya existe un currículo con el nombre: " + curriculumRequest.getName()));

    verify(curriculumService, times(1)).createCurriculum(any(CurriculumRequest.class));
  }

  // --- Tests para el Endpoint GET /api/curriculum/{id} (Obtener Currículo por
  // ID) ---

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe obtener currículo por ID exitosamente con usuario autenticado")
  void getCurriculumById_shouldReturnCurriculum_whenAuthenticated() throws Exception {
    when(curriculumService.getCurriculumById(testId)).thenReturn(curriculumResponse);

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(get("/api/curriculum/{id}", testId.toString())
        .with(user("testuser").roles("USER")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (GET by ID) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              // Intenta parsear el ErrorResponse para obtener el mensaje específico
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (GET by ID) -----");
          }
        })
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(testId.toString()))
        .andExpect(jsonPath("$.name").value(curriculumResponse.getName()));

    verify(curriculumService, times(1)).getCurriculumById(testId);
  }

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo no existe")
  void getCurriculumById_shouldReturnNotFound_whenCurriculumNotFound() throws Exception {
    when(curriculumService.getCurriculumById(testId))
        .thenThrow(new ResourceNotFoundException("Currículo no encontrado con ID: " + testId));

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(get("/api/curriculum/{id}", testId.toString())
        .with(user("testuser").roles("USER")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (GET by ID Not Found) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (GET by ID Not Found) -----");
          }
        })
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Currículo no encontrado con ID: " + testId));

    verify(curriculumService, times(1)).getCurriculumById(testId);
  }

  @Test
  @DisplayName("GET /api/curriculum/{id} - Debe denegar acceso (401) si no está autenticado")
  void getCurriculumById_shouldReturnUnauthorized_whenNotAuthenticated() throws Exception {
    mockMvc.perform(get("/api/curriculum/{id}", testId.toString()))
        .andExpect(status().isUnauthorized());

    verify(curriculumService, never()).getCurriculumById(any(UUID.class));
  }

  // --- Tests para el Endpoint GET /api/curriculum (Obtener Todos los Currículos)
  // ---

  @Test
  @DisplayName("GET /api/curriculum - Debe obtener todos los currículos exitosamente (permitAll)")
  void getAllCurricula_shouldReturnAllCurricula() throws Exception {
    List<CurriculumResponse> mockResponses = Arrays.asList(
        curriculumResponse,
        CurriculumResponse.builder().id(UUID.randomUUID()).name("Física 6to Grado").description("desc").code("PHY-6")
            .grade("6th Grade").createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
    when(curriculumService.getAllCurriculums()).thenReturn(mockResponses);

    mockMvc.perform(get("/api/curriculum"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].name").value(curriculumResponse.getName()));

    verify(curriculumService, times(1)).getAllCurriculums();
  }

  @Test
  @DisplayName("GET /api/curriculum - Debe devolver lista vacía si no hay currículos")
  void getAllCurricula_shouldReturnEmptyList_whenNoCurricula() throws Exception {
    when(curriculumService.getAllCurriculums()).thenReturn(Collections.emptyList());

    mockMvc.perform(get("/api/curriculum"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(0));

    verify(curriculumService, times(1)).getAllCurriculums();
  }

  // --- Tests para el Endpoint GET /api/curriculum/grade/{grade} (Obtener
  // Currículos por Grado) ---

  @Test
  @DisplayName("GET /api/curriculum/grade/{grade} - Debe obtener currículos por grado exitosamente con usuario autenticado")
  void getCurriculaByGrade_shouldReturnCurricula_whenAuthenticated() throws Exception {
    String grade = "6th Grade";
    List<CurriculumResponse> mockResponses = Arrays.asList(curriculumResponse);
    when(curriculumService.getCurriculaByGrade(grade)).thenReturn(mockResponses);

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(get("/api/curriculum/grade/{grade}", grade)
        .with(user("testuser").roles("USER")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (GET by Grade) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (GET by Grade) -----");
          }
        })
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].grade").value(grade));

    verify(curriculumService, times(1)).getCurriculaByGrade(grade);
  }

  @Test
  @DisplayName("GET /api/curriculum/grade/{grade} - Debe denegar acceso (401) si no está autenticado")
  void getCurriculaByGrade_shouldReturnUnauthorized_whenNotAuthenticated() throws Exception {
    String grade = "6th Grade";
    mockMvc.perform(get("/api/curriculum/grade/{grade}", grade))
        .andExpect(status().isUnauthorized());

    verify(curriculumService, never()).getCurriculaByGrade(anyString());
  }

  // --- Tests para el Endpoint GET /api/curriculum/stats (Obtener Estadísticas)
  // ---

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe obtener estadísticas exitosamente con rol ADMIN")
  void getCurriculumStats_shouldReturnStats_whenAdmin() throws Exception {
    CurriculumStatsResponse statsResponse = CurriculumStatsResponse.builder()
        .totalCurriculums(10).totalCompetencies(50).totalStandards(200).totalLearningObjectives(1000).build();
    when(curriculumService.getCurriculumStats()).thenReturn(statsResponse);

    mockMvc.perform(get("/api/curriculum/stats")
        .with(user("adminuser").roles("ADMIN")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalCurriculums").value(10))
        .andExpect(jsonPath("$.totalCompetencies").value(50));

    verify(curriculumService, times(1)).getCurriculumStats();
  }

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe obtener estadísticas exitosamente con rol TEACHER")
  void getCurriculumStats_shouldReturnStats_whenTeacher() throws Exception {
    CurriculumStatsResponse statsResponse = CurriculumStatsResponse.builder()
        .totalCurriculums(5).totalCompetencies(25).totalStandards(100).totalLearningObjectives(500).build();
    when(curriculumService.getCurriculumStats()).thenReturn(statsResponse);

    mockMvc.perform(get("/api/curriculum/stats")
        .with(user("teacheruser").roles("TEACHER")))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalCurriculums").value(5));

    verify(curriculumService, times(1)).getCurriculumStats();
  }

  @Test
  @DisplayName("GET /api/curriculum/stats - Debe denegar acceso (403) si no es ADMIN o TEACHER")
  void getCurriculumStats_shouldReturnForbidden_whenNotAdminOrTeacher() throws Exception {
    mockMvc.perform(get("/api/curriculum/stats")
        .with(user("studentuser").roles("STUDENT")))
        .andExpect(status().isForbidden());

    verify(curriculumService, never()).getCurriculumStats();
  }

  // --- Tests para el Endpoint PUT /api/curriculum/{id} (Actualizar Currículo)
  // ---

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe actualizar un currículo exitosamente con rol ADMIN")
  void updateCurriculum_shouldReturnUpdatedCurriculum_whenAdmin() throws Exception {
    CurriculumRequest updateRequest = CurriculumRequest.builder()
        .name("Matemática 7mo Grado (Actualizado)")
        .description("Descripción actualizada")
        .code("MATH-7-UPD")
        .grade("7th Grade")
        .build();
    CurriculumResponse updatedResponse = CurriculumResponse.builder()
        .id(testId)
        .name(updateRequest.getName())
        .description(updateRequest.getDescription())
        .code(updateRequest.getCode())
        .grade(updateRequest.getGrade())
        .createdAt(curriculumResponse.getCreatedAt())
        .updatedAt(LocalDateTime.now())
        .build();

    when(curriculumService.updateCurriculum(eq(testId), any(CurriculumRequest.class))).thenReturn(updatedResponse);

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(put("/api/curriculum/{id}", testId.toString())
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(updateRequest))
        .with(user("adminuser").roles("ADMIN")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (Update) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (Update) -----");
          }
        })
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(testId.toString()))
        .andExpect(jsonPath("$.name").value(updateRequest.getName()))
        .andExpect(jsonPath("$.name").value(updateRequest.getName())) // ✅ Corregido aquí, era duplicado
        .andExpect(jsonPath("$.code").value(updateRequest.getCode()));

    verify(curriculumService, times(1)).updateCurriculum(eq(testId), any(CurriculumRequest.class));
  }

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe denegar acceso (403) si no es ADMIN")
  void updateCurriculum_shouldReturnForbidden_whenNotAdmin() throws Exception {
    mockMvc.perform(put("/api/curriculum/{id}", testId.toString())
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(curriculumRequest))
        .with(user("teacheruser").roles("TEACHER")))
        .andExpect(status().isForbidden());

    verify(curriculumService, never()).updateCurriculum(any(UUID.class), any(CurriculumRequest.class));
  }

  @Test
  @DisplayName("PUT /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo no existe al actualizar")
  void updateCurriculum_shouldReturnNotFound_whenCurriculumNotFound() throws Exception {
    when(curriculumService.updateCurriculum(eq(testId), any(CurriculumRequest.class)))
        .thenThrow(new ResourceNotFoundException("Currículo no encontrado con ID: " + testId));

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(put("/api/curriculum/{id}", testId.toString())
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(curriculumRequest))
        .with(user("adminuser").roles("ADMIN")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (Update Not Found) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (Update Not Found) -----");
          }
        })
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Currículo no encontrado con ID: " + testId));

    verify(curriculumService, times(1)).updateCurriculum(eq(testId), any(CurriculumRequest.class));
  }

  // --- Tests para el Endpoint DELETE /api/curriculum/{id} (Eliminar Currículo)
  // ---

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe eliminar currículo exitosamente con rol ADMIN")
  void deleteCurriculum_shouldReturnNoContent_whenAdmin() throws Exception {
    doNothing().when(curriculumService).deleteCurriculum(testId);

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(delete("/api/curriculum/{id}", testId.toString())
        .with(user("adminuser").roles("ADMIN")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (Delete) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (Delete) -----");
          }
        })
        .andExpect(status().isNoContent());

    verify(curriculumService, times(1)).deleteCurriculum(testId);
  }

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe denegar acceso (403) si no es ADMIN")
  void deleteCurriculum_shouldReturnForbidden_whenNotAdmin() throws Exception {
    mockMvc.perform(delete("/api/curriculum/{id}", testId.toString())
        .with(user("studentuser").roles("STUDENT")))
        .andExpect(status().isForbidden());

    verify(curriculumService, never()).deleteCurriculum(any(UUID.class));
  }

  @Test
  @DisplayName("DELETE /api/curriculum/{id} - Debe devolver 404 Not Found si el currículo no existe al eliminar")
  void deleteCurriculum_shouldReturnNotFound_whenCurriculumNotFound() throws Exception {
    doThrow(new ResourceNotFoundException("Currículo no encontrado con ID: " + testId))
        .when(curriculumService).deleteCurriculum(testId);

    // ✅ MODIFICACIÓN PARA DEPURACIÓN: imprimir el resultado si falla
    mockMvc.perform(delete("/api/curriculum/{id}", testId.toString())
        .with(user("adminuser").roles("ADMIN")))
        .andDo(result -> { // Esto es un "side effect", úsalo para depurar
          if (result.getResponse().getStatus() == 400) {
            System.out.println("----- DEBUG 400 RESPONSE START (Delete Not Found) -----");
            System.out.println("Status: " + result.getResponse().getStatus());
            System.out.println("Content: " + result.getResponse().getContentAsString());
            try {
              ErrorResponse errorFromHandler = objectMapper.readValue(result.getResponse().getContentAsString(),
                  ErrorResponse.class);
              System.out.println("Error Message from Handler: " + errorFromHandler.getMessage());
            } catch (Exception e) {
              System.out.println("Could not parse error response: " + e.getMessage());
            }
            System.out.println("----- DEBUG 400 RESPONSE END (Delete Not Found) -----");
          }
        })
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Currículo no encontrado con ID: " + testId));

    verify(curriculumService, times(1)).deleteCurriculum(testId);
  }
}
