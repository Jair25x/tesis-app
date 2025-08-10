package com.tesis.curriculum_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tesis.curriculum_service.model.*;
import com.tesis.curriculum_service.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(roles = "STUDENT")
class ExerciseCheckControllerTests {

    @MockitoBean
    private com.tesis.curriculum_service.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper om;
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    CurriculumRepository curriculumRepo;
    @Autowired
    CompetencyRepository compRepo;
    @Autowired
    StandardRepository stdRepo;
    @Autowired
    LearningObjectiveRepository loRepo;
    @Autowired
    ExerciseRepository exRepo;

    UUID curId, compId, stdId, loId, eqId, qaId, compId2;

    @BeforeEach
    void initData() {
        // 1) DB limpia total para cada test
        jdbc.execute("""
                  TRUNCATE TABLE solution_steps, hints, exercises,
                                 learning_objectives, standards, competencies, curricula
                  RESTART IDENTITY CASCADE
                """);

        // 2) Currículo -> Competencia -> Estándar -> LO
        Curriculum c = Curriculum.builder()
                .code("CURR-MATH-6")
                .name("MVP")
                .description("tests")
                .grade("6°")
                .build();
        curriculumRepo.save(c);
        curId = c.getId();

        Competency comp = Competency.builder()
                .code("C.1").name("Datos")
                .description("Tablas").curriculum(c).build();
        compRepo.save(comp);
        compId = comp.getId();

        Standard std = Standard.builder()
                .code("S.1.1").name("Tablas frecuencia")
                .description("Moda y total").competency(comp).build();
        stdRepo.save(std);
        stdId = std.getId();

        LearningObjective lo = LearningObjective.builder()
                .code("LO.1.1.1").name("Analizar tablas")
                .description("Moda/total").standard(std).build();
        loRepo.save(lo);
        loId = lo.getId();

        // 3) Exercicios

        // (A) EQUATION_SINGLE_CHOICE
        Map<String, Object> eqParams = new LinkedHashMap<>();
        eqParams.put("a", 6);
        eqParams.put("b", 7);
        eqParams.put("choices", List.of("36", "40", "42", "48"));
        eqParams.put("answer", "42");

        Exercise eq = Exercise.builder()
                .statement("¿Resultado?")
                .difficulty(Exercise.Difficulty.BASIC)
                .type("CHOICE")
                .templateType(com.tesis.curriculum_service.dto.TemplateSchema.TemplateType.EQUATION_SINGLE_CHOICE)
                .parameters(eqParams)
                .learningObjective(lo)
                .active(true)
                .build();
        exRepo.save(eq);
        eqId = eq.getId();

        // (B) FREQUENCY_TABLE_QA
        Map<String, Object> qaParams = new LinkedHashMap<>();
        qaParams.put("columns", List.of("Actividad", "Frecuencia"));
        qaParams.put("rows", List.of(
                Map.of("actividad", "Ajedrez", "frecuencia", 10),
                Map.of("actividad", "Cantar", "frecuencia", 12),
                Map.of("actividad", "Bailar", "frecuencia", 8),
                Map.of("actividad", "Otras", "frecuencia", 5)));
        qaParams.put("questions", List.of(
                Map.of("id", "q1", "kind", "single_choice", "prompt", "¿Moda?", "options",
                        List.of("Ajedrez", "Cantar", "Bailar", "Otras"), "answer", "Cantar"),
                Map.of("id", "q2", "kind", "numeric", "prompt", "¿Total?", "answer", 35)));

        Exercise qa = Exercise.builder()
                .statement("Observa y responde")
                .difficulty(Exercise.Difficulty.BASIC)
                .type("TABLE_QA")
                .templateType(com.tesis.curriculum_service.dto.TemplateSchema.TemplateType.FREQUENCY_TABLE_QA)
                .parameters(qaParams)
                .learningObjective(lo)
                .active(true)
                .build();
        exRepo.save(qa);
        qaId = qa.getId();

        // (C) FREQUENCY_TABLE_COMPLETE
        Map<String, Object> compParams = new LinkedHashMap<>();
        compParams.put("columns", List.of("Actividad", "Frecuencia"));
        compParams.put("rows", List.of(
                Map.of("actividad", "Ajedrez", "frecuencia", 14),
                Map.of("actividad", "Cantar", "frecuencia", 11),
                Map.of("actividad", "Bailar", "frecuencia", 10),
                Map.of("actividad", "Otras", "frecuencia", 5)));
        compParams.put("missing", List.of(Map.of("cell", "total", "answer", 40)));

        Exercise compE = Exercise.builder()
                .statement("Completa los datos")
                .difficulty(Exercise.Difficulty.BASIC)
                .type("TABLE_COMPLETE")
                .templateType(com.tesis.curriculum_service.dto.TemplateSchema.TemplateType.FREQUENCY_TABLE_COMPLETE)
                .parameters(compParams)
                .learningObjective(lo)
                .active(true)
                .build();
        exRepo.save(compE);
        compId2 = compE.getId();
    }

    @Test
    void check_equation_single_choice_ok() throws Exception {
        var body = om.readTree("{\"answer\":{\"value\":\"42\"}}");
        mockMvc.perform(post(
                "/api/curricula/{cur}/competencies/{co}/standards/{st}/learning-objectives/{lo}/exercises/{ex}/check",
                curId, compId, stdId, loId, eqId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.score").value(1.0));
    }

    @Test
    void check_frequency_table_qa_partial() throws Exception {
        var body = om.readTree("{\"answer\":{\"answers\":{\"q1\":\"Cantar\",\"q2\":34}}}");
        mockMvc.perform(post(
                "/api/curricula/{cur}/competencies/{co}/standards/{st}/learning-objectives/{lo}/exercises/{ex}/check",
                curId, compId, stdId, loId, qaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(false))
                .andExpect(jsonPath("$.score").value(0.5));
    }

    @Test
    void check_frequency_table_complete_ok() throws Exception {
        var body = om.readTree("{\"answer\":{\"filled\":{\"total\":40}}}");
        mockMvc.perform(post(
                "/api/curricula/{cur}/competencies/{co}/standards/{st}/learning-objectives/{lo}/exercises/{ex}/check",
                curId, compId, stdId, loId, compId2)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correct").value(true))
                .andExpect(jsonPath("$.score").value(1.0));
    }
}
