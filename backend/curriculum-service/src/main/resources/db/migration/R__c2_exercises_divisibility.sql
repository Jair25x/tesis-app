-- ============================================================
-- R__c2_exercises_divisibility.sql
-- C.2 – FACTORES Y MÚLTIPLOS (4.º)
-- LO.2.2.2 – Criterios sencillos de divisibilidad
--
-- Banco de 15 ejercicios:
--   5 BASIC
--   5 INTERMEDIATE
--   5 ADVANCED
-- Todos con 2 pistas y 2 pasos de solución.
-- Usa solo plantillas existentes:
--   - EQUATION_SINGLE_CHOICE
--   - NUMBER_SEQUENCE_QA
-- Idempotente: usa NOT EXISTS y se apoya en LO.2.2.2.
-- ============================================================

------------------------------------------------------------
-- LO.2.2.2 – Criterios sencillos de divisibilidad
-- BASIC (5 ejercicios)
------------------------------------------------------------

-- B1 — divisible por 2
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 2?',
       'BASIC','EQUATION',
       'B) 24',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 17",
            "B) 24",
            "C) 35"
          ],
          "answer": "B) 24"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 2?'
  );

-- B2 — divisible por 5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 5?',
       'BASIC','EQUATION',
       'B) 25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 23",
            "B) 25",
            "C) 41"
          ],
          "answer": "B) 25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 5?'
  );

-- B3 — divisible por 10
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 10?',
       'BASIC','EQUATION',
       'A) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30",
            "B) 45",
            "C) 52"
          ],
          "answer": "A) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 10?'
  );

-- B4 — divisible por 3
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 3?',
       'BASIC','EQUATION',
       'A) 21',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 21",
            "B) 22",
            "C) 25"
          ],
          "answer": "A) 21"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 3?'
  );

-- B5 — NO divisible por 2
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números NO es divisible por 2?',
       'BASIC','EQUATION',
       'C) 21',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 14",
            "B) 18",
            "C) 21"
          ],
          "answer": "C) 21"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números NO es divisible por 2?'
  );

------------------------------------------------------------
-- LO.2.2.2 – Criterios sencillos de divisibilidad
-- INTERMEDIATE (5 ejercicios)
------------------------------------------------------------

-- I1 — divisible por 2 y por 5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?',
       'INTERMEDIATE','EQUATION',
       'B) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 25",
            "B) 30",
            "C) 35"
          ],
          "answer": "B) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?'
  );

-- I2 — divisible por 3 y por 5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?',
       'INTERMEDIATE','EQUATION',
       'B) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 20",
            "B) 30",
            "C) 32"
          ],
          "answer": "B) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?'
  );

-- I3 — secuencia múltiplos de 6
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [12, 18, 24, null, 36],
          "rule": "múltiplos de 6",
          "missingIndex": 3,
          "answer": 30
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.'
  );

-- I4 — divisible por 9 (suma de cifras)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 9?',
       'INTERMEDIATE','EQUATION',
       'A) 27',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 27",
            "B) 34",
            "C) 41"
          ],
          "answer": "A) 27"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 9?'
  );

-- I5 — problema con 45 estudiantes y filas de 5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?',
       'INTERMEDIATE','EQUATION',
       'C) 9 filas',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7 filas",
            "B) 8 filas",
            "C) 9 filas"
          ],
          "answer": "C) 9 filas"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?'
  );

------------------------------------------------------------
-- LO.2.2.2 – Criterios sencillos de divisibilidad
-- ADVANCED (5 ejercicios)
------------------------------------------------------------

-- A1 — divisible por 2, 3 y 5 a la vez
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?',
       'ADVANCED','EQUATION',
       'B) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 24",
            "B) 30",
            "C) 45"
          ],
          "answer": "B) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?'
  );

-- A2 — NO divisible por 3 (número mayor)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números NO es divisible por 3?',
       'ADVANCED','EQUATION',
       'B) 85',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 72",
            "B) 85",
            "C) 99"
          ],
          "answer": "B) 85"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números NO es divisible por 3?'
  );

