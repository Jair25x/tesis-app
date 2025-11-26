-- ============================================================
-- R__c4_exercises_intermediate.sql
-- C.4 – FRACCIONES (4.º)
--
-- Nivel: INTERMEDIATE
-- LOs cubiertos:
--   LO.4.1.1 – Números mixtos y fracciones impropias
--   LO.4.1.2 – Conversión entre fracciones y números mixtos
--   LO.4.2.1 – Comparar y ordenar fracciones
--   LO.4.3.1 – Adición y sustracción de fracciones
--   LO.4.4.1 – Fracción de un número natural
--
-- 3 ejercicios INTERMEDIATE por LO (total: 15).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE (principal)
--   - FREQUENCY_TABLE_QA (en LO.4.4.1)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.4.1.1 – Números mixtos y fracciones impropias
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I1 — 2 pizzas y 1/3 en fracción impropia
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
       '¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?',
       'INTERMEDIATE','EQUATION',
       'A) 7/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7/3",
            "B) 2/3",
            "C) 3/2"
          ],
          "answer": "A) 7/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?'
  );

-- I2 — Fracción mayor que 1 y menor que 2
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
       '¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?',
       'INTERMEDIATE','EQUATION',
       'B) 5/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/4",
            "B) 5/4",
            "C) 9/4"
          ],
          "answer": "B) 5/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?'
  );

-- I3 — 3 figuras, 4 partes cada una, se colorean 10 partes
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
       'En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?',
       'INTERMEDIATE','EQUATION',
       'A) 10/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 10/4",
            "B) 3/4",
            "C) 2/4"
          ],
          "answer": "A) 10/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?'
  );

------------------------------------------------------------
-- LO.4.1.2 – Conversión entre fracciones y números mixtos
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I4 — 11/3 a número mixto
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
       '¿Qué número mixto corresponde a la fracción 11/3?',
       'INTERMEDIATE','EQUATION',
       'B) 3 2/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2 2/3",
            "B) 3 2/3",
            "C) 3 1/3"
          ],
          "answer": "B) 3 2/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué número mixto corresponde a la fracción 11/3?'
  );

-- I5 — 2 2/5 a fracción impropia
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
       '¿Qué fracción impropia corresponde al número mixto 2 2/5?',
       'INTERMEDIATE','EQUATION',
       'C) 12/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7/5",
            "B) 9/5",
            "C) 12/5"
          ],
          "answer": "C) 12/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué fracción impropia corresponde al número mixto 2 2/5?'
  );

-- I6 — Contexto con 1 3/4 a fracción impropia
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
       'Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
       'INTERMEDIATE','EQUATION',
       'B) 7/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5/4",
            "B) 7/4",
            "C) 9/4"
          ],
          "answer": "B) 7/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?'
  );

------------------------------------------------------------
-- LO.4.2.1 – Comparar y ordenar fracciones
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I7 — Fracción mayor entre varias
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
       '¿Cuál de las siguientes fracciones es la mayor?',
       'INTERMEDIATE','EQUATION',
       'C) 4/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2/3",
            "B) 3/4",
            "C) 4/5"
          ],
          "answer": "C) 4/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es la mayor?'
  );

-- I8 — Fracciones equivalentes
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
       '¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?',
       'INTERMEDIATE','EQUATION',
       'A) 1/2 y 2/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/2 y 2/4",
            "B) 2/3 y 2/5",
            "C) 3/4 y 2/3"
          ],
          "answer": "A) 1/2 y 2/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?'
  );

-- I9 — Ordenar fracciones con distintos denominadores
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
       'Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?',
       'INTERMEDIATE','EQUATION',
       'A) 3/5, 2/3, 4/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/5, 2/3, 4/5",
            "B) 2/3, 3/5, 4/5",
            "C) 3/5, 4/5, 2/3"
          ],
          "answer": "A) 3/5, 2/3, 4/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?'
  );

