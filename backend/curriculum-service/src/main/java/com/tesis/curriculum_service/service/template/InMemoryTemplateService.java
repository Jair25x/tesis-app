package com.tesis.curriculum_service.service.template;

import com.tesis.curriculum_service.dto.FieldDescriptor;
import com.tesis.curriculum_service.dto.TemplateSchema;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
public class InMemoryTemplateService implements ExerciseTemplateService {

  private final Map<TemplateSchema.TemplateType, TemplateSchema> schemas = new EnumMap<>(
      TemplateSchema.TemplateType.class);

  @PostConstruct
  public void init() {
    // 1. TABLAS Y PATRONES
    schemas.put(TemplateSchema.TemplateType.TBL_MATCH, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.TBL_MATCH)
        .pattern("Une cada elemento de la columna A con su par en la columna B:")
        .fields(List.of(
            FieldDescriptor.builder()
                .name("pairs")
                .type(FieldDescriptor.FieldType.TEXT)
                .build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.PATTERN_FORMATION, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PATTERN_FORMATION)
        .pattern("Completa este patrón: {{basePattern}} … (repite {{times}} veces)")
        .fields(List.of(
            FieldDescriptor.builder()
                .name("basePattern")
                .type(FieldDescriptor.FieldType.TEXT)
                .build(),
            FieldDescriptor.builder()
                .name("times")
                .type(FieldDescriptor.FieldType.NUMBER)
                .min(1).max(10)
                .build()))
        .build());

    // 2. MÚLTIPLOS Y DIVISORES
    schemas.put(TemplateSchema.TemplateType.MULTIPLES_SEARCH, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.MULTIPLES_SEARCH)
        .pattern("Encuentra todos los múltiplos de {{n}} hasta {{limit}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("n").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("limit").type(FieldDescriptor.FieldType.NUMBER).min(1).max(1000).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.DIVISORS_SEARCH, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.DIVISORS_SEARCH)
        .pattern("Enumera los divisores de {{n}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("n").type(FieldDescriptor.FieldType.NUMBER).min(1).max(1000).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.GCD_FIND, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.GCD_FIND)
        .pattern("Calcula el máximo común divisor de {{a}} y {{b}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("a").type(FieldDescriptor.FieldType.NUMBER).min(1).max(1000).build(),
            FieldDescriptor.builder().name("b").type(FieldDescriptor.FieldType.NUMBER).min(1).max(1000).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.MULT_DIV_CHALLENGE, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.MULT_DIV_CHALLENGE)
        .pattern("Resuelve: {{a}} × {{b}} + {{c}} ÷ {{d}} = ?")
        .fields(List.of(
            FieldDescriptor.builder().name("a").type(FieldDescriptor.FieldType.NUMBER).min(1).max(20).build(),
            FieldDescriptor.builder().name("b").type(FieldDescriptor.FieldType.NUMBER).min(1).max(20).build(),
            FieldDescriptor.builder().name("c").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("d").type(FieldDescriptor.FieldType.NUMBER).min(1).max(10).build()))
        .build());

    // 3. PROBABILIDAD Y ESTADÍSTICA
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

    schemas.put(TemplateSchema.TemplateType.BAR_GRAPH_READING, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.BAR_GRAPH_READING)
        .pattern("Observa el gráfico de barras '{{title}}' y responde: ¿Cuál es el valor de {{category}}?")
        .fields(List.of(
            FieldDescriptor.builder().name("title").type(FieldDescriptor.FieldType.TEXT).build(),
            FieldDescriptor.builder().name("category").type(FieldDescriptor.FieldType.TEXT).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.STATISTICAL_GRAPH, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.STATISTICAL_GRAPH)
        .pattern("En el gráfico '{{title}}', calcula la media de {{dataSet}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("title").type(FieldDescriptor.FieldType.TEXT).build(),
            FieldDescriptor.builder().name("dataSet").type(FieldDescriptor.FieldType.TEXT).build()))
        .build());

    // 4. ÁREAS Y VÓLÚMENES
    schemas.put(TemplateSchema.TemplateType.PRISM_CONSTRUCTION, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PRISM_CONSTRUCTION)
        .pattern("Construye un prisma de base {{baseShape}} con altura {{height}} cm.")
        .fields(List.of(
            FieldDescriptor.builder()
                .name("baseShape")
                .type(FieldDescriptor.FieldType.CHOICE)
                .choices(List.of("triángulo", "rectángulo", "pentágono"))
                .build(),
            FieldDescriptor.builder().name("height").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.CYLINDER_VOLUME, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.CYLINDER_VOLUME)
        .pattern("Calcula el volumen de un cilindro de radio {{r}} cm y altura {{h}} cm.")
        .fields(List.of(
            FieldDescriptor.builder().name("r").type(FieldDescriptor.FieldType.NUMBER).min(1).max(50).build(),
            FieldDescriptor.builder().name("h").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.RECT_TRIANGLE_AREA, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.RECT_TRIANGLE_AREA)
        .pattern("¿Cuál es el área de un triángulo de base {{b}} cm y altura {{h}} cm?")
        .fields(List.of(
            FieldDescriptor.builder().name("b").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("h").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.PARALLELOGRAM_AREA, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PARALLELOGRAM_AREA)
        .pattern("Calcula el área de un paralelogramo de base {{b}} cm y altura {{h}} cm.")
        .fields(List.of(
            FieldDescriptor.builder().name("b").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("h").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.PERIMETER_AREA_RELATION, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PERIMETER_AREA_RELATION)
        .pattern("¿Cómo cambia el área si duplicas el perímetro de un {{shape}}?")
        .fields(List.of(
            FieldDescriptor.builder()
                .name("shape")
                .type(FieldDescriptor.FieldType.CHOICE)
                .choices(List.of("cuadrado", "círculo", "triángulo"))
                .build()))
        .build());

    // 5. OPERACIONES BÁSICAS Y DECIMALES
    schemas.put(TemplateSchema.TemplateType.BASIC_OPERATIONS, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.BASIC_OPERATIONS)
        .pattern("Realiza: {{a}} {{op}} {{b}} = ?")
        .fields(List.of(
            FieldDescriptor.builder().name("a").type(FieldDescriptor.FieldType.NUMBER).min(0).max(100).build(),
            FieldDescriptor.builder()
                .name("op")
                .type(FieldDescriptor.FieldType.CHOICE)
                .choices(List.of("+", "-", "×", "÷"))
                .build(),
            FieldDescriptor.builder().name("b").type(FieldDescriptor.FieldType.NUMBER).min(0).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.DECIMAL_COMPARISON, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.DECIMAL_COMPARISON)
        .pattern("¿Cuál es mayor: {{x}} o {{y}}?")
        .fields(List.of(
            FieldDescriptor.builder().name("x").type(FieldDescriptor.FieldType.NUMBER).min(0).max(100).build(),
            FieldDescriptor.builder().name("y").type(FieldDescriptor.FieldType.NUMBER).min(0).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.UNIT_VALUE, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.UNIT_VALUE)
        .pattern("¿Cuál es el valor unitario si {{total}} cuesta {{cost}}?")
        .fields(List.of(
            FieldDescriptor.builder().name("total").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("cost").type(FieldDescriptor.FieldType.NUMBER).min(1).max(1000).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.PERCENTAGE_FRACTION, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PERCENTAGE_FRACTION)
        .pattern("Convierte {{fraction}} en porcentaje.")
        .fields(List.of(
            FieldDescriptor.builder().name("fraction").type(FieldDescriptor.FieldType.NUMBER).min(0).max(1).build()))
        .build());

    // 6. FIGURAS Y PROPORCIONALIDAD
    schemas.put(TemplateSchema.TemplateType.SHAPE_IDENTIFICATION, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.SHAPE_IDENTIFICATION)
        .pattern("¿Qué figura tiene {{sides}} lados?")
        .fields(List.of(
            FieldDescriptor.builder().name("sides").type(FieldDescriptor.FieldType.NUMBER).min(3).max(10).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.PROPORTIONALITY, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.PROPORTIONALITY)
        .pattern("Si {{x}} corresponde a {{y}}, ¿a cuánto corresponde {{z}}?")
        .fields(List.of(
            FieldDescriptor.builder().name("x").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("y").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("z").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.SCALE_UP_DOWN, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.SCALE_UP_DOWN)
        .pattern("Amplía o reduce una figura en un factor de {{factor}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("factor").type(FieldDescriptor.FieldType.NUMBER).min(1).max(10).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.RATIO_SPLIT, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.RATIO_SPLIT)
        .pattern("Reparte {{total}} en proporción {{r1}}:{{r2}}.")
        .fields(List.of(
            FieldDescriptor.builder().name("total").type(FieldDescriptor.FieldType.NUMBER).min(1).max(100).build(),
            FieldDescriptor.builder().name("r1").type(FieldDescriptor.FieldType.NUMBER).min(1).max(10).build(),
            FieldDescriptor.builder().name("r2").type(FieldDescriptor.FieldType.NUMBER).min(1).max(10).build()))
        .build());

    // 7. ECUACIONES E INECUACIONES
    schemas.put(TemplateSchema.TemplateType.EQUATION_SOLVE, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.EQUATION_SOLVE)
        .pattern("Resuelve la ecuación: {{equation}} = 0")
        .fields(List.of(
            FieldDescriptor.builder().name("equation").type(FieldDescriptor.FieldType.TEXT).build()))
        .build());

    schemas.put(TemplateSchema.TemplateType.INEQUATION_SOLVE, TemplateSchema.builder()
        .templateType(TemplateSchema.TemplateType.INEQUATION_SOLVE)
        .pattern("Resuelve la inecuación: {{inequation}}")
        .fields(List.of(
            FieldDescriptor.builder().name("inequation").type(FieldDescriptor.FieldType.TEXT).build()))
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
