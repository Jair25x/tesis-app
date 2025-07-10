package com.tesis.curriculum_service.util;

import com.tesis.curriculum_service.model.Competency;
import com.tesis.curriculum_service.model.Curriculum;
import com.tesis.curriculum_service.model.LearningObjective;
import com.tesis.curriculum_service.model.Standard;
import com.tesis.curriculum_service.repository.CompetencyRepository;
import com.tesis.curriculum_service.repository.CurriculumRepository;
import com.tesis.curriculum_service.repository.LearningObjectiveRepository;
import com.tesis.curriculum_service.repository.StandardRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Inicializa la base de datos con el Currículo Nacional Peruano (2016)
 * de Educación Básica Regular para el área de Matemática en 6.º grado.
 * 
 * Basado en:
 * - Currícula Nacional de Educación Básica (MINEDU, 2016). Área: Matemática.
 * Ciclo VI.
 * - Libro de Matemática 6.º Grado – MINEDU (Serie de fichas educativas, 2022).
 * 
 * Activo solo en perfiles de desarrollo: dev, docker, local.
 */
@Component
@Profile({ "dev", "docker", "local" })
@RequiredArgsConstructor
public class DataInitializer {

        private final CurriculumRepository curriculumRepository;
        private final CompetencyRepository competencyRepository;
        private final StandardRepository standardRepository;
        private final LearningObjectiveRepository learningObjectiveRepository;

