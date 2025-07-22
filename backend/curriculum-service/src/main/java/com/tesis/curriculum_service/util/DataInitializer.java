// src/main/java/com/tesis/curriculum_service/util/DataInitializer.java
package com.tesis.curriculum_service.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.tesis.curriculum_service.dto.TemplateSchema.TemplateType;
import com.tesis.curriculum_service.model.*;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Carga inicial del currículo de matemática y sus componentes desde archivo
 * YAML.
 */
@Component
@Profile({ "dev", "docker" })
@RequiredArgsConstructor
public class DataInitializer {

        private final CurriculumRepository curriculumRepository;

        @PostConstruct
        public void init() throws Exception {
                if (curriculumRepository.count() > 0) {
                        System.out.println("⚠️ Datos ya existentes. Saltando inicialización.");
                        return;
                }

                ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
                try (InputStream is = new ClassPathResource("data/curriculum-math-6.yml").getInputStream()) {
                        CurriculumDef def = mapper.readValue(is, CurriculumDef.class);

                        Curriculum curriculum = Curriculum.builder()
                                        .code(def.code)
                                        .name(def.name)
                                        .description(def.description)
                                        .grade(def.grade)
                                        .build();

                        Set<Competency> competencies = def.competencies.stream().map(compDef -> {
                                Competency competency = Competency.builder()
                                                .code(compDef.code)
                                                .name(compDef.name)
                                                .description(compDef.description)
                                                .curriculum(curriculum)
                                                .build();

                                Set<Standard> standards = compDef.standards.stream().map(stdDef -> {
                                        Standard standard = Standard.builder()
                                                        .code(stdDef.code)
                                                        .name(stdDef.name)
                                                        .description(stdDef.description)
                                                        .competency(competency)
                                                        .build();

                                        Set<LearningObjective> learningObjectives = stdDef.learningObjectives.stream()
                                                        .map(loDef -> {
                                                                LearningObjective lo = LearningObjective.builder()
                                                                                .code(loDef.code)
                                                                                .name(loDef.name)
                                                                                .description(loDef.description)
                                                                                .standard(standard)
                                                                                .build();

                                                                // Cargar ejercicios si hay
                                                                if (loDef.exercises != null) {
                                                                        Set<Exercise> exercises = loDef.exercises
                                                                                        .stream().map(exDef -> {
                                                                                                LocalDateTime now = LocalDateTime
                                                                                                                .now();

                                                                                                Exercise exercise = Exercise
                                                                                                                .builder()
                                                                                                                .statement(exDef.statement)
                                                                                                                .difficulty(Exercise.Difficulty
                                                                                                                                .valueOf(exDef.difficulty))
                                                                                                                .type(exDef.type)
                                                                                                                .templateType(TemplateType
                                                                                                                                .valueOf(exDef.templateType))
                                                                                                                .parameters(exDef.parameters)
                                                                                                                .correctAnswer(exDef.correctAnswer)
                                                                                                                .learningObjective(
                                                                                                                                lo)
                                                                                                                .active(true)
                                                                                                                .build();

                                                                                                // Pistas
                                                                                                if (exDef.hints != null) {
                                                                                                        Set<Hint> hints = exDef.hints
                                                                                                                        .stream()
                                                                                                                        .map(hintDef -> Hint
                                                                                                                                        .builder()
                                                                                                                                        .hintText(hintDef.hintText)
                                                                                                                                        .cost(hintDef.cost)
                                                                                                                                        .exercise(exercise)
                                                                                                                                        .build())
                                                                                                                        .collect(Collectors
                                                                                                                                        .toCollection(LinkedHashSet::new));
                                                                                                        exercise.setHints(
                                                                                                                        hints);
                                                                                                }

                                                                                                // Pasos
                                                                                                if (exDef.solutionSteps != null) {
                                                                                                        Set<SolutionStep> steps = exDef.solutionSteps
                                                                                                                        .stream()
                                                                                                                        .map(stepDef -> SolutionStep
                                                                                                                                        .builder()
                                                                                                                                        .stepNumber(stepDef.stepNumber)
                                                                                                                                        .explanation(stepDef.explanation)
                                                                                                                                        .exercise(exercise)
                                                                                                                                        .active(true)
                                                                                                                                        .build())
                                                                                                                        .collect(Collectors
                                                                                                                                        .toCollection(LinkedHashSet::new));
                                                                                                        exercise.setSolutionSteps(
                                                                                                                        steps);
                                                                                                }

                                                                                                return exercise;
                                                                                        }).collect(Collectors
                                                                                                        .toCollection(LinkedHashSet::new));

                                                                        lo.setExercises(exercises);
                                                                }

                                                                return lo;
                                                        }).collect(Collectors.toCollection(LinkedHashSet::new));

                                        standard.setLearningObjectives(learningObjectives);
                                        return standard;
                                }).collect(Collectors.toCollection(LinkedHashSet::new));

                                competency.setStandards(standards);
                                return competency;
                        }).collect(Collectors.toCollection(LinkedHashSet::new));

                        curriculum.setCompetencies(competencies);
                        curriculumRepository.save(curriculum);
                        System.out.println("✅ Currículo, ejercicios, pistas y pasos cargados.");
                }
        }

        /* -------------- DTOs usados para parsear el archivo YAML -------------- */

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
                public String correctAnswer;
                public List<SolutionStepDef> solutionSteps;
                public List<HintDef> hints;
        }

        static class SolutionStepDef {
                public int stepNumber;
                public String explanation;
        }

        static class HintDef {
                public String hintText;
                public int cost;
        }
}
