-- ============================================================
-- R__c4_exercises_advanced.sql
-- C.4 – FRACCIONES (4.º)
--
-- Nivel: ADVANCED
-- LOs cubiertos:
--   LO.4.1.1 – Números mixtos y fracciones impropias
--   LO.4.1.2 – Conversión entre fracciones y números mixtos
--   LO.4.2.1 – Comparar y ordenar fracciones
--   LO.4.3.1 – Adición y sustracción de fracciones
--   LO.4.4.1 – Fracción de un número natural
--
-- 3 ejercicios ADVANCED por LO (total: 15).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE
--   - FREQUENCY_TABLE_QA
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.4.1.1 – Números mixtos y fracciones impropias
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- D1 — Bandeja de pasteles
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?',
       'ADVANCED','EQUATION',
       'B) 17/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 12/5",
            "B) 17/5",
            "C) 7/5"
          ],
          "answer": "B) 17/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?'
  );

-- D2 — 5/3 a número mixto en contexto
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?',
       'ADVANCED','EQUATION',
       'B) 1 2/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1 1/3",
            "B) 1 2/3",
            "C) 2 1/3"
          ],
          "answer": "B) 1 2/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?'
  );

-- D3 — Suma de distancias como fracción impropia
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?',
       'ADVANCED','EQUATION',
       'C) 16/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 12/4",
            "B) 14/4",
            "C) 16/4"
          ],
          "answer": "C) 16/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?'
  );

------------------------------------------------------------
-- LO.4.1.2 – Conversión entre fracciones y números mixtos
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- D4 — 17/4 a número mixto
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué número mixto corresponde a la fracción 17/4?',
       'ADVANCED','EQUATION',
       'B) 4 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 1/4",
            "B) 4 1/4",
            "C) 4 3/4"
          ],
          "answer": "B) 4 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué número mixto corresponde a la fracción 17/4?'
  );

-- D5 — 3 5/6 a fracción impropia
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué fracción impropia corresponde al número mixto 3 5/6?',
       'ADVANCED','EQUATION',
       'C) 23/6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 21/6",
            "B) 22/6",
            "C) 23/6"
          ],
          "answer": "C) 23/6"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué fracción impropia corresponde al número mixto 3 5/6?'
  );

-- D6 — 2 1/2 en contexto a fracción impropia
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?',
       'ADVANCED','EQUATION',
       'C) 5/2',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/2",
            "B) 4/2",
            "C) 5/2"
          ],
          "answer": "C) 5/2"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?'
  );

------------------------------------------------------------
-- LO.4.2.1 – Comparar y ordenar fracciones
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- D7 — Ordenar de mayor a menor
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?',
       'ADVANCED','EQUATION',
       'B) 9/10, 7/8, 5/6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5/6, 7/8, 9/10",
            "B) 9/10, 7/8, 5/6",
            "C) 7/8, 5/6, 9/10"
          ],
          "answer": "B) 9/10, 7/8, 5/6"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?'
  );

-- D8 — Fracción menor que 1/2
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes fracciones es menor que 1/2?',
       'ADVANCED','EQUATION',
       'C) 2/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/5",
            "B) 5/8",
            "C) 2/5"
          ],
          "answer": "C) 2/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es menor que 1/2?'
  );

-- D9 — Equivalencia entre 1/3, 2/6 y 3/9
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?',
       'ADVANCED','EQUATION',
       'C) Las tres fracciones representan la misma cantidad',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/3 es menor que 2/6",
            "B) 2/6 es mayor que 3/9",
            "C) Las tres fracciones representan la misma cantidad"
          ],
          "answer": "C) Las tres fracciones representan la misma cantidad"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?'
  );

------------------------------------------------------------
-- LO.4.3.1 – Adición y sustracción de fracciones
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- D10 — 3/4 + 5/8
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 3/4 + 5/8?',
       'ADVANCED','EQUATION',
       'B) 1 3/8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7/8",
            "B) 1 3/8",
            "C) 1 1/8"
          ],
          "answer": "B) 1 3/8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 3/4 + 5/8?'
  );

