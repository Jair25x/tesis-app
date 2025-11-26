-- ============================================================
-- R__c4_exercises_basic.sql
-- C.4 – FRACCIONES (4.º)
--
-- Nivel: BASIC
-- LOs cubiertos:
--   LO.4.1.1 – Números mixtos y fracciones impropias
--   LO.4.1.2 – Conversión entre fracciones y números mixtos
--   LO.4.2.1 – Comparar y ordenar fracciones
--   LO.4.3.1 – Adición y sustracción de fracciones
--   LO.4.4.1 – Fracción de un número natural
--
-- 3 ejercicios BASIC por LO (total: 15).
-- Plantilla: EQUATION_SINGLE_CHOICE
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.4.1.1 – Números mixtos y fracciones impropias
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B1 — Identificar fracción impropia
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
       '¿Cuál de las siguientes fracciones es impropia?',
       'BASIC','EQUATION',
       'B) 7/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2/3",
            "B) 7/4",
            "C) 3/5"
          ],
          "answer": "B) 7/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es impropia?'
  );

-- B2 — Reconocer número mixto
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
       '¿Cuál de los siguientes es un número mixto?',
       'BASIC','EQUATION',
       'B) 2 1/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5/3",
            "B) 2 1/3",
            "C) 7/4"
          ],
          "answer": "B) 2 1/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes es un número mixto?'
  );

-- B3 — Contexto con número mixto
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
       'María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?',
       'BASIC','EQUATION',
       'A) 1 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1 1/4",
            "B) 1 3/4",
            "C) 3/4"
          ],
          "answer": "A) 1 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?'
  );

------------------------------------------------------------
-- LO.4.1.2 – Conversión entre fracciones y números mixtos
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B4 — 9/4 a número mixto
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
       '¿Qué número mixto corresponde a la fracción 9/4?',
       'BASIC','EQUATION',
       'A) 2 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2 1/4",
            "B) 1 3/4",
            "C) 2 3/4"
          ],
          "answer": "A) 2 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué número mixto corresponde a la fracción 9/4?'
  );

-- B5 — 3 1/2 a fracción impropia
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
       '¿Qué fracción impropia corresponde al número mixto 3 1/2?',
       'BASIC','EQUATION',
       'B) 7/2',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5/2",
            "B) 7/2",
            "C) 6/2"
          ],
          "answer": "B) 7/2"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué fracción impropia corresponde al número mixto 3 1/2?'
  );

-- B6 — Contexto con conversión a fracción impropia
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
       'Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
       'BASIC','EQUATION',
       'A) 11/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 11/4",
            "B) 7/4",
            "C) 9/4"
          ],
          "answer": "A) 11/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?'
  );

------------------------------------------------------------
-- LO.4.2.1 – Comparar y ordenar fracciones
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B7 — Fracción mayor con mismo denominador
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
       '¿Cuál de las siguientes fracciones es mayor?',
       'BASIC','EQUATION',
       'C) 3/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/4",
            "B) 2/4",
            "C) 3/4"
          ],
          "answer": "C) 3/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es mayor?'
  );

-- B8 — Fracción menor con diferentes fracciones sencillas
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
       '¿Cuál de las siguientes fracciones es menor?',
       'BASIC','EQUATION',
       'C) 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/2",
            "B) 3/4",
            "C) 1/4"
          ],
          "answer": "C) 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes fracciones es menor?'
  );

-- B9 — Ordenar fracciones de menor a mayor
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
       'Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?',
       'BASIC','EQUATION',
       'A) 1/4, 1/2, 3/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/4, 1/2, 3/4",
            "B) 1/2, 1/4, 3/4",
            "C) 3/4, 1/2, 1/4"
          ],
          "answer": "A) 1/4, 1/2, 3/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?'
  );

------------------------------------------------------------
-- LO.4.3.1 – Adición y sustracción de fracciones
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B10 — Suma con mismo denominador 1/5 + 2/5
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
       '¿Cuánto es 1/5 + 2/5?',
       'BASIC','EQUATION',
       'C) 3/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2/10",
            "B) 2/5",
            "C) 3/5"
          ],
          "answer": "C) 3/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 1/5 + 2/5?'
  );

