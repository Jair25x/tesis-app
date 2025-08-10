package com.tesis.curriculum_service.service.template;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tesis.curriculum_service.dto.FieldDescriptor;
import com.tesis.curriculum_service.dto.TemplateSchema;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class InMemoryTemplateService implements ExerciseTemplateService {

        private final Map<TemplateSchema.TemplateType, TemplateSchema> schemas = new EnumMap<>(
                        TemplateSchema.TemplateType.class);

        private final ObjectMapper mapper = new ObjectMapper();

        @PostConstruct
        public void init() {
                // 1) EQUATION_SINGLE_CHOICE (Mustache + opciones)
                schemas.put(TemplateSchema.TemplateType.EQUATION_SINGLE_CHOICE, TemplateSchema.builder()
                                .templateType(TemplateSchema.TemplateType.EQUATION_SINGLE_CHOICE)
                                .pattern("Resuelve: {{a}} × {{b}} = ?") // ejemplo
                                .fields(List.of(
                                                FieldDescriptor.builder().name("a")
                                                                .type(FieldDescriptor.FieldType.NUMBER).build(),
                                                FieldDescriptor.builder().name("b")
                                                                .type(FieldDescriptor.FieldType.NUMBER).build()))
                                .example(obj(o -> {
                                        o.put("a", 6);
                                        o.put("b", 7);
                                        o.set("choices", arr("36", "40", "42", "48"));
                                        o.put("answer", "42");
                                }))
                                .build());

                // 2) FREQUENCY_TABLE_QA (tabla con preguntas)
                schemas.put(TemplateSchema.TemplateType.FREQUENCY_TABLE_QA, TemplateSchema.builder()
                                .templateType(TemplateSchema.TemplateType.FREQUENCY_TABLE_QA)
                                .example(obj(o -> {
                                        o.set("columns", arr("Actividad", "Frecuencia"));
                                        var rows = mapper.createArrayNode();
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Ajedrez");
                                                r.put("frecuencia", 10);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Cantar");
                                                r.put("frecuencia", 12);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Bailar");
                                                r.put("frecuencia", 8);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Otras");
                                                r.put("frecuencia", 5);
                                        }));
                                        o.set("rows", rows);

                                        var qs = mapper.createArrayNode();
                                        qs.add(obj(q -> {
                                                q.put("id", "q1");
                                                q.put("kind", "single_choice");
                                                q.put("prompt", "¿Cuál es la moda?");
                                                q.set("options", arr("Ajedrez", "Cantar", "Bailar", "Otras"));
                                                q.put("answer", "Cantar");
                                        }));
                                        qs.add(obj(q -> {
                                                q.put("id", "q2");
                                                q.put("kind", "numeric");
                                                q.put("prompt", "¿Total de estudiantes?");
                                                q.put("answer", 35);
                                        }));
                                        o.set("questions", qs);
                                }))
                                .build());

                // 3) FREQUENCY_TABLE_COMPLETE (completar celdas)
                schemas.put(TemplateSchema.TemplateType.FREQUENCY_TABLE_COMPLETE, TemplateSchema.builder()
                                .templateType(TemplateSchema.TemplateType.FREQUENCY_TABLE_COMPLETE)
                                .example(obj(o -> {
                                        o.set("columns", arr("Actividad", "Frecuencia"));
                                        var rows = mapper.createArrayNode();
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Ajedrez");
                                                r.put("frecuencia", 14);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Cantar");
                                                r.put("frecuencia", 11);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Bailar");
                                                r.put("frecuencia", 10);
                                        }));
                                        rows.add(obj(r -> {
                                                r.put("actividad", "Otras");
                                                r.put("frecuencia", 5);
                                        }));
                                        o.set("rows", rows);

                                        var miss = mapper.createArrayNode();
                                        miss.add(obj(m -> {
                                                m.put("cell", "total");
                                                m.put("answer", 40);
                                        }));
                                        o.set("missing", miss); // el frontend pedirá estos campos al estudiante
                                }))
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

        /* Helpers */
        private ObjectNode obj(java.util.function.Consumer<ObjectNode> c) {
                var n = mapper.createObjectNode();
                c.accept(n);
                return n;
        }

        private com.fasterxml.jackson.databind.node.ArrayNode arr(String... values) {
                var a = mapper.createArrayNode();
                for (var v : values)
                        a.add(v);
                return a;
        }
}
