// src/main/java/com/tesis/curriculum_service/util/DataInitializer.java
package com.tesis.curriculum_service.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.model.*;
import com.tesis.curriculum_service.repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Component
@Profile({ "dev", "docker" })
@RequiredArgsConstructor
public class DataInitializer {

        private final CurriculumRepository curriculumRepository;
        private final CompetencyRepository competencyRepository;
        private final StandardRepository standardRepository;
        private final LearningObjectiveRepository learningObjectiveRepository;
        private final ExerciseRepository exerciseRepository;
        // (opcional) si tienes repos para hints/steps:
        // private final HintRepository hintRepository;
        // private final SolutionStepRepository solutionStepRepository;

        @Transactional
        @PostConstruct
        public void init() throws Exception {
                ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
                try (InputStream is = new ClassPathResource("data/curriculum-math-6.yml").getInputStream()) {
                        CurriculumDef def = mapper.readValue(is, CurriculumDef.class);

                        // 🔐 Idempotencia real: revisa existencia por code sin filtrar por active
                        if (curriculumRepository.existsByCodeIncludingInactive(def.code)) {
                                System.out.println("⚠️ Currículo " + def.code
                                                + " ya existe (incluyendo inactivos). Saltando seed.");
                                return;
                        }

                        // 1) Curriculum
                        Curriculum curriculum = Curriculum.builder()
                                        .code(def.code)
                                        .name(def.name)
                                        .description(def.description)
                                        .grade(def.grade)
                                        .build();
                        curriculum = curriculumRepository.saveAndFlush(curriculum);

                        // 2) Competencies
                        for (CompetencyDef compDef : def.competencies) {
                                Competency competency = Competency.builder()
                                                .code(compDef.code)
                                                .name(compDef.name)
                                                .description(compDef.description)
                                                .curriculum(curriculum)
                                                .build();
                                competency = competencyRepository.save(competency);

                                // 3) Standards
                                for (StandardDef stdDef : compDef.standards) {
                                        Standard standard = Standard.builder()
                                                        .code(stdDef.code)
                                                        .name(stdDef.name)
                                                        .description(stdDef.description)
                                                        .competency(competency)
                                                        .build();
                                        standard = standardRepository.save(standard);

                                        // 4) Learning Objectives
                                        for (LearningObjectiveDef loDef : stdDef.learningObjectives) {
                                                LearningObjective lo = LearningObjective.builder()
                                                                .code(loDef.code)
                                                                .name(loDef.name)
                                                                .description(loDef.description)
                                                                .standard(standard)
                                                                .build();
                                                lo = learningObjectiveRepository.save(lo);

                                                // 5) Exercises (+ hints / steps)
                                                if (loDef.exercises != null) {
                                                        for (ExerciseDef exDef : loDef.exercises) {
                                                                try {
                                                                        Map<String, Object> params = exDef.parameters != null
                                                                                        ? new LinkedHashMap<>(
                                                                                                        exDef.parameters)
                                                                                        : new LinkedHashMap<>();

                                                                        TemplateType tt = mapTemplateType(
                                                                                        exDef.templateType);

                                                                        // migración legacy: correctAnswer ->
                                                                        // parameters.answer
                                                                        if (tt == TemplateType.EQUATION_SINGLE_CHOICE) {
                                                                                if (exDef.correctAnswer != null
                                                                                                && !exDef.correctAnswer
                                                                                                                .isBlank()
                                                                                                && !params.containsKey(
                                                                                                                "answer")) {
                                                                                        params.put("answer",
                                                                                                        exDef.correctAnswer);
                                                                                }
                                                                        }

                                                                        Exercise exercise = Exercise.builder()
                                                                                        .statement(exDef.statement)
                                                                                        .difficulty(mapDifficulty(
                                                                                                        exDef.difficulty))
                                                                                        .type(exDef.type)
                                                                                        .templateType(tt)
                                                                                        .parameters(params)
                                                                                        .correctAnswer(null) // ya
                                                                                                             // migrado
                                                                                                             // a
                                                                                                             // parameters
                                                                                                             // si
                                                                                                             // aplica
                                                                                        .learningObjective(lo)
                                                                                        .active(true)
                                                                                        .build();

                                                                        // Hints (List)
                                                                        if (exDef.hints != null
                                                                                        && !exDef.hints.isEmpty()) {
                                                                                var hints = exDef.hints.stream()
                                                                                                .map(h -> Hint.builder()
                                                                                                                .hintText(h.hintText)
                                                                                                                .cost(h.cost)
                                                                                                                .exercise(exercise)
                                                                                                                .build())
                                                                                                .toList();
                                                                                exercise.setHints(hints);
                                                                        }

                                                                        // Steps (List) ordenados
                                                                        if (exDef.solutionSteps != null
                                                                                        && !exDef.solutionSteps
                                                                                                        .isEmpty()) {
                                                                                var steps = exDef.solutionSteps.stream()
                                                                                                .sorted(Comparator
                                                                                                                .comparingInt(s -> s.stepNumber))
                                                                                                .map(s -> SolutionStep
                                                                                                                .builder()
                                                                                                                .stepNumber(s.stepNumber)
                                                                                                                .explanation(s.explanation)
                                                                                                                .exercise(exercise)
                                                                                                                .active(true)
                                                                                                                .build())
                                                                                                .toList();
                                                                                exercise.setSolutionSteps(steps);
                                                                        }

                                                                        exerciseRepository.save(exercise); // cascade:
                                                                                                           // hints/steps

                                                                } catch (Exception e) {
                                                                        System.err.println(
                                                                                        "❌ Error cargando ejercicio en LO "
                                                                                                        + loDef.code
                                                                                                        + ": "
                                                                                                        + e.getMessage());
                                                                }
                                                        }
                                                }
                                        }
                                }
                        }

                        // (opcional) pequeño resumen de verificación
                        System.out.printf(
                                        "✅ Seed OK → curricula=%d, competencies=%d, standards=%d, objectives=%d, exercises=%d%n",
                                        curriculumRepository.count(),
                                        competencyRepository.count(),
                                        standardRepository.count(),
                                        learningObjectiveRepository.count(),
                                        exerciseRepository.count()
                        // + (hintRepository != null ? hintRepository.count() : 0),
                        // + (solutionStepRepository != null ? solutionStepRepository.count() : 0)
                        );
                }
        }

