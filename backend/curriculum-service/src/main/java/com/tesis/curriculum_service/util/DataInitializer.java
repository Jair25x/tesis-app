package com.tesis.curriculum_service.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.tesis.curriculum_service.model.*;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.io.InputStream;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Inicializa la BD con el currículo de Matemática 6.º grado
 * leyendo todos los datos desde un YAML externo.
 * Solo en perfiles: dev, docker o local.
 */
@Component
@Profile({ "dev", "docker", "local" })
@RequiredArgsConstructor
public class DataInitializer {

        private final CurriculumRepository curriculumRepository;

        @PostConstruct
        public void init() throws Exception {
                if (curriculumRepository.count() > 0) {
                        System.out.println("⚠️ Datos ya existentes. Saltando inicialización.");
                        return;
                }

                // 1. Leer YAML
                ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
                try (InputStream is = new ClassPathResource("data/curriculum-math-6.yml").getInputStream()) {
                        CurriculumDef def = mapper.readValue(is, CurriculumDef.class);

                        // 2. Construir grafo JPA
                        Curriculum curriculum = Curriculum.builder()
                                        .code(def.code)
                                        .name(def.name)
                                        .description(def.description)
                                        .grade(def.grade)
                                        .build();

                        Set<Competency> comps = def.competencies.stream().map(cdef -> {
                                Competency comp = Competency.builder()
                                                .code(cdef.code)
                                                .name(cdef.name)
                                                .description(cdef.description)
                                                .curriculum(curriculum)
                                                .build();

                                Set<Standard> standards = cdef.standards.stream().map(sdef -> {
                                        Standard std = Standard.builder()
                                                        .code(sdef.code)
                                                        .name(sdef.name)
                                                        .description(sdef.description)
                                                        .competency(comp)
                                                        .build();

                                        std.setLearningObjectives(sdef.learningObjectives.stream().map(lodef -> {
                                                LearningObjective lo = LearningObjective.builder()
                                                                .code(lodef.code)
                                                                .name(lodef.name)
                                                                .description(lodef.description)
                                                                .standard(std)
                                                                .build();
                                                return lo;
                                        }).collect(Collectors.toSet()));

                                        return std;
                                }).collect(Collectors.toSet());

                                comp.setStandards(standards);
                                return comp;
                        }).collect(Collectors.toSet());

                        curriculum.setCompetencies(comps);

                        // 3. Persistir TODO en cascada
                        curriculumRepository.save(curriculum);
                        System.out.println("✅ Currículo 6.º grado cargado desde YAML.");
                }
        }

        // --- DTOs para parseo YAML ---
        static class CurriculumDef {
                public String code, name, description, grade;
                public java.util.List<CompetencyDef> competencies;
        }

        static class CompetencyDef {
                public String code, name, description;
                public java.util.List<StandardDef> standards;
        }

        static class StandardDef {
                public String code, name, description;
                public java.util.List<LearningObjectiveDef> learningObjectives;
        }

        static class LearningObjectiveDef {
                public String code, name, description;
        }
}