        @PostConstruct
        public void init() {
                if (curriculumRepository.count() == 0) {
                        System.out.println("📘 Iniciando carga de datos del Currículo de Matemática 6to Grado...");

                        // --- CURRÍCULO ---
                        Curriculum mathCurriculum6 = Curriculum.builder()
                                        .name("Currículo Nacional de Matemática - 6to Grado")
                                        .description("Define los aprendizajes fundamentales en matemática para el 6to grado de primaria en Perú (EBR 2016) y cubre temas del libro de texto del MINEDU.")
                                        .code("CN-MATH-6")
                                        .grade("6to Grado")
                                        .active(true)
                                        .build();
                        curriculumRepository.save(mathCurriculum6);

                        // === COMPETENCIA 1: Problemas de cantidad ===
                        Competency compCantidad = competencyRepository.save(Competency.builder()
                                        .name("Resuelve problemas de cantidad")
                                        .description("Transforma problemas de cantidad en expresiones numéricas y viceversa.")
                                        .curriculum(mathCurriculum6)
                                        .build());

                        Standard stdCantidad = standardRepository.save(Standard.builder()
                                        .name("Establece relaciones entre datos y operaciones con números.")
                                        .description("Estándar de aprendizaje para el ciclo VI, relacionado con la comprensión de la cantidad.")
                                        .competency(compCantidad)
                                        .build());

                        List<LearningObjective> objetivosCantidad = Arrays.asList(
                                        LearningObjective.builder().description(
                                                        "Resuelve problemas que implican agregar, quitar, comparar o repartir cantidades.")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Representa números hasta el millón usando diferentes formas (números, signos, expresiones verbales). (Ficha 44)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Utiliza múltiplos y divisores para resolver situaciones de reparto. (Fichas 6 a 11)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Identifica números primos en contextos de agrupación. (Ficha 5)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Interpreta potencias como productos reiterados. (Ficha 21)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Resuelve problemas con números mixtos y fracciones. (Fichas 22, 23)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Representa, compara y ordena números decimales. (Fichas 29, 30)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Realiza operaciones con decimales: suma, resta, multiplicación y división. (Fichas 31 a 33, 41, 42)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Resuelve problemas con operaciones combinadas de naturales y decimales. (Ficha 43)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Aplica proporcionalidad y valor unitario en situaciones prácticas. (Fichas 17, 18)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Relaciona fracciones decimales con porcentajes. (Ficha 45)")
                                                        .standard(stdCantidad).build(),
                                        LearningObjective.builder().description(
                                                        "Resuelve problemas de comparación y combinación de cantidades. (Ficha 19)")
                                                        .standard(stdCantidad).build());
                        learningObjectiveRepository.saveAll(objetivosCantidad);

                        // === COMPETENCIA 2: Regularidad, equivalencia y cambio ===
                        Competency compCambio = competencyRepository.save(Competency.builder()
                                        .name("Resuelve problemas de regularidad, equivalencia y cambio")
                                        .description("Identifica patrones, reglas y relaciones de cambio entre magnitudes.")
                                        .curriculum(mathCurriculum6)
                                        .build());

                        Standard stdCambio = standardRepository.save(Standard.builder()
                                        .name("Establece y representa relaciones entre magnitudes.")
                                        .description("Relaciona cambios entre variables y patrones numéricos. (Ficha 4)")
                                        .competency(compCambio)
                                        .build());

                        List<LearningObjective> objetivosCambio = Arrays.asList(
                                        LearningObjective.builder().description(
                                                        "Representa relaciones de cambio con tablas y gráficos. (Ficha 4)")
                                                        .standard(stdCambio).build(),
                                        LearningObjective.builder().description(
                                                        "Resuelve ecuaciones e inecuaciones de primer grado. (Fichas 28, 39, 40)")
                                                        .standard(stdCambio).build());
                        learningObjectiveRepository.saveAll(objetivosCambio);

                        // === COMPETENCIA 3: Forma, movimiento y localización ===
                        Competency compGeometria = competencyRepository.save(Competency.builder()
                                        .name("Resuelve problemas de forma, movimiento y localización")
                                        .description("Analiza y representa objetos en el espacio y sus movimientos.")
                                        .curriculum(mathCurriculum6)
                                        .build());

                        Standard stdGeometria = standardRepository.save(Standard.builder()
                                        .name("Ubica objetos en el espacio usando coordenadas.")
                                        .description("Trabaja con coordenadas, áreas, perímetros y volúmenes.")
                                        .competency(compGeometria)
                                        .build());

                        List<LearningObjective> objetivosGeometria = Arrays.asList(
                                        LearningObjective.builder().description(
                                                        "Representa rutas y ubicaciones en el plano cartesiano. (Ficha 38)")
                                                        .standard(stdGeometria).build(),
                                        LearningObjective.builder().description(
                                                        "Calcula perímetros y áreas de figuras planas. (Fichas 26, 36, 37)")
                                                        .standard(stdGeometria).build(),
                                        LearningObjective.builder().description(
                                                        "Construye prismas y cilindros; calcula su volumen. (Fichas 3, 14, 16)")
                                                        .standard(stdGeometria).build(),
                                        LearningObjective.builder().description(
                                                        "Reconoce y trabaja con figuras circulares. (Ficha 15)")
                                                        .standard(stdGeometria).build(),
                                        LearningObjective.builder()
                                                        .description("Construye y clasifica triángulos. (Ficha 27)")
                                                        .standard(stdGeometria).build());
                        learningObjectiveRepository.saveAll(objetivosGeometria);

                        // === COMPETENCIA 4: Gestión de datos e incertidumbre ===
                        Competency compDatos = competencyRepository.save(Competency.builder()
                                        .name("Resuelve problemas de gestión de datos e incertidumbre")
                                        .description("Recolecta, organiza y analiza datos estadísticos y probabilísticos.")
                                        .curriculum(mathCurriculum6)
                                        .build());

                        Standard stdDatos = standardRepository.save(Standard.builder()
                                        .name("Representa e interpreta datos estadísticos.")
                                        .description("Utiliza tablas, gráficos y medidas estadísticas.")
                                        .competency(compDatos)
                                        .build());

                        List<LearningObjective> objetivosDatos = Arrays.asList(
                                        LearningObjective.builder().description(
                                                        "Interpreta gráficos estadísticos (barras dobles, pictogramas). (Fichas 12, 24)")
                                                        .standard(stdDatos).build(),
                                        LearningObjective.builder().description(
                                                        "Calcula la media y la moda de un conjunto de datos. (Ficha 34)")
                                                        .standard(stdDatos).build(),
                                        LearningObjective.builder().description(
                                                        "Organiza datos en tablas para facilitar su análisis. (Ficha 1)")
                                                        .standard(stdDatos).build(),
                                        LearningObjective.builder().description(
                                                        "Experimenta con eventos probables y aplica nociones de probabilidad. (Fichas 2, 13, 25, 35)")
                                                        .standard(stdDatos).build());
                        learningObjectiveRepository.saveAll(objetivosDatos);

                        System.out.println("✅ Carga completa del currículo de Matemática 6to Grado finalizada.");
                } else {
                        System.out.println("⚠️ Datos ya existentes. Saltando inicialización del currículo.");
                }
        }
}