        /* ─── Helpers enums (robustos) ─── */
        private Exercise.Difficulty mapDifficulty(String s) {
                try {
                        return Exercise.Difficulty.valueOf(s.toUpperCase(Locale.ROOT));
                } catch (Exception e) {
                        return Exercise.Difficulty.BASIC;
                }
        }

        private TemplateType mapTemplateType(String s) {
                String k = s.toUpperCase(Locale.ROOT);
                if (k.equals("FREQUENCY_ANALYSIS"))
                        return TemplateType.FREQUENCY_TABLE_QA;
                if (k.equals("BASIC_OPERATIONS"))
                        return TemplateType.EQUATION_SINGLE_CHOICE;
                return TemplateType.valueOf(k);
        }

        /* ─── DTOs YAML ─── */
        static class CurriculumDef {
                public String code, name, description, grade;
                public List<CompetencyDef> competencies;
        }

        static class CompetencyDef {
                public String code, name, description;
                public List<StandardDef> standards;
        }

        static class StandardDef {
                public String code, name, description;
                public List<LearningObjectiveDef> learningObjectives;
        }

        static class LearningObjectiveDef {
                public String code, name, description;
                public List<ExerciseDef> exercises;
        }

        static class ExerciseDef {
                public String statement;
                public String difficulty;
                public String type;
                public String templateType;
                public Map<String, Object> parameters;
                public String correctAnswer; // legacy
                public List<HintDef> hints;
                public List<SolutionStepDef> solutionSteps;
        }

        static class HintDef {
                public String hintText;
                public int cost;
        }

        static class SolutionStepDef {
                public int stepNumber;
                public String explanation;
        }
}
