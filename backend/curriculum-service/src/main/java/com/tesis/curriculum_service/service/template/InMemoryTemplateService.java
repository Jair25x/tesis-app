// src/main/java/com/tesis/curriculum_service/service/template/InMemoryTemplateService.java
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
                schemas.put(
                                TemplateSchema.TemplateType.EQUATION_SINGLE_CHOICE,
                                TemplateSchema.builder()
                                                .templateType(TemplateSchema.TemplateType.EQUATION_SINGLE_CHOICE)
                                                .pattern("Resuelve: {{a}} × {{b}} = ?")
                                                .fields(List.of(
                                                                FieldDescriptor.builder()
                                                                                .name("a")
                                                                                .type(FieldDescriptor.FieldType.NUMBER)
                                                                                .build(),
                                                                FieldDescriptor.builder()
                                                                                .name("b")
                                                                                .type(FieldDescriptor.FieldType.NUMBER)
                                                                                .build()))
                                                .example(obj(o -> {
                                                        o.put("a", 6);
                                                        o.put("b", 7);
                                                        o.set("choices", arr("36", "40", "42", "48"));
                                                        // respuesta correcta para autoría / BE
                                                        o.put("answer", "42");
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Usa 'a' y 'b' para renderizar el enunciado. " +
                                                                                        "'choices' (string[]) y 'answer' (string) son requeridos "
                                                                                        +
                                                                                        "para corrección automática.");
                                                        var rules = mapper.createArrayNode();
                                                        rules.add("'choices' no vacío.");
                                                        rules.add("'answer' debe existir dentro de 'choices'.");
                                                        h.set("authoringRules", rules);
                                                }))
                                                .build());

                // 2) FREQUENCY_TABLE_QA (tabla con preguntas)
                schemas.put(
                                TemplateSchema.TemplateType.FREQUENCY_TABLE_QA,
                                TemplateSchema.builder()
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
                                                                q.set("options", arr("Ajedrez", "Cantar", "Bailar",
                                                                                "Otras"));
                                                                q.put("answer", "Cantar"); // string
                                                        }));
                                                        qs.add(obj(q -> {
                                                                q.put("id", "q2");
                                                                q.put("kind", "numeric");
                                                                q.put("prompt", "¿Total de estudiantes?");
                                                                q.put("answer", 35); // número
                                                        }));
                                                        o.set("questions", qs);
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Estructura: 'columns' y 'rows' definen la tabla. "
                                                                                        +
                                                                                        "'questions' es una lista de preguntas sobre la tabla. "
                                                                                        +
                                                                                        "Soportado: 'single_choice' y 'numeric'. "
                                                                                        +
                                                                                        "Para 'single_choice' debes incluir 'options' (string[]) "
                                                                                        +
                                                                                        "y 'answer' como string. Para 'numeric', 'answer' es un número. "
                                                                                        +
                                                                                        "'id' debe ser único por pregunta.");

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

                                                        // Esquema lógico de cada pregunta (en lenguaje
                                                        // humano/JSON-suave)
                                                        var qSchema = mapper.createObjectNode();
                                                        qSchema.put("id", "string (único, obligatorio)");
                                                        qSchema.put("kind", "\"single_choice\" | \"numeric\"");
                                                        qSchema.put("prompt", "string (obligatorio)");
                                                        qSchema.put("options",
                                                                        "string[] (obligatorio si kind = single_choice)");
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
                schemas.put(
                                TemplateSchema.TemplateType.FREQUENCY_TABLE_COMPLETE,
                                TemplateSchema.builder()
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
                                                                // Clave de la celda faltante (puede ser 'total',
                                                                // 'row_1_frecuencia', etc.)
                                                                m.put("cell", "total");
                                                                m.put("answer", 40);
                                                        }));
                                                        o.set("missing", miss);

                                                        // total objetivo opcional para la UI
                                                        o.put("targetTotal", 40);
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Las celdas faltantes pueden indicarse como 'total', "
                                                                                        +
                                                                                        "'row_{i}_frecuencia' (clave técnica) o con la etiqueta exacta de la fila "
                                                                                        +
                                                                                        "(p.ej. 'Cantar'). 'targetTotal' (número) es opcional y solo afecta "
                                                                                        +
                                                                                        "a la visualización del total en la UI.");
                                                        var accepted = mapper.createArrayNode();
                                                        accepted.add("total");
                                                        accepted.add("row_{i}_frecuencia");
                                                        accepted.add("<Etiqueta de la fila>");
                                                        h.set("acceptedMissingKeys", accepted);
                                                        h.put("targetTotal", "number | optional");
                                                }))
                                                .build());

                // 4) NUMBER_WORDS_BIDIR (números ↔ palabras)
                schemas.put(
                                TemplateSchema.TemplateType.NUMBER_WORDS_BIDIR,
                                TemplateSchema.builder()
                                                .templateType(TemplateSchema.TemplateType.NUMBER_WORDS_BIDIR)
                                                .example(obj(o -> {
                                                        // contrato alineado con NumberWordsParams (FE)
                                                        o.put("direction", "DIGITS_TO_WORDS"); // "DIGITS_TO_WORDS" |
                                                                                               // "WORDS_TO_DIGITS"
                                                        o.put("value", 70015); // si DIGITS_TO_WORDS, value es number
                                                        o.put("answer", "setenta mil quince"); // grafía esperada
                                                                                               // normalizada
                                                        o.put("locale", "es-PE");
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Convierte números ↔ palabras en español. 'direction' define la dirección.");
                                                        h.put("direction", "\"DIGITS_TO_WORDS\" | \"WORDS_TO_DIGITS\"");

                                                        var rules = mapper.createArrayNode();
                                                        rules.add("DIGITS_TO_WORDS: exige 'value' como entero 0..999999.");
                                                        rules.add("WORDS_TO_DIGITS: exige 'value' como palabras válidas en es-PE.");
                                                        rules.add("answer: opcional si quieres mostrar solo enunciado, pero recomendable para corrección.");
                                                        h.set("authoringRules", rules);
                                                }))
                                                .build());

                // 5) PLACE_VALUE_QA (valor posicional / descomposición)
                schemas.put(
                                TemplateSchema.TemplateType.PLACE_VALUE_QA,
                                TemplateSchema.builder()
                                                .templateType(TemplateSchema.TemplateType.PLACE_VALUE_QA)
                                                .example(obj(o -> {
                                                        // contrato alineado con PlaceValueParams (FE)
                                                        o.put("ask", "value_of_digit"); // ver lista de 'ask' en uiHints
                                                        o.put("number", 74325);
                                                        o.put("digit", 7);
                                                        o.put("place", "ten_thousands"); // decenas de millar
                                                        o.put("answer", "70 000"); // string normalizada para corrección
                                                                                   // exacta
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Consultas de valor posicional/expansión en base 10. "
                                                                                        +
                                                                                        "El campo 'ask' define el tipo de pregunta.");

                                                        var asks = mapper.createArrayNode();
                                                        asks.add("hundreds");
                                                        asks.add("tens");
                                                        asks.add("units");
                                                        asks.add("expanded");
                                                        asks.add("positional_of_digit");
                                                        asks.add("value_of_digit");
                                                        asks.add("compose");
                                                        asks.add("tens_count");
                                                        asks.add("hundreds_to_units");
                                                        asks.add("expanded_choice");
                                                        h.set("asks", asks);

                                                        var places = mapper.createArrayNode();
                                                        places.add("units");
                                                        places.add("tens");
                                                        places.add("hundreds");
                                                        places.add("thousands");
                                                        places.add("ten_thousands");
                                                        h.set("places", places);

                                                        var rules = mapper.createArrayNode();
                                                        rules.add("'number' requerido para la mayoría de asks.");
                                                        rules.add("ask = 'value_of_digit' → requiere 'digit' y 'place'.");
                                                        rules.add("ask = 'expanded' → 'answer' puede ser string tipo '70 000 + 4 000 + 300 + 20 + 5'.");
                                                        rules.add("ask numéricos (compose, tens_count, hundreds_to_units, value_of_digit) → 'answer' numérico o string numérico.");
                                                        h.set("authoringRules", rules);
                                                }))
                                                .build());

                // 6) BASE_TEN_BLOCKS_QA (fichas de centenas/decenas/unidades)
                schemas.put(
                                TemplateSchema.TemplateType.BASE_TEN_BLOCKS_QA,
                                TemplateSchema.builder()
                                                .templateType(TemplateSchema.TemplateType.BASE_TEN_BLOCKS_QA)
                                                .example(obj(o -> {
                                                        o.put("hundreds", 3);
                                                        o.put("tens", 4);
                                                        o.put("ones", 2);
                                                        o.put("answer", 342);
                                                        o.put("altText", "3 centenas, 4 decenas y 2 unidades");
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Cuenta bloques base-10 → cifra total. El FE puede mostrar íconos/emoji.");
                                                        h.put("renderHint", "🟦=100, 🟩=10, 🟨=1 (sugerencia)");
                                                }))
                                                .build());

                // 7) NUMBER_SEQUENCE_QA (patrones y reglas)
                schemas.put(
                                TemplateSchema.TemplateType.NUMBER_SEQUENCE_QA,
                                TemplateSchema.builder()
                                                .templateType(TemplateSchema.TemplateType.NUMBER_SEQUENCE_QA)
                                                .example(obj(o -> {
                                                        // Ejemplo: secuencia con un hueco (null)
                                                        // 9005, 8905, 8805, __, 8605
                                                        var seq = mapper.createArrayNode();
                                                        seq.add(9005);
                                                        seq.add(8905);
                                                        seq.add(8805);
                                                        seq.addNull(); // índice 3 → hueco
                                                        seq.add(8605);
                                                        o.set("sequence", seq);

                                                        // un solo hueco
                                                        o.put("missingIndex", 3);
                                                        o.put("answer", 8705);

                                                        // pista opcional para el estudiante
                                                        o.put("rule", "Observa cómo disminuye la secuencia y completa el número que falta.");
                                                }))
                                                .uiHints(obj(h -> {
                                                        h.put(
                                                                        "notes",
                                                                        "Define 'sequence' (lista de números o null para huecos). "
                                                                                        +
                                                                                        "Usa 'missingIndex' (1 hueco) o 'missingIndices' + 'answers' (varios).");
                                                        h.put("acceptMulti", true);

                                                        var rules = mapper.createArrayNode();
                                                        rules.add("Si usas 'missingIndex', usa 'answer' (number).");
                                                        rules.add("Si usas 'missingIndices', alinea con 'answers' (number[]).");
                                                        rules.add("Cada null en 'sequence' debe corresponder a un índice en 'missingIndex/indices'.");
                                                        h.set("authoringRules", rules);
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
                for (var v : values) {
                        a.add(v);
                }
                return a;
        }
}