-- A3 — secuencia múltiplos de 8
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.',
       'ADVANCED','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [16, 24, 32, null, 48],
          "rule": "múltiplos de 8",
          "missingIndex": 3,
          "answer": 40
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.'
  );

-- A4 — 48 estudiantes en filas iguales
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?',
       'ADVANCED','EQUATION',
       'B) 6 estudiantes',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5 estudiantes",
            "B) 6 estudiantes",
            "C) 7 estudiantes"
          ],
          "answer": "B) 6 estudiantes"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?'
  );

-- A5 — número de tres cifras divisible por 9
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.2.2.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números de tres cifras es divisible por 9?',
       'ADVANCED','EQUATION',
       'A) 144',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 144",
            "B) 152",
            "C) 163"
          ],
          "answer": "A) 144"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números de tres cifras es divisible por 9?'
  );

------------------------------------------------------------
-- HINTS LO.2.2.2 (2 por ejercicio, todos los niveles)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code = 'LO.2.2.2'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- BASIC
    ('¿Cuál de los siguientes números es divisible por 2?',
     'Un número es divisible por 2 si termina en cifra par: 0, 2, 4, 6 u 8.'),
    ('¿Cuál de los siguientes números es divisible por 2?',
     'Mira la última cifra de cada número y elige el que es par.'),

    ('¿Cuál de los siguientes números es divisible por 5?',
     'Los números divisibles por 5 terminan en 0 o en 5.'),
    ('¿Cuál de los siguientes números es divisible por 5?',
     'Observa la última cifra y busca el número que termina en 0 o en 5.'),

    ('¿Cuál de los siguientes números es divisible por 10?',
     'Un número divisible por 10 siempre termina en 0.'),
    ('¿Cuál de los siguientes números es divisible por 10?',
     'Solo uno de los números termina en 0; ese será divisible por 10.'),

    ('¿Cuál de los siguientes números es divisible por 3?',
     'La suma de las cifras de un número divisible por 3 es múltiplo de 3.'),
    ('¿Cuál de los siguientes números es divisible por 3?',
     'Suma las cifras de cada número y revisa cuál tiene una suma múltiplo de 3.'),

    ('¿Cuál de los siguientes números NO es divisible por 2?',
     'Un número no divisible por 2 tiene última cifra impar: 1, 3, 5, 7 o 9.'),
    ('¿Cuál de los siguientes números NO es divisible por 2?',
     'Busca el número que termina en cifra impar.'),

    -- INTERMEDIATE
    ('¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?',
     'Para ser divisible por 2 debe terminar en cifra par, y para ser divisible por 5 debe terminar en 0 o 5.'),
    ('¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?',
     'Elige el número que cumple las dos reglas a la vez: termina en cifra par y en 0 o 5.'),

    ('¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?',
     'Recuerda: divisible por 3 → la suma de cifras es múltiplo de 3; divisible por 5 → termina en 0 o 5.'),
    ('¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?',
     'Verifica primero si termina en 0 o 5 y luego revisa si la suma de sus cifras es múltiplo de 3.'),

    ('Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.',
     'Calcula cuánto aumenta la secuencia de un número al siguiente.'),
    ('Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.',
     'Observa que cada número es un múltiplo de 6; piensa qué múltiplo viene después de 24.'),

    ('¿Cuál de los siguientes números es divisible por 9?',
     'Un número divisible por 9 tiene una suma de cifras múltiplo de 9.'),
    ('¿Cuál de los siguientes números es divisible por 9?',
     'Suma las cifras de cada número y busca cuál tiene suma igual a 9 o a otro múltiplo de 9.'),

    ('En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?',
     'Piensa cuántas veces cabe 5 dentro de 45.'),
    ('En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?',
     'Si cada fila tiene 5 estudiantes, divide 45 entre 5 para saber cuántas filas se forman.'),

    -- ADVANCED
    ('¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?',
     'Debe ser divisible por 2 (última cifra par), por 3 (suma de cifras múltiplo de 3) y por 5 (terminar en 0 o 5).'),
    ('¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?',
     'Verifica las tres reglas en cada número y quédate con el que las cumple todas.'),

    ('¿Cuál de los siguientes números NO es divisible por 3?',
     'Un número es divisible por 3 si la suma de sus cifras es múltiplo de 3. Aquí debes encontrar el que no cumple esto.'),
    ('¿Cuál de los siguientes números NO es divisible por 3?',
     'Suma las cifras de 72, 85 y 99; busca el número cuya suma no sea múltiplo de 3.'),

    ('Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.',
     'Calcula la diferencia entre 16 y 24, y entre 24 y 32.'),
    ('Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.',
     'Observa que la secuencia aumenta siempre lo mismo; usa esa diferencia para hallar el número faltante.'),

    ('En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?',
     'La cantidad en cada fila debe dividir exactamente a 48.'),
    ('En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?',
     'Prueba dividir 48 entre 5, 6 y 7; solo una de las divisiones da un número entero.'),

    ('¿Cuál de los siguientes números de tres cifras es divisible por 9?',
     'Un número de tres cifras es divisible por 9 si la suma de sus cifras es múltiplo de 9.'),
    ('¿Cuál de los siguientes números de tres cifras es divisible por 9?',
     'Suma las cifras de 144, 152 y 163 y revisa cuál da una suma igual a 9 o a otro múltiplo de 9.')
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
-- SOLUTION_STEPS LO.2.2.2 (2 por ejercicio, todos los niveles)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code = 'LO.2.2.2'
),
step_src AS (
  SELECT * FROM (VALUES
    -- BASIC
    ('¿Cuál de los siguientes números es divisible por 2?',1,
     'Revisa la última cifra de 17, 24 y 35 y determina cuáles son pares o impares.'),
    ('¿Cuál de los siguientes números es divisible por 2?',2,
     'Solo 24 termina en 4, que es una cifra par; por eso 24 es divisible por 2.'),

    ('¿Cuál de los siguientes números es divisible por 5?',1,
     'Observa la última cifra de 23, 25 y 41 y comprueba cuáles terminan en 0 o 5.'),
    ('¿Cuál de los siguientes números es divisible por 5?',2,
     'Solo 25 termina en 5; por eso 25 es divisible por 5.'),

    ('¿Cuál de los siguientes números es divisible por 10?',1,
     'Revisa si 30, 45 y 52 terminan en 0.'),
    ('¿Cuál de los siguientes números es divisible por 10?',2,
     'Solo 30 termina en 0, así que es divisible por 10.'),

    ('¿Cuál de los siguientes números es divisible por 3?',1,
     'Suma las cifras de 21, 22 y 25 y revisa si la suma es múltiplo de 3.'),
    ('¿Cuál de los siguientes números es divisible por 3?',2,
     '21 tiene 2 + 1 = 3, que es múltiplo de 3; por eso 21 es divisible por 3.'),

    ('¿Cuál de los siguientes números NO es divisible por 2?',1,
     'Mira la última cifra de 14, 18 y 21 y decide cuáles son pares e impares.'),
    ('¿Cuál de los siguientes números NO es divisible por 2?',2,
     '21 termina en 1, que es impar; por eso 21 NO es divisible por 2.'),

    -- INTERMEDIATE
    ('¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?',1,
     'Comprueba si cada número termina en 0 o 5 y si además es par.'),
    ('¿Cuál de los siguientes números es divisible por 2 y por 5 a la vez?',2,
     '30 es par y termina en 0, por eso es divisible por 2 y por 5 al mismo tiempo.'),

    ('¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?',1,
     'Verifica si termina en 0 o 5 y luego suma sus cifras para ver si la suma es múltiplo de 3.'),
    ('¿Cuál de los siguientes números es divisible por 3 y por 5 a la vez?',2,
     '30 termina en 0 y su suma de cifras es 3 + 0 = 3, múltiplo de 3; por eso es divisible por 3 y por 5.'),

    ('Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.',1,
     'Calcula 18 − 12 y 24 − 18 para encontrar la diferencia entre términos.'),
    ('Secuencia: 12, 18, 24, __, 36. Escribe el número que falta.',2,
     'Cada término aumenta 6; después de 24 viene 30 y luego 36, así que el número que falta es 30.'),

    ('¿Cuál de los siguientes números es divisible por 9?',1,
     'Suma las cifras de 27, 34 y 41 y revisa qué suma es múltiplo de 9.'),
    ('¿Cuál de los siguientes números es divisible por 9?',2,
     'Solo 27 tiene suma 2 + 7 = 9, que es múltiplo de 9; por eso 27 es divisible por 9.'),

    ('En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?',1,
     'Plantea la división 45 ÷ 5 para saber cuántas filas se pueden formar.'),
    ('En la escuela hay 45 estudiantes que se forman en filas de 5 estudiantes cada una, sin que sobre nadie. ¿Cuántas filas se forman?',2,
     '45 ÷ 5 = 9, por lo tanto se forman 9 filas de 5 estudiantes.'),

    -- ADVANCED
    ('¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?',1,
     'Primero revisa qué números terminan en 0 o 5 para saber si son divisibles por 5.'),
    ('¿Cuál de los siguientes números es divisible por 2, por 3 y por 5 al mismo tiempo?',2,
     '30 es par, termina en 0 y 3 + 0 = 3, que es múltiplo de 3; por eso es divisible por 2, por 3 y por 5.'),

    ('¿Cuál de los siguientes números NO es divisible por 3?',1,
     'Suma las cifras de 72, 85 y 99 y observa si la suma es múltiplo de 3.'),
    ('¿Cuál de los siguientes números NO es divisible por 3?',2,
     '72 y 99 tienen suma de cifras múltiplo de 3, pero 85 tiene 8 + 5 = 13, que no es múltiplo de 3; por eso 85 NO es divisible por 3.'),

    ('Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.',1,
     'Calcula la diferencia: 24 − 16 y 32 − 24 para encontrar la regla de la secuencia.'),
    ('Secuencia: 16, 24, 32, __, 48. Escribe el número que falta.',2,
     'La secuencia aumenta de 8 en 8; después de 32 viene 40 y luego 48, así que el número faltante es 40.'),

    ('En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?',1,
     'Plantea las divisiones 48 ÷ 5, 48 ÷ 6 y 48 ÷ 7 y revisa cuál da resultado exacto.'),
    ('En el colegio hay 48 estudiantes. Se quieren formar filas con la misma cantidad de estudiantes en cada una, sin que sobre nadie. ¿Cuál de las siguientes cantidades podría ser el número de estudiantes en cada fila?',2,
     '48 ÷ 6 = 8 es una división exacta; por eso 6 estudiantes por fila es una cantidad posible.'),

    ('¿Cuál de los siguientes números de tres cifras es divisible por 9?',1,
     'Suma las cifras de 144, 152 y 163 y revisa cuál da una suma múltiplo de 9.'),
    ('¿Cuál de los siguientes números de tres cifras es divisible por 9?',2,
     '144 tiene 1 + 4 + 4 = 9, que es múltiplo de 9; por eso 144 es divisible por 9.')
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
-- RESUMEN LOG LO.2.2.2 (para ver conteos en consola)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'BASIC') AS exercises_lo22_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'BASIC') AS hints_lo22_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'BASIC') AS steps_lo22_basic,
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo22_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo22_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo22_intermediate,
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'ADVANCED') AS exercises_lo22_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'ADVANCED') AS hints_lo22_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.2.2.2'
     AND e.difficulty = 'ADVANCED') AS steps_lo22_advanced;
