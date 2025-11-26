-- ============================================================
-- R__c2_exercises_basic.sql
-- C.2 – FACTORES Y MÚLTIPLOS (4.º)
-- Banco de 10 ejercicios BASIC:
--   LO.2.1.1 (factores y parejas de factores) – 5 ejercicios
--   LO.2.2.1 (múltiplos y divisibilidad) – 5 ejercicios
-- Todos BASIC, con 2 pistas y 2 pasos de solución por ejercicio.
-- Idempotente: usa NOT EXISTS y se apoya en la estructura base
-- definida en R__seed_curriculum_math_4.sql.
-- ============================================================

------------------------------------------------------------
-- S.2.1 – FACTORES DE NÚMEROS NATURALES
-- LO.2.1.1 – Identifica factores y parejas de factores.
------------------------------------------------------------

-- B1 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Lista completa de factores de 12.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes listas muestra todos los factores de 12?',
       'BASIC','EQUATION',
       'A) 1, 2, 3, 4, 6, 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1, 2, 3, 4, 6, 12",
            "B) 1, 2, 3, 6, 12",
            "C) 2, 3, 4, 6, 12"
          ],
          "answer": "A) 1, 2, 3, 4, 6, 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes listas muestra todos los factores de 12?'
  );

-- B2 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Reconoce un factor de 18.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es un factor de 18?',
       'BASIC','EQUATION',
       'B) 6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5",
            "B) 6",
            "C) 7"
          ],
          "answer": "B) 6"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es un factor de 18?'
  );

-- B3 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Pareja de factores de 20.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes parejas de números son factores de 20?',
       'BASIC','EQUATION',
       'B) 4 y 5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2 y 11",
            "B) 4 y 5",
            "C) 6 y 4"
          ],
          "answer": "B) 4 y 5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes parejas de números son factores de 20?'
  );

-- B4 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Cantidad de factores de 10.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuántos factores tiene el número 10?',
       'BASIC','EQUATION',
       'C) 4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2",
            "B) 3",
            "C) 4"
          ],
          "answer": "C) 4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuántos factores tiene el número 10?'
  );

-- B5 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Descomposición de 24 en producto de dos factores.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?',
       'BASIC','EQUATION',
       'B) 24 = 3 × 8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 24 = 2 × 11",
            "B) 24 = 3 × 8",
            "C) 24 = 5 × 4"
          ],
          "answer": "B) 24 = 3 × 8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?'
  );

------------------------------------------------------------
-- S.2.2 – MÚLTIPLOS Y DIVISIBILIDAD
-- LO.2.2.1 – Reconoce múltiplos y usa criterios de divisibilidad.
------------------------------------------------------------

-- B6 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Reconoce un múltiplo de 5.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es múltiplo de 5?',
       'BASIC','EQUATION',
       'B) 35',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 22",
            "B) 35",
            "C) 43"
          ],
          "answer": "B) 35"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es múltiplo de 5?'
  );

-- B7 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Identifica el que NO es múltiplo de 3.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números NO es múltiplo de 3?',
       'BASIC','EQUATION',
       'C) 32',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 27",
            "B) 30",
            "C) 32"
          ],
          "answer": "C) 32"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números NO es múltiplo de 3?'
  );

-- B8 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia de múltiplos de 4.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.',
       'BASIC','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [4, 8, 12, null, 20],
          "rule": "múltiplos de 4",
          "missingIndex": 3,
          "answer": 16
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.'
  );

-- B9 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia de múltiplos de 6.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.',
       'BASIC','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [6, 12, 18, null, 30],
          "rule": "múltiplos de 6",
          "missingIndex": 3,
          "answer": 24
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.'
  );

-- B10 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Divisible por 2 y por 5.
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 2 y por 5?',
       'BASIC','EQUATION',
       'B) 40',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 35",
            "B) 40",
            "C) 42"
          ],
          "answer": "B) 40"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 2 y por 5?'
  );