-- B11 — Resta con mismo denominador 4/7 − 2/7
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
       '¿Cuánto es 4/7 − 2/7?',
       'BASIC','EQUATION',
       'A) 2/7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2/7",
            "B) 6/14",
            "C) 4/9"
          ],
          "answer": "A) 2/7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 4/7 − 2/7?'
  );

-- B12 — Contexto de suma de fracciones (1/3 + 1/3)
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
       'En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?',
       'BASIC','EQUATION',
       'B) 2/3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/3",
            "B) 2/3",
            "C) 3/3"
          ],
          "answer": "B) 2/3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?'
  );

------------------------------------------------------------
-- LO.4.4.1 – Fracción de un número natural
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B13 — 1/2 de 20
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
       '¿Cuánto es 1/2 de 20?',
       'BASIC','EQUATION',
       'B) 10',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5",
            "B) 10",
            "C) 15"
          ],
          "answer": "B) 10"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 1/2 de 20?'
  );

-- B14 — 1/4 de 12
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
       '¿Cuánto es 1/4 de 12?',
       'BASIC','EQUATION',
       'A) 3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3",
            "B) 4",
            "C) 6"
          ],
          "answer": "A) 3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 1/4 de 12?'
  );

-- B15 — Contexto 3/4 de 16
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
       'En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?',
       'BASIC','EQUATION',
       'C) 12 lápices',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 lápices",
            "B) 10 lápices",
            "C) 12 lápices"
          ],
          "answer": "C) 12 lápices"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?'
  );