-- D11 — 7/6 − 1/2
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 7/6 − 1/2?',
       'ADVANCED','EQUATION',
       'B) 2/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/3",
            "B) 2/3",
            "C) 5/6"
          ],
          "answer": "B) 2/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 7/6 − 1/2?'
  );

-- D12 — Problema contextual con resta de fracciones
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?',
       'ADVANCED','EQUATION',
       'B) 3/4 de litro',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/2 litro",
            "B) 3/4 de litro",
            "C) 1 litro"
          ],
          "answer": "B) 3/4 de litro"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?'
  );

------------------------------------------------------------
-- LO.4.4.1 – Fracción de un número natural
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- D13 — 5/6 de 36
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 5/6 de 36?',
       'ADVANCED','EQUATION',
       'B) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 24",
            "B) 30",
            "C) 32"
          ],
          "answer": "B) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 5/6 de 36?'
  );

-- D14 — 3/8 de 32 estudiantes
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?',
       'ADVANCED','EQUATION',
       'C) 12 estudiantes',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 estudiantes",
            "B) 10 estudiantes",
            "C) 12 estudiantes"
          ],
          "answer": "C) 12 estudiantes"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?'
  );

-- D15 — FREQUENCY_TABLE_QA con frutas favoritas
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.4.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.',
       'ADVANCED','QA',
       NULL,
       'FREQUENCY_TABLE_QA',
       '{
          "columns": ["Fruta", "Niñas"],
          "rows": [
            { "fruta": "Manzana", "niñas": 8 },
            { "fruta": "Plátano", "niñas": 6 },
            { "fruta": "Uva", "niñas": 4 },
            { "fruta": "Naranja", "niñas": 2 }
          ],
          "questions": [
            {
              "id": "q1",
              "kind": "single_choice",
              "prompt": "¿Qué fracción de las niñas prefiere manzana?",
              "options": ["8/20", "2/5", "1/4"],
              "answer": "2/5"
            },
            {
              "id": "q2",
              "kind": "numeric",
              "prompt": "¿Cuántas niñas hay en total?",
              "answer": 20
            }
          ]
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.'
  );

------------------------------------------------------------
-- HINTS C.4 ADVANCED (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?',
     'Piensa en cuántas quintas partes tiene cada pastel completo.'),
    ('En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?',
     'Multiplica el número de pasteles completos por 5 y suma las 2 partes adicionales.'),

    ('Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?',
     'Para convertir una fracción impropia en número mixto, divide el numerador entre el denominador.'),
    ('Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?',
     'El cociente es la parte entera y el residuo es el numerador de la parte fraccionaria.'),

    ('En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?',
     'Primero convierte 2 1/4 y 1 3/4 en fracciones impropias con denominador 4.'),
    ('En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?',
     'Suma los numeradores y conserva el denominador para obtener la fracción impropia total.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 17/4?',
     'Divide 17 entre 4 para saber cuántos enteros caben.'),
    ('¿Qué número mixto corresponde a la fracción 17/4?',
     'El cociente es la parte entera y el residuo se coloca sobre el denominador 4.'),

    ('¿Qué fracción impropia corresponde al número mixto 3 5/6?',
     'Multiplica la parte entera por el denominador y suma el numerador.'),
    ('¿Qué fracción impropia corresponde al número mixto 3 5/6?',
     'Escribe el resultado obtenido como numerador sobre el mismo denominador 6.'),

    ('En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?',
     'Piensa cuántas mitades hay en 2 enteros y suma la mitad extra.'),
    ('En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?',
     'Multiplica 2 por 2 y suma 1 para encontrar el numerador de la fracción impropia.'),

    -- LO.4.2.1
    ('Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?',
     'Compara qué tan cerca de 1 está cada fracción.'),
    ('Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?',
     'Piensa cuál fracción representa la parte más grande de la unidad y colócala primero.'),

    ('¿Cuál de las siguientes fracciones es menor que 1/2?',
     'Una fracción será menor que 1/2 si representa menos de la mitad de la unidad.'),
    ('¿Cuál de las siguientes fracciones es menor que 1/2?',
     'Compara mentalmente cada fracción con 1/2; por ejemplo, 2/5 es 0,4.'),

    ('Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?',
     'Intenta simplificar 2/6 y 3/9 para ver si se parecen a 1/3.'),
    ('Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?',
     'Al simplificar, revisa si todas las fracciones representan la misma parte de la unidad.'),

    -- LO.4.3.1
    ('¿Cuánto es 3/4 + 5/8?',
     'Busca un denominador común para 4 y 8 antes de sumar.'),
    ('¿Cuánto es 3/4 + 5/8?',
     'Convierte 3/4 en octavos y luego suma los numeradores con denominador 8.'),

    ('¿Cuánto es 7/6 − 1/2?',
     'Utiliza un denominador común para 6 y 2.'),
    ('¿Cuánto es 7/6 − 1/2?',
     'Convierte 1/2 a sextos y luego realiza la resta de fracciones.'),

    ('En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?',
     'Convierte 1 1/2 a fracción impropia antes de restar 3/4.'),
    ('En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?',
     'Convierte ambas cantidades a cuartos y luego realiza la resta.'),

    -- LO.4.4.1
    ('¿Cuánto es 5/6 de 36?',
     'Primero encuentra 1/6 de 36 y luego multiplícalo por 5.'),
    ('¿Cuánto es 5/6 de 36?',
     'Divide 36 entre 6 y multiplica el resultado por 5.'),

    ('En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?',
     'Calcula 1/8 de 32 y luego multiplícalo por 3.'),
    ('En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?',
     'Divide 32 entre 8 y multiplica el resultado por 3.'),

    ('En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.',
     'Suma las cantidades de la tabla para conocer el total de niñas encuestadas.'),
    ('En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.',
     'Para encontrar la fracción de niñas que prefieren manzana, escribe 8 sobre el total y simplifica si es posible.')
  ) AS t(statement, hint_text)
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       h.hint_text,
       1,
       e.id,
       TRUE,'seed','seed',now(),now()
