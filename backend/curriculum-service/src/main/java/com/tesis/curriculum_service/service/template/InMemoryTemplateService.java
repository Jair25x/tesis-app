package com.tesis.curriculum_service.service.template;

import com.tesis.curriculum_service.dto.FieldDescriptor;
import com.tesis.curriculum_service.dto.TemplateSchema;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InMemoryTemplateService implements ExerciseTemplateService {

    private final Map<TemplateSchema.TemplateType, TemplateSchema> schemas = new EnumMap<>(
            TemplateSchema.TemplateType.class);

    @PostConstruct
    public void init() {
        // 🌟 Cantidad / Ecuaciones simples
        schemas.put(TemplateSchema.TemplateType.EQUATION_SOLVE, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.EQUATION_SOLVE)
                .pattern("{{problemStatement}}")
                .fields(List.of(
                        FieldDescriptor.builder().name("problemStatement").type(FieldDescriptor.FieldType.TEXT)
                                .build()))
                .build());

        // 📊 Gestión de datos: moda en tablas
        schemas.put(TemplateSchema.TemplateType.FREQUENCY_ANALYSIS, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.FREQUENCY_ANALYSIS)
                .pattern("Observa la tabla y responde: ¿Cuál es la moda? ¿Qué significa este valor?")
                .fields(List.of(
                        FieldDescriptor.builder().name("tableData").type(FieldDescriptor.FieldType.TEXT).build()))
                .build());

        // 🎲 Probabilidad básica
        schemas.put(TemplateSchema.TemplateType.BASIC_PROB_DECISION, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.BASIC_PROB_DECISION)
                .pattern("Si lanzamos un dado, ¿qué probabilidad hay de que salga {{face}}?")
                .fields(List.of(
                        FieldDescriptor.builder()
                                .name("face")
                                .type(FieldDescriptor.FieldType.CHOICE)
                                .choices(List.of("1", "2", "3", "4", "5", "6"))
                                .build()))
                .build());

        // 📦 Formas y construcción 3D (cubo)
        schemas.put(TemplateSchema.TemplateType.PRISM_CONSTRUCTION, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.PRISM_CONSTRUCTION)
                .pattern("¿Cuál de las siguientes plantillas permite construir un cubo correctamente?")
                .fields(List.of(
                        FieldDescriptor.builder().name("optionsImage").type(FieldDescriptor.FieldType.IMAGE).build()))
                .build());

        // 🌀 Regularidad y patrones (espiral con regletas)
        schemas.put(TemplateSchema.TemplateType.PATTERN_FORMATION, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.PATTERN_FORMATION)
                .pattern(
                        "Según el patrón mostrado, la figura 1 vale {{v1}}, la figura 2 vale {{v2}}. ¿Cómo será la figura {{fn}}?, ¿qué valor tendrá?")
                .fields(List.of(
                        FieldDescriptor.builder().name("v1").type(FieldDescriptor.FieldType.NUMBER).build(),
                        FieldDescriptor.builder().name("v2").type(FieldDescriptor.FieldType.NUMBER).build(),
                        FieldDescriptor.builder().name("fn").type(FieldDescriptor.FieldType.NUMBER).build()))
                .build());

        // 🧮 Cantidad: descomposición en múltiplos
        schemas.put(TemplateSchema.TemplateType.MULT_DIV_CHALLENGE, TemplateSchema.builder()
                .templateType(TemplateSchema.TemplateType.MULT_DIV_CHALLENGE)
                .pattern("Resuelve el problema: {{problemStatement}}")
                .fields(List.of(
                        FieldDescriptor.builder().name("problemStatement").type(FieldDescriptor.FieldType.TEXT)
                                .build()))
                .build());
    }

    @Override
    public List<TemplateSchema> listAll() {
        return new ArrayList<>(schemas.values());
    }

    @Override
    public Optional<TemplateSchema> schemaFor(TemplateSchema.TemplateType type) {
        return Optional.ofNullable(schemas.get(type));
    }
}