------------------------------------------------------------
-- HINTS C.4 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('¿Cuál de las siguientes fracciones es impropia?',
     'Recuerda que en una fracción impropia el numerador es mayor o igual que el denominador.'),
    ('¿Cuál de las siguientes fracciones es impropia?',
     'Compara numerador y denominador en cada fracción y busca donde el numerador sea más grande.'),

    ('¿Cuál de los siguientes es un número mixto?',
     'Un número mixto tiene una parte entera y una parte fraccionaria.'),
    ('¿Cuál de los siguientes es un número mixto?',
     'Busca la opción que tenga un número entero seguido de una fracción.'),

    ('María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?',
     'Una pizza entera es 1 y un cuarto es 1/4.'),
    ('María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?',
     'Suma la parte entera 1 con la fracción 1/4 para formar el número mixto.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 9/4?',
     'Divide 9 entre 4 para saber cuántas veces cabe 4 en 9.'),
    ('¿Qué número mixto corresponde a la fracción 9/4?',
     'El cociente será la parte entera y el residuo quedará como numerador sobre el mismo denominador.'),

    ('¿Qué fracción impropia corresponde al número mixto 3 1/2?',
     'Multiplica la parte entera por el denominador y súmale el numerador.'),
    ('¿Qué fracción impropia corresponde al número mixto 3 1/2?',
     'Usa la regla: (parte entera × denominador + numerador) sobre el mismo denominador.'),

    ('Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
     'Piensa en cuántos cuartos hay en 2 enteros y luego suma los 3/4.'),
    ('Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',
     'Multiplica 2 por 4 y suma 3 para obtener el numerador de la fracción impropia.'),

    -- LO.4.2.1
    ('¿Cuál de las siguientes fracciones es mayor?',
     'Cuando el denominador es igual, compara los numeradores.'),
    ('¿Cuál de las siguientes fracciones es mayor?',
     'El denominador muestra en cuántas partes se divide la unidad; aquí todos son iguales.'),

    ('¿Cuál de las siguientes fracciones es menor?',
     'Compara cuánto ocupa cada fracción en la unidad.'),
    ('¿Cuál de las siguientes fracciones es menor?',
     'Piensa en cuál fracción representa la parte más pequeña de la unidad.'),

    ('Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?',
     'Imagina una barra de 1 dividida en 4 partes iguales.'),
    ('Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?',
     'Recuerda que 1/2 es lo mismo que 2/4.'),

    -- LO.4.3.1
    ('¿Cuánto es 1/5 + 2/5?',
     'Cuando las fracciones tienen el mismo denominador, se suman los numeradores.'),
    ('¿Cuánto es 1/5 + 2/5?',
     'Deja el denominador 5 y suma 1 + 2.'),

    ('¿Cuánto es 4/7 − 2/7?',
     'Cuando restas fracciones con igual denominador, solo restas los numeradores.'),
    ('¿Cuánto es 4/7 − 2/7?',
     'Deja el denominador 7 y calcula 4 − 2.'),

    ('En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?',
     'Piensa que cada 1/3 es la misma cantidad de jugo.'),
    ('En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?',
     'Suma 1/3 y 1/3 manteniendo el mismo denominador.'),

    -- LO.4.4.1
    ('¿Cuánto es 1/2 de 20?',
     'La mitad de una cantidad es dividirla entre 2.'),
    ('¿Cuánto es 1/2 de 20?',
     'Piensa en cuánto es 20 ÷ 2.'),

    ('¿Cuánto es 1/4 de 12?',
     'Dividir en cuartos es dividir la cantidad entre 4.'),
    ('¿Cuánto es 1/4 de 12?',
     'Calcula 12 ÷ 4 para saber cuánto es un cuarto.'),

    ('En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?',
     'Primero encuentra cuánto es 1/4 de 16.'),
    ('En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?',
     'Después multiplica el valor de 1/4 por 3 para obtener 3/4.')
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
-- SOLUTION_STEPS C.4 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.4.1.1','LO.4.1.2','LO.4.2.1','LO.4.3.1','LO.4.4.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.4.1.1
    ('¿Cuál de las siguientes fracciones es impropia?',1,
     'Observa cada fracción y compara el numerador con el denominador.'),
    ('¿Cuál de las siguientes fracciones es impropia?',2,
     'En 7/4 el numerador 7 es mayor que el denominador 4, por eso es una fracción impropia.'),

    ('¿Cuál de los siguientes es un número mixto?',1,
     'Busca la opción que tenga un número entero seguido de una fracción.'),
    ('¿Cuál de los siguientes es un número mixto?',2,
     '2 1/3 tiene un 2 entero y la fracción 1/3, por eso es un número mixto.'),

    ('María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?',1,
     'Identifica la parte entera (1 pizza completa) y la parte fraccionaria (1/4 de pizza).'),
    ('María comió una pizza entera y un cuarto de otra pizza. ¿Qué número mixto representa lo que comió?',2,
     'Al juntar la parte entera 1 con la fracción 1/4 se obtiene el número mixto 1 1/4.'),

    -- LO.4.1.2
    ('¿Qué número mixto corresponde a la fracción 9/4?',1,
     'Divide 9 entre 4: 9 ÷ 4 = 2 y sobran 1.'),
    ('¿Qué número mixto corresponde a la fracción 9/4?',2,
     'El cociente 2 es la parte entera y el residuo 1 queda como numerador sobre 4, por eso 9/4 = 2 1/4.'),

    ('¿Qué fracción impropia corresponde al número mixto 3 1/2?',1,
     'Multiplica la parte entera 3 por el denominador 2 y súmale el numerador 1.'),
    ('¿Qué fracción impropia corresponde al número mixto 3 1/2?',2,
     '3 × 2 = 6 y 6 + 1 = 7, por eso 3 1/2 se escribe como 7/2.'),

    ('Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',1,
     'Multiplica el entero 2 por el denominador 4 y luego suma el numerador 3.'),
    ('Camila recorrió 2 3/4 kilómetros. ¿Cuál de las siguientes fracciones impropias representa la misma distancia?',2,
     '2 × 4 = 8 y 8 + 3 = 11, por eso 2 3/4 se escribe como 11/4.'),

    -- LO.4.2.1
    ('¿Cuál de las siguientes fracciones es mayor?',1,
     'Como todas las fracciones tienen denominador 4, el mayor numerador indica la fracción más grande.'),
    ('¿Cuál de las siguientes fracciones es mayor?',2,
     'Entre 1/4, 2/4 y 3/4, la fracción con numerador 3 es la mayor, por eso 3/4 es la más grande.'),

    ('¿Cuál de las siguientes fracciones es menor?',1,
     'Compara 1/2, 3/4 y 1/4; piensa en qué parte de la unidad representa cada una.'),
    ('¿Cuál de las siguientes fracciones es menor?',2,
     '1/4 es la fracción que ocupa menos parte de la unidad, por eso es la fracción más pequeña.'),

    ('Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?',1,
     'Recuerda que 1/2 es lo mismo que 2/4, así puedes comparar mejor con 1/4 y 3/4.'),
    ('Ordena de menor a mayor las fracciones 1/2, 1/4 y 3/4. ¿Cuál opción es correcta?',2,
     'Ordenando 1/4, 2/4 y 3/4 se obtiene 1/4, 1/2, 3/4, por eso la opción correcta es 1/4, 1/2, 3/4.'),

    -- LO.4.3.1
    ('¿Cuánto es 1/5 + 2/5?',1,
     'Suma los numeradores 1 y 2 y conserva el denominador 5.'),
    ('¿Cuánto es 1/5 + 2/5?',2,
     '1 + 2 = 3, por eso 1/5 + 2/5 = 3/5.'),

    ('¿Cuánto es 4/7 − 2/7?',1,
     'Resta los numeradores 4 y 2 y conserva el denominador 7.'),
    ('¿Cuánto es 4/7 − 2/7?',2,
     '4 − 2 = 2, por eso 4/7 − 2/7 = 2/7.'),

    ('En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?',1,
     'Suma las fracciones 1/3 y 1/3 manteniendo el denominador 3.'),
    ('En una jarra hay 1/3 de jugo de naranja y se agrega otro 1/3 de jugo. ¿Qué fracción de la jarra está llena ahora?',2,
     '1/3 + 1/3 = 2/3, por eso la jarra está llena en 2/3.'),

    -- LO.4.4.1
    ('¿Cuánto es 1/2 de 20?',1,
     'Para hallar 1/2 de una cantidad, divide esa cantidad entre 2.'),
    ('¿Cuánto es 1/2 de 20?',2,
     '20 ÷ 2 = 10, por eso 1/2 de 20 es 10.'),

    ('¿Cuánto es 1/4 de 12?',1,
     'Para hallar 1/4 de una cantidad, divídela entre 4.'),
    ('¿Cuánto es 1/4 de 12?',2,
     '12 ÷ 4 = 3, por eso 1/4 de 12 es 3.'),

    ('En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?',1,
     'Primero calcula cuánto es 1/4 de 16 dividiendo 16 entre 4.'),
    ('En una caja hay 16 lápices. Si se reparte 3/4 de la caja, ¿cuántos lápices se reparten?',2,
     '16 ÷ 4 = 4, entonces 3/4 es 3 × 4 = 12, por eso se reparten 12 lápices.')
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
-- RESUMEN LOG C.4 BASIC (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'BASIC') AS exercises_lo411_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'BASIC') AS hints_lo411_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.1'
     AND e.difficulty = 'BASIC') AS steps_lo411_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'BASIC') AS exercises_lo412_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'BASIC') AS hints_lo412_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.1.2'
     AND e.difficulty = 'BASIC') AS steps_lo412_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'BASIC') AS exercises_lo421_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'BASIC') AS hints_lo421_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.2.1'
     AND e.difficulty = 'BASIC') AS steps_lo421_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'BASIC') AS exercises_lo431_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'BASIC') AS hints_lo431_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.3.1'
     AND e.difficulty = 'BASIC') AS steps_lo431_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'BASIC') AS exercises_lo441_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'BASIC') AS hints_lo441_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.4.4.1'
     AND e.difficulty = 'BASIC') AS steps_lo441_basic;
