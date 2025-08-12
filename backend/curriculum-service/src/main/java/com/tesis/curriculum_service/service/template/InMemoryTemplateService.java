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
                                .uiHints(obj(h -> {
                                        h.put("notes",
                                                        "Estructura: 'columns' y 'rows' definen la tabla. 'questions' es una lista de preguntas sobre la tabla. "
                                                                        + "Soportado: 'single_choice' y 'numeric'. Para 'single_choice' debes incluir 'options' (string[]) y 'answer' como string. "
                                                                        + "Para 'numeric', 'answer' es un número. 'id' debe ser único por pregunta.");

                                        // Descripción de tipos de pregunta soportados
                                        var kinds = mapper.createObjectNode();
                                        var sc = mapper.createObjectNode();
                                        sc.put("answerType", "string");
                                        sc.put("optionsRequired", true);
                                        sc.put("optionsType", "string[]");
                                        sc.put("exampleAnswer", "Cantar");

                                        var num = mapper.createObjectNode();
                                        num.put("answerType", "number");
                                        num.put("optionsRequired", false);
                                        num.put("exampleAnswer", 35);

                                        kinds.set("single_choice", sc);
                                        kinds.set("numeric", num);
                                        h.set("questionKinds", kinds);

                                        // Esquema lógico de cada pregunta (en lenguaje humano/JSON-suave)
                                        var qSchema = mapper.createObjectNode();
                                        qSchema.put("id", "string (único, obligatorio)");
                                        qSchema.put("kind", "\"single_choice\" | \"numeric\"");
                                        qSchema.put("prompt", "string (obligatorio)");
                                        qSchema.put("options", "string[] (obligatorio si kind = single_choice)");
                                        qSchema.put("answer", "string | number (tipo acorde a kind)");
                                        h.set("questionSchema", qSchema);

                                        // Reglas/validaciones útiles para el autor
                                        var rules = mapper.createArrayNode();
                                        rules.add("columns: mínimo 2 columnas (p. ej., 'Actividad', 'Frecuencia').");
                                        rules.add("rows: cada fila debe tener al menos una clave/valor; típicamente { actividad: string, frecuencia: number }.");
                                        rules.add("questions: lista no vacía; cada 'id' debe ser único.");
                                        rules.add("single_choice: 'options' no vacío y 'answer' debe existir dentro de 'options'.");
                                        rules.add("numeric: 'answer' numérico.");
                                        h.set("authoringRules", rules);

                                        // Sugerencias de UI (el front puede usarlas o ignorarlas)
                                        var ui = mapper.createObjectNode();
                                        ui.put("showTableCompact", true);
                                        ui.put("align", "center");
                                        h.set("ui", ui);
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
                                        // Ejemplo alternativo de celda faltante por etiqueta de fila:
                                        // miss.add(obj(m -> { m.put("cell", "Cantar"); m.put("answer", 11); }));

                                        o.set("missing", miss);

                                        // 💡 Nuevo: documentamos el total objetivo opcional para la UI
                                        o.put("targetTotal", 40);
                                }))
                                // 💡 Pista para el front: claves válidas en "missing.cell" y uso de targetTotal
                                .uiHints(obj(h -> {
                                        h.put("notes", "Las celdas faltantes pueden indicarse como 'total', 'row_{i}_frecuencia' (clave técnica) o con la etiqueta exacta de la fila (p.ej. 'Cantar'). 'targetTotal' (número) es opcional y solo afecta a la visualización del total en la UI.");
                                        var accepted = mapper.createArrayNode();
                                        accepted.add("total");
                                        accepted.add("row_{i}_frecuencia");
                                        accepted.add("<Etiqueta de la fila>");
                                        h.set("acceptedMissingKeys", accepted);
                                        h.put("targetTotal", "number | optional");
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