------------------------------------------------------------
-- LO.4.3.1 – Adición y sustracción de fracciones
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I10 — 2/3 + 1/3 (resultado mayor que 1)
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
       '¿Cuánto es 2/3 + 1/3?',
       'INTERMEDIATE','EQUATION',
       'B) 3/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2/3",
            "B) 3/3",
            "C) 1/3"
          ],
          "answer": "B) 3/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 2/3 + 1/3?'
  );

-- I11 — 5/8 − 1/8
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
       '¿Cuánto es 5/8 − 1/8?',
       'INTERMEDIATE','EQUATION',
       'A) 4/8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4/8",
            "B) 6/8",
            "C) 3/8"
          ],
          "answer": "A) 4/8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 5/8 − 1/8?'
  );

-- I12 — Problema contextual 3/10 + 4/10
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
       'En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?',
       'INTERMEDIATE','EQUATION',
       'B) 7/10',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5/10",
            "B) 7/10",
            "C) 8/10"
          ],
          "answer": "B) 7/10"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?'
  );

------------------------------------------------------------
-- LO.4.4.1 – Fracción de un número natural
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I13 — 2/3 de 21
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
       '¿Cuánto es 2/3 de 21?',
       'INTERMEDIATE','EQUATION',
       'B) 14',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 12",
            "B) 14",
            "C) 16"
          ],
          "answer": "B) 14"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 2/3 de 21?'
  );

-- I14 — 3/8 de 24 caramelos
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
       'En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?',
       'INTERMEDIATE','EQUATION',
       'B) 9 caramelos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 caramelos",
            "B) 9 caramelos",
            "C) 12 caramelos"
          ],
          "answer": "B) 9 caramelos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?'
  );

-- I15 — FREQUENCY_TABLE_QA: fracción de niñas que prefieren leer
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
       'En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?',
       'INTERMEDIATE','QA',
       NULL,
       'FREQUENCY_TABLE_QA',
       '{
          "columns": ["Actividad", "Niñas"],
          "rows": [
            { "actividad": "Leer", "niñas": 6 },
            { "actividad": "Dibujar", "niñas": 4 },
            { "actividad": "Jugar", "niñas": 2 },
            { "actividad": "Bailar", "niñas": 2 }
          ],
          "questions": [
            {
              "id": "q1",
              "kind": "single_choice",
              "prompt": "¿Qué fracción de las niñas prefiere leer?",
              "options": ["6/14", "3/7", "1/2"],
              "answer": "3/7"
            }
          ]
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?'
  );