FROM hint_src h
JOIN ex_all e ON e.statement = h.statement
WHERE NOT EXISTS (
  SELECT 1
  FROM hints hx
  WHERE hx.exercise_id = e.id
    AND hx.hint_text = h.hint_text
);

------------------------------------------------------------
-- SOLUTION_STEPS C.4 ADVANCED (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?',1,
     'Cada pastel completo se divide en 5 partes iguales, así que 3 pasteles completos equivalen a 3 × 5 = 15 quintos.'),
    ('En una bandeja hay 3 pasteles completos y 2/5 de otro pastel. ¿Qué fracción impropia representa la cantidad de pastel en la bandeja?',2,
     'Se suman los 15 quintos con los 2 quintos del pastel incompleto, obteniendo 17/5.'),

    ('Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?',1,
     'Se divide 5 entre 3: el cociente es 1 y el residuo es 2.'),
    ('Ana tiene 5/3 metros de cinta para decorar. ¿Qué número mixto representa la misma cantidad?',2,
     'El número mixto es 1 2/3 porque 5/3 representa un entero completo y 2/3 más.'),

    ('En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?',1,
     'Se convierte 2 1/4 en 9/4 y 1 3/4 en 7/4, manteniendo el denominador 4.'),
    ('En una caminata se recorren 2 1/4 km el lunes y 1 3/4 km el martes. ¿Qué fracción impropia representa en total la distancia recorrida?',2,
     'Se suman 9/4 y 7/4 para obtener 16/4, que es la fracción impropia total.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 17/4?',1,
     'Se divide 17 entre 4: el cociente es 4 y el residuo es 1.'),
    ('¿Qué número mixto corresponde a la fracción 17/4?',2,
     'El número mixto resultante es 4 1/4 porque 17/4 equivale a 4 enteros y 1/4.'),

    ('¿Qué fracción impropia corresponde al número mixto 3 5/6?',1,
     'Se multiplica la parte entera 3 por el denominador 6 para obtener 18.'),
    ('¿Qué fracción impropia corresponde al número mixto 3 5/6?',2,
     'Se suma 18 + 5 para obtener 23; la fracción impropia es 23/6.'),

    ('En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?',1,
     'Se multiplica 2 por 2 para obtener 4 mitades y se suma 1 mitad más.'),
    ('En una receta se usa 2 1/2 tazas de leche. ¿Cuál fracción impropia representa esta cantidad?',2,
     '4 + 1 = 5, por lo que 2 1/2 equivale a la fracción impropia 5/2.'),

    -- LO.4.2.1
    ('Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?',1,
     'Se compara cuánta parte de la unidad representa cada fracción; 9/10 está más cerca de 1 que las demás.'),
    ('Ordena de mayor a menor las fracciones 5/6, 7/8 y 9/10. ¿Cuál opción es correcta?',2,
     'El orden correcto de mayor a menor es 9/10, luego 7/8 y finalmente 5/6.'),

    ('¿Cuál de las siguientes fracciones es menor que 1/2?',1,
     'Se puede usar una aproximación decimal: 2/5 es 0,4; 3/5 es 0,6 y 5/8 es 0,625.'),
    ('¿Cuál de las siguientes fracciones es menor que 1/2?',2,
     'Como 0,4 es menor que 0,5, la fracción 2/5 es la única menor que 1/2.'),

    ('Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?',1,
     'Se simplifica 2/6 dividiendo numerador y denominador entre 2, obteniendo 1/3.'),
    ('Considera las fracciones 1/3, 2/6 y 3/9. ¿Cuál de las siguientes afirmaciones es verdadera?',2,
     'Se simplifica 3/9 dividiendo numerador y denominador entre 3, también obteniendo 1/3; por eso las tres fracciones representan la misma cantidad.'),

    -- LO.4.3.1
    ('¿Cuánto es 3/4 + 5/8?',1,
     'Se usa denominador común 8: 3/4 se convierte en 6/8.'),
    ('¿Cuánto es 3/4 + 5/8?',2,
     'Se suman 6/8 y 5/8 para obtener 11/8, que equivale a 1 3/8.'),

    ('¿Cuánto es 7/6 − 1/2?',1,
     'Se convierte 1/2 en sextos: 1/2 equivale a 3/6.'),
    ('¿Cuánto es 7/6 − 1/2?',2,
     'Se realiza la resta 7/6 − 3/6 = 4/6, que se simplifica a 2/3.'),

    ('En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?',1,
     'Se convierte 1 1/2 a fracción impropia: 1 1/2 equivale a 3/2.'),
    ('En una botella hay 1 1/2 litros de jugo. Ana bebe 3/4 de litro. ¿Cuánto jugo queda en la botella?',2,
     'Se convierte 3/2 a cuartos (6/4) y se resta 3/4; 6/4 − 3/4 = 3/4 de litro.'),

    -- LO.4.4.1
    ('¿Cuánto es 5/6 de 36?',1,
     'Se calcula 1/6 de 36 dividiendo 36 entre 6, lo que da 6.'),
    ('¿Cuánto es 5/6 de 36?',2,
     'Luego se multiplica 6 por 5 y se obtiene 30; por eso 5/6 de 36 es 30.'),

    ('En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?',1,
     'Se calcula 1/8 de 32 dividiendo 32 entre 8, lo que da 4.'),
    ('En un salón hay 32 estudiantes. Si 3/8 de ellos participan en el taller de ciencia, ¿cuántos estudiantes participan en el taller?',2,
     'Se multiplica 4 por 3 para obtener 12 estudiantes que participan en el taller.'),

    ('En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.',1,
     'Se suman las niñas de cada fila: 8 + 6 + 4 + 2 para obtener el total.'),
    ('En una encuesta sobre frutas favoritas, se registraron las siguientes respuestas. Observa la tabla y responde las preguntas.',2,
     'El total es 20 niñas; la fracción que prefiere manzana es 8/20, que se simplifica a 2/5.')
  ) AS t(statement, step_number, explanation)
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       s.step_number,
       s.explanation,
       e.id,
       TRUE,'seed','seed',now(),now()
FROM step_src s
JOIN ex_all e ON e.statement = s.statement
WHERE NOT EXISTS (
  SELECT 1
  FROM solution_steps sx
  WHERE sx.exercise_id = e.id
    AND sx.step_number = s.step_number
);

------------------------------------------------------------
-- RESUMEN LOG C.4 ADVANCED (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo411_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo411_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo411_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'ADVANCED') AS exercises_lo412_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'ADVANCED') AS hints_lo412_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'ADVANCED') AS steps_lo412_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo421_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo421_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo421_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo431_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo431_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo431_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo441_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo441_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo441_advanced;