------------------------------------------------------------
-- HINTS C.2 (2 por ejercicio BASIC de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores
    ('¿Cuál de las siguientes listas muestra todos los factores de 12?',
     'Recuerda que los factores son números que multiplicados dan como resultado 12.'),
    ('¿Cuál de las siguientes listas muestra todos los factores de 12?',
     'Verifica que cada número de la lista divida exactamente a 12.'),

    ('¿Cuál de los siguientes números es un factor de 18?',
     'Un factor divide al número sin dejar residuo.'),
    ('¿Cuál de los siguientes números es un factor de 18?',
     'Divide 18 entre cada número y busca el que da un número entero.'),

    ('¿Cuál de las siguientes parejas de números son factores de 20?',
     'Una pareja de factores multiplicada debe dar como resultado 20.'),
    ('¿Cuál de las siguientes parejas de números son factores de 20?',
     'Multiplica cada pareja y elige la que da exactamente 20.'),

    ('¿Cuántos factores tiene el número 10?',
     'Enumera todos los números que dividen a 10 sin dejar residuo.'),
    ('¿Cuántos factores tiene el número 10?',
     'No olvides incluir 1 y el mismo número 10 como factores.'),

    ('¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?',
     'Multiplica los números de cada igualdad y comprueba si el resultado es 24.'),
    ('¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?',
     'Solo una de las opciones produce exactamente 24 al multiplicar.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad
    ('¿Cuál de los siguientes números es múltiplo de 5?',
     'Los múltiplos de 5 terminan en 0 o en 5.'),
    ('¿Cuál de los siguientes números es múltiplo de 5?',
     'Observa la última cifra de cada número y elige el que termina en 0 o 5.'),

    ('¿Cuál de los siguientes números NO es múltiplo de 3?',
     'Un número es múltiplo de 3 si la suma de sus cifras es múltiplo de 3.'),
    ('¿Cuál de los siguientes números NO es múltiplo de 3?',
     'Suma las cifras de cada número y verifica cuál no cumple el criterio.'),

    ('Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.',
     'Observa de cuánto en cuánto aumenta la secuencia.'),
    ('Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.',
     'Cada término aumenta en la misma cantidad; mira la diferencia entre 4, 8 y 12.'),

    ('Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.',
     'Compara la diferencia entre los primeros términos de la secuencia.'),
    ('Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.',
     'Son múltiplos de 6; piensa qué número viene después de 18.'),

    ('¿Cuál de los siguientes números es divisible por 2 y por 5?',
     'Un número divisible por 2 termina en cifra par.'),
    ('¿Cuál de los siguientes números es divisible por 2 y por 5?',
     'Para que también sea divisible por 5 debe terminar en 0 o en 5; busca el que cumple ambas condiciones.')
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
-- SOLUTION_STEPS C.2 (2 por ejercicio BASIC de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores
    ('¿Cuál de las siguientes listas muestra todos los factores de 12?',1,
     'Escribe todos los factores de 12: 1, 2, 3, 4, 6 y 12.'),
    ('¿Cuál de las siguientes listas muestra todos los factores de 12?',2,
     'Compara con las opciones y elige la lista que contiene exactamente esos números.'),

    ('¿Cuál de los siguientes números es un factor de 18?',1,
     'Divide 18 entre 5, 6 y 7 para comprobar si la división es exacta.'),
    ('¿Cuál de los siguientes números es un factor de 18?',2,
     'Solo 18 ÷ 6 = 3 es una división exacta; por eso 6 es factor de 18.'),

    ('¿Cuál de las siguientes parejas de números son factores de 20?',1,
     'Multiplica 2 × 11, 4 × 5 y 6 × 4.'),
    ('¿Cuál de las siguientes parejas de números son factores de 20?',2,
     'Solo 4 × 5 = 20; la pareja correcta es 4 y 5.'),

    ('¿Cuántos factores tiene el número 10?',1,
     'Enumera los divisores de 10: 1, 2, 5 y 10.'),
    ('¿Cuántos factores tiene el número 10?',2,
     'Cuenta los números de la lista: en total hay 4 factores.'),

    ('¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?',1,
     'Calcula 2 × 11, 3 × 8 y 5 × 4 y observa los resultados.'),
    ('¿Cuál de las siguientes igualdades muestra una descomposición correcta de 24 en el producto de dos factores?',2,
     'Solo 3 × 8 = 24; esa igualdad descompone correctamente 24.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad
    ('¿Cuál de los siguientes números es múltiplo de 5?',1,
     'Revisa el último dígito de 22, 35 y 43.'),
    ('¿Cuál de los siguientes números es múltiplo de 5?',2,
     'Solo 35 termina en 5; por eso 35 es múltiplo de 5.'),

    ('¿Cuál de los siguientes números NO es múltiplo de 3?',1,
     'Suma las cifras: 27 → 2 + 7, 30 → 3 + 0, 32 → 3 + 2.'),
    ('¿Cuál de los siguientes números NO es múltiplo de 3?',2,
     '27 y 30 dan 9 y 3 (múltiplos de 3); 32 da 5, que no es múltiplo de 3, así que 32 NO es múltiplo de 3.'),

    ('Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.',1,
     'Calcula las diferencias: 8 − 4 = 4 y 12 − 8 = 4.'),
    ('Secuencia: 4, 8, 12, __, 20. Escribe el número que falta.',2,
     'La secuencia aumenta de 4 en 4; 12 + 4 = 16, ese es el número que falta.'),

    ('Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.',1,
     'Calcula 12 − 6 y 18 − 12 para encontrar la regla.'),
    ('Secuencia: 6, 12, 18, __, 30. Escribe el número que falta.',2,
     'La secuencia aumenta de 6 en 6; 18 + 6 = 24, por eso el número faltante es 24.'),

    ('¿Cuál de los siguientes números es divisible por 2 y por 5?',1,
     'Identifica cuál de los números 35, 40 y 42 es par y cuál termina en 0 o 5.'),
    ('¿Cuál de los siguientes números es divisible por 2 y por 5?',2,
     '40 es par y termina en 0, así que es divisible por 2 y por 5.')
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
-- RESUMEN LOG C.2 (para ver conteos en consola)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'BASIC') AS exercises_c2_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'BASIC') AS hints_c2_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'BASIC') AS steps_c2_basic;