------------------------------------------------------------
-- HINTS C.4 INTERMEDIATE (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?',
     'Piensa en cuántas terceras partes hay en una pizza completa.'),
    ('¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?',
     'Dos pizzas completas tienen 6 tercios y al sumar 1/3 obtienes 7/3.'),

    ('¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?',
     'Una fracción mayor que 1 tiene numerador más grande que el denominador.'),
    ('¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?',
     'Busca la fracción donde el numerador sea un poco mayor que el denominador, pero no el doble.'),

    ('En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?',
     'Primero calcula cuántas partes en total hay en las 3 figuras.'),
    ('En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?',
     'Escribe la fracción con numerador 10 y denominador igual al número total de partes.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 11/3?',
     'Divide 11 entre 3 para saber cuántos enteros hay.'),
    ('¿Qué número mixto corresponde a la fracción 11/3?',
     'El cociente será la parte entera y el residuo será el numerador sobre 3.'),

    ('¿Qué fracción impropia corresponde al número mixto 2 2/5?',
     'Multiplica la parte entera por el denominador y suma el numerador.'),
    ('¿Qué fracción impropia corresponde al número mixto 2 2/5?',
     'Aplica la regla: (entero × denominador + numerador) sobre el mismo denominador.'),

    ('Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
     'Multiplica el entero 1 por el denominador 4 y suma el numerador 3.'),
    ('Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
     'Recuerda que 1 3/4 es igual a una fracción impropia con denominador 4.'),

    -- LO.4.2.1
    ('¿Cuál de las siguientes fracciones es la mayor?',
     'Compara qué parte de la unidad representa cada fracción.'),
    ('¿Cuál de las siguientes fracciones es la mayor?',
     'Piensa en la fracción que está más cerca de 1 entero o lo supera.'),

    ('¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?',
     'Para comparar, convierte alguna de las fracciones a un denominador común.'),
    ('¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?',
     'Recuerda que 1/2 y 2/4 representan la misma parte de la unidad.'),

    ('Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?',
     'Convierte mentalmente cada fracción a un valor aproximado usando decimales si te ayuda.'),
    ('Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?',
     'Piensa cuál es la más pequeña, cuál va en medio y cuál es la más grande.'),

    -- LO.4.3.1
    ('¿Cuánto es 2/3 + 1/3?',
     'Cuando sumas fracciones con el mismo denominador, solo sumas los numeradores.'),
    ('¿Cuánto es 2/3 + 1/3?',
     'Suma 2 y 1 y deja el denominador 3.'),

    ('¿Cuánto es 5/8 − 1/8?',
     'En una resta con el mismo denominador, resta solo los numeradores.'),
    ('¿Cuánto es 5/8 − 1/8?',
     'Calcula 5 − 1 y deja el denominador 8.'),

    ('En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?',
     'Suma las fracciones 3/10 y 4/10 manteniendo el mismo denominador.'),
    ('En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?',
     'Después de sumar, revisa si la fracción se puede simplificar.'),

    -- LO.4.4.1
    ('¿Cuánto es 2/3 de 21?',
     'Primero encuentra 1/3 de 21 y luego multiplícalo por 2.'),
    ('¿Cuánto es 2/3 de 21?',
     'Divide 21 entre 3 y luego multiplica el resultado por 2.'),

    ('En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?',
     'Primero encuentra 1/8 de 24 caramelos.'),
    ('En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?',
     'Multiplica la cantidad correspondiente a 1/8 por 3 para obtener 3/8.'),

    ('En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?',
     'Suma las cantidades para saber cuántas niñas hay en total.'),
    ('En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?',
     'Escribe la fracción niñas que prefieren leer sobre el total y simplifica si puedes.')
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
-- SOLUTION_STEPS C.4 INTERMEDIATE (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?',1,
     'Cada pizza se divide en 3 tercios, por lo que 2 pizzas completas son 6 tercios.'),
    ('¿Qué fracción impropia representa 2 pizzas y 1/3 de otra pizza?',2,
     'Al sumar 1/3 a los 6 tercios se obtiene 7/3, que es la fracción impropia correcta.'),

    ('¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?',1,
     'Una fracción mayor que 1 tiene numerador mayor que el denominador, pero no llega a ser el doble.'),
    ('¿Cuál de las siguientes fracciones es mayor que 1 y menor que 2?',2,
     '5/4 está entre 1 y 2 porque 4 cabe una vez en 5 y sobra 1, así que es mayor que 1 pero menor que 2.'),

    ('En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?',1,
     'En total hay 3 × 4 = 12 partes y se colorean 10 de ellas.'),
    ('En 3 figuras iguales, cada una dividida en 4 partes, se colorean 10 partes en total. ¿Qué fracción impropia representa la parte coloreada?',2,
     'La fracción que representa la parte coloreada es 10/12, que también se puede escribir como 10/4 por figura agrupada según el contexto del problema.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 11/3?',1,
     'Divide 11 entre 3: el cociente es 3 y el residuo es 2.'),
    ('¿Qué número mixto corresponde a la fracción 11/3?',2,
     'El número mixto es 3 2/3 porque 11/3 = 3 enteros y 2/3 más.'),

    ('¿Qué fracción impropia corresponde al número mixto 2 2/5?',1,
     'Multiplica 2 por 5 para obtener 10 y luego suma el numerador 2.'),
    ('¿Qué fracción impropia corresponde al número mixto 2 2/5?',2,
     '10 + 2 = 12, por eso 2 2/5 se escribe como la fracción impropia 12/5.'),

    ('Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',1,
     'Multiplica el entero 1 por el denominador 4 y suma el numerador 3.'),
    ('Sofía caminó 1 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',2,
     '1 × 4 = 4 y 4 + 3 = 7, por eso 1 3/4 equivale a 7/4.'),

    -- LO.4.2.1
    ('¿Cuál de las siguientes fracciones es la mayor?',1,
     'Compara mentalmente los valores: 2/3, 3/4 y 4/5 están todos cerca de 1, pero algunos son más grandes.'),
    ('¿Cuál de las siguientes fracciones es la mayor?',2,
     '4/5 representa la parte más grande de la unidad, por eso es la fracción mayor.'),

    ('¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?',1,
     'Convierte 1/2 a cuartos: si divides la unidad en 4 partes, la mitad corresponde a 2 partes.'),
    ('¿Cuál de las siguientes parejas de fracciones representa la misma cantidad?',2,
     '1/2 y 2/4 representan la misma porción de la unidad, por eso forman una pareja de fracciones equivalentes.'),

    ('Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?',1,
     'Puedes pensar en aproximaciones decimales: 3/5 es aproximadamente 0,6; 2/3 es cerca de 0,67; 4/5 es 0,8.'),
    ('Ordena de menor a mayor las fracciones 3/5, 2/3 y 4/5. ¿Cuál opción es correcta?',2,
     'El orden de menor a mayor es 3/5, luego 2/3 y finalmente 4/5.'),

    -- LO.4.3.1
    ('¿Cuánto es 2/3 + 1/3?',1,
     'Al tener el mismo denominador, se suman los numeradores 2 y 1.'),
    ('¿Cuánto es 2/3 + 1/3?',2,
     '2/3 + 1/3 = 3/3, que representa un entero completo.'),

    ('¿Cuánto es 5/8 − 1/8?',1,
     'Resta los numeradores 5 y 1 y conserva el denominador 8.'),
    ('¿Cuánto es 5/8 − 1/8?',2,
     '5/8 − 1/8 = 4/8, que también se podría simplificar más adelante si se desea.'),

    ('En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?',1,
     'Suma los numeradores: 3 + 4 y conserva el denominador 10.'),
    ('En un cuaderno, Julia completó 3/10 de las tareas de matemáticas por la mañana y 4/10 por la tarde. ¿Qué fracción completó en total?',2,
     '3/10 + 4/10 = 7/10, por eso completó 7/10 de las tareas.'),

    -- LO.4.4.1
    ('¿Cuánto es 2/3 de 21?',1,
     'Primero calcula 1/3 de 21 dividiendo 21 entre 3.'),
    ('¿Cuánto es 2/3 de 21?',2,
     '21 ÷ 3 = 7 y 7 × 2 = 14, por eso 2/3 de 21 es 14.'),

    ('En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?',1,
     'Encuentra 1/8 de 24 dividiendo 24 entre 8.'),
    ('En una caja hay 24 caramelos. Se reparte 3/8 de la caja. ¿Cuántos caramelos se reparten?',2,
     '24 ÷ 8 = 3 y 3 × 3 = 9, por eso se reparten 9 caramelos.'),

    ('En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?',1,
     'Del total de 14 niñas, 6 prefieren leer, así que la fracción inicial es 6/14.'),
    ('En una encuesta, se preguntó a 14 niñas cuál era su actividad favorita. Observa la tabla y responde: ¿qué fracción de las niñas prefiere leer?',2,
     '6/14 se puede simplificar dividiendo numerador y denominador entre 2, obteniendo 3/7.')
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
-- RESUMEN LOG C.4 INTERMEDIATE (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo411_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo411_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo411_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo412_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo412_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo412_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo421_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo421_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo421_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo431_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo431_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo431_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo441_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo441_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo441_intermediate;
