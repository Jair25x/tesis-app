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

                        /* ----------------- COMPETENCIES ----------------- */
                        Set<Competency> competencies = def.competencies.stream().map(compDef -> {
                                Competency comp = Competency.builder()
                                                .code(compDef.code)
                                                .name(compDef.name)
                                                .description(compDef.description)
                                                .curriculum(curriculum)
                                                .build();

                                /* ------------- STANDARDS ------------- */
                                Set<Standard> standards = compDef.standards.stream().map(stdDef -> {
                                        Standard std = Standard.builder()
                                                        .code(stdDef.code)
                                                        .name(stdDef.name)
                                                        .description(stdDef.description)
                                                        .competency(comp)
                                                        .build();

                                        /* ---------- LEARNING OBJECTIVES ---------- */
                                        Set<LearningObjective> los = stdDef.learningObjectives.stream().map(loDef -> {
                                                LearningObjective lo = LearningObjective.builder()
                                                                .code(loDef.code)
                                                                .name(loDef.name)
                                                                .description(loDef.description)
                                                                .standard(std)
                                                                .build();

                                                /* ------------- EXERCISES ------------- */
                                                if (loDef.exercises != null) {
                                                        Set<Exercise> exercises = loDef.exercises.stream()
                                                                        .map(exDef -> {
                                                                                LocalDateTime now = LocalDateTime.now();

                                                                                Exercise exercise = Exercise.builder()
                                                                                                .statement(exDef.statement)
                                                                                                .difficulty(Exercise.Difficulty
                                                                                                                .valueOf(exDef.difficulty))
                                                                                                .type(exDef.type)
                                                                                                .templateType(TemplateType
                                                                                                                .valueOf(exDef.templateType))
                                                                                                .parameters(exDef.parameters)
                                                                                                .correctAnswer(exDef.correctAnswer) // ✅
                                                                                                                                    // NUEVO
                                                                                                .learningObjective(lo)
                                                                                                .active(true)
                                                                                                .createdAt(now)
                                                                                                .updatedAt(now)
                                                                                                .build();

                                                                                /* --- SolutionSteps --- */
                                                                                if (exDef.solutionSteps != null) {
                                                                                        Set<SolutionStep> steps = exDef.solutionSteps
                                                                                                        .stream()
                                                                                                        .map(stepDef -> SolutionStep
                                                                                                                        .builder()
                                                                                                                        .stepNumber(stepDef.stepNumber)
                                                                                                                        .explanation(stepDef.explanation)
                                                                                                                        .exercise(exercise)
                                                                                                                        .active(true)
                                                                                                                        .createdAt(now)
                                                                                                                        .updatedAt(now)
                                                                                                                        .build())
                                                                                                        .collect(Collectors
                                                                                                                        .toCollection(LinkedHashSet::new));
                                                                                        exercise.setSolutionSteps(
                                                                                                        steps);
                                                                                }

                                                                                /* --- Hints --- */
                                                                                if (exDef.hints != null) {
                                                                                        Set<Hint> hints = exDef.hints
                                                                                                        .stream()
                                                                                                        .map(hintDef -> Hint
                                                                                                                        .builder()
                                                                                                                        .hintText(hintDef.hintText)
                                                                                                                        .cost(hintDef.cost)
                                                                                                                        .exercise(exercise)
                                                                                                                        .createdAt(now)
                                                                                                                        .updatedAt(now)
                                                                                                                        .build())
                                                                                                        .collect(Collectors
                                                                                                                        .toCollection(LinkedHashSet::new));
                                                                                        exercise.setHints(hints);
                                                                                }

                                                                                return exercise;
                                                                        }).collect(Collectors.toCollection(
                                                                                        LinkedHashSet::new));
                                                        lo.setExercises(exercises);
                                                }
                                                return lo;
                                        }).collect(Collectors.toCollection(LinkedHashSet::new));

                                        std.setLearningObjectives(los);
                                        return std;
                                }).collect(Collectors.toCollection(LinkedHashSet::new));

                                comp.setStandards(standards);
                                return comp;
                        }).collect(Collectors.toCollection(LinkedHashSet::new));

                        curriculum.setCompetencies(competencies);
                        curriculumRepository.save(curriculum);
                        System.out.println("✅ Currículo, ejercicios, pistas y pasos cargados.");
                }
        }

        /* ------------ DTOs para el parser YAML ------------ */

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
                public String correctAnswer; // ✅ NUEVO CAMPO
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
