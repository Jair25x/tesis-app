-- ============================================================
-- R__c7_exercises_intermediate.sql
-- C.7 – DECIMALES (4.º)
--
-- Nivel: INTERMEDIATE
-- LOs cubiertos:
--   LO.7.1.1 – Representación de números decimales
--   LO.7.2.1 – Comparar, ordenar y redondear decimales
--   LO.7.3.1 – Equivalencia entre fracciones y decimales
--   LO.7.4.1 – Adición y sustracción de decimales
--
-- 5 ejercicios INTERMEDIATE por LO (20 en total).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE
--   - NUMBER_SEQUENCE_QA
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.7.1.1 – Representación de números decimales
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I1 — Lectura de 0.48
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cómo se lee correctamente el número decimal 0.48?',
       'INTERMEDIATE','EQUATION',
       'B) cuarenta y ocho centésimos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) cuatro enteros con ocho décimos",
            "B) cuarenta y ocho centésimos",
            "C) cuatro mil ocho"
          ],
          "answer": "B) cuarenta y ocho centésimos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cómo se lee correctamente el número decimal 0.48?'
  );

-- I2 — 37 de 100 cuadritos
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?',
       'INTERMEDIATE','EQUATION',
       'C) 0.37',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.73",
            "B) 3.7",
            "C) 0.37"
          ],
          "answer": "C) 0.37"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?'
  );

-- I3 — Recta numérica con puntos A, B, C
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?',
       'INTERMEDIATE','EQUATION',
       'C) Punto C',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Punto A",
            "B) Punto B",
            "C) Punto C"
          ],
          "answer": "C) Punto C"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?'
  );

-- I4 — 1 unidad y 4 décimos
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?',
       'INTERMEDIATE','EQUATION',
       'A) 1.4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.4",
            "B) 0.14",
            "C) 4.1"
          ],
          "answer": "A) 1.4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?'
  );

-- I5 — 2 unidades, 5 décimos y 3 centésimos
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?',
       'INTERMEDIATE','EQUATION',
       'B) 2.53',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.35",
            "B) 2.53",
            "C) 5.23"
          ],
          "answer": "B) 2.53"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?'
  );

------------------------------------------------------------
-- LO.7.2.1 – Comparar, ordenar y redondear decimales
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I6 — Ordenar tres decimales
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?',
       'INTERMEDIATE','EQUATION',
       'A) 2.04, 2.14, 2.4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.04, 2.14, 2.4",
            "B) 2.4, 2.14, 2.04",
            "C) 2.14, 2.4, 2.04"
          ],
          "answer": "A) 2.04, 2.14, 2.4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?'
  );

-- I7 — Comparar 3.25 y 3.205
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es mayor: 3.25 o 3.205?',
       'INTERMEDIATE','EQUATION',
       'A) 3.25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3.25",
            "B) 3.205",
            "C) Son iguales."
          ],
          "answer": "A) 3.25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es mayor: 3.25 o 3.205?'
  );

-- I8 — Redondear 4.68 a la décima
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?',
       'INTERMEDIATE','EQUATION',
       'C) 4.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4.6",
            "B) 4.0",
            "C) 4.7"
          ],
          "answer": "C) 4.7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?'
  );

-- I9 — Secuencia decimal (paso 0.25)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [1.0, 1.25, 1.5, null, 2.0],
          "rule": "sumar 0.25 en cada paso",
          "missingIndex": 3,
          "answer": 1.75
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.'
  );

-- I10 — Número entre 1.4 y 1.5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de estos números está entre 1.4 y 1.5?',
       'INTERMEDIATE','EQUATION',
       'B) 1.48',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.39",
            "B) 1.48",
            "C) 1.51"
          ],
          "answer": "B) 1.48"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de estos números está entre 1.4 y 1.5?'
  );

------------------------------------------------------------
-- LO.7.3.1 – Equivalencia entre fracciones y decimales
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I11 — 7/10 como decimal
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál número decimal es equivalente a la fracción 7/10?',
       'INTERMEDIATE','EQUATION',
       'B) 0.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.07",
            "B) 0.7",
            "C) 7.0"
          ],
          "answer": "B) 0.7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 7/10?'
  );

-- I12 — 9/100 como decimal
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál número decimal es equivalente a la fracción 9/100?',
       'INTERMEDIATE','EQUATION',
       'A) 0.09',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.09",
            "B) 0.9",
            "C) 9.0"
          ],
          "answer": "A) 0.09"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 9/100?'
  );

-- I13 — 0.6 como fracción (no simplificada)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál fracción es equivalente al número decimal 0.6?',
       'INTERMEDIATE','EQUATION',
       'B) 6/10',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/6",
            "B) 6/10",
            "C) 1/6"
          ],
          "answer": "B) 6/10"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál fracción es equivalente al número decimal 0.6?'
  );

-- I14 — 0.2 como fracción (requiere simplificar)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El número decimal 0.2 es equivalente a la fracción:',
       'INTERMEDIATE','EQUATION',
       'C) 1/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/2",
            "B) 2/5",
            "C) 1/5"
          ],
          "answer": "C) 1/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El número decimal 0.2 es equivalente a la fracción:'
  );

-- I15 — Problema de torta con 0.25
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?',
       'INTERMEDIATE','EQUATION',
       'A) 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/4",
            "B) 1/2",
            "C) 3/4"
          ],
          "answer": "A) 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?'
  );

------------------------------------------------------------
-- LO.7.4.1 – Adición y sustracción de decimales
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I16 — 3.4 + 2.6
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula: 3.4 + 2.6 =',
       'INTERMEDIATE','EQUATION',
       'C) 6.0',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5.0",
            "B) 5.9",
            "C) 6.0"
          ],
          "answer": "C) 6.0"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Calcula: 3.4 + 2.6 ='
  );

-- I17 — 5.75 + 1.25
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula: 5.75 + 1.25 =',
       'INTERMEDIATE','EQUATION',
       'B) 7.0',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6.9",
            "B) 7.0",
            "C) 7.1"
          ],
          "answer": "B) 7.0"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Calcula: 5.75 + 1.25 ='
  );

-- I18 — 6.5 − 2.8
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula: 6.5 − 2.8 =',
       'INTERMEDIATE','EQUATION',
       'A) 3.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3.7",
            "B) 4.3",
            "C) 3.2"
          ],
          "answer": "A) 3.7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Calcula: 6.5 − 2.8 ='
  );

-- I19 — Problema de compra (2.45 + 1.80)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?',
       'INTERMEDIATE','EQUATION',
       'C) S/ 4.25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) S/ 3.25",
            "B) S/ 4.05",
            "C) S/ 4.25"
          ],
          "answer": "C) S/ 4.25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?'
  );

-- I20 — Problema de dinero con resta (vuelto)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.7.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?',
       'INTERMEDIATE','EQUATION',
       'A) S/ 0.75',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) S/ 0.75",
            "B) S/ 1.25",
            "C) S/ 0.50"
          ],
          "answer": "A) S/ 0.75"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?'
  );

------------------------------------------------------------
-- HINTS C.7 INTERMEDIATE (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación de decimales
    ('¿Cómo se lee correctamente el número decimal 0.48?',
     'Piensa que 0.48 tiene 48 centésimos, es decir, 48 partes de 100.'),
    ('¿Cómo se lee correctamente el número decimal 0.48?',
     'Recuerda que la primera cifra después del punto son décimos y la segunda son centésimos.'),

    ('Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?',
     'Cada cuadrito representa un centésimo, porque hay 100 en total.'),
    ('Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?',
     'Escribe 37/100 en forma decimal ubicando el 37 en la parte de centésimos.'),

    ('En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?',
     'Compara el número 0.75 con los valores de A, B y C.'),
    ('En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?',
     '0.75 es mayor que 0.5 y menor que 1, piensa cuál de los puntos tiene ese valor.'),

    ('Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?',
     'Una unidad se coloca antes del punto decimal y los décimos después.'),
    ('Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?',
     '1 unidad y 4 décimos se escriben como 1.4.'),

    ('Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?',
     '2 unidades se escriben antes del punto, los décimos en la primera posición y los centésimos en la segunda.'),
    ('Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?',
     'Coloca 2 como parte entera y 53 como parte decimal para formar el número.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear
    ('Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?',
     'Todos tienen la misma parte entera, compara las cifras decimales con cuidado.'),
    ('Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?',
     'Es útil escribirlos con el mismo número de decimales: 2.40, 2.04 y 2.14.'),

    ('¿Cuál es mayor: 3.25 o 3.205?',
     'Primero compara las unidades y las décimas; si son iguales, observa las centésimas.'),
    ('¿Cuál es mayor: 3.25 o 3.205?',
     'Puedes escribir 3.25 como 3.250 para comparar con 3.205.'),

    ('¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?',
     'Observa la cifra de centésimos, que es la segunda después del punto.'),
    ('¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?',
     'Si la cifra de centésimos es 5 o más, la décima aumenta en 1.'),

    ('Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.',
     'Compara la diferencia entre los primeros términos de la secuencia.'),
    ('Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.',
     'Cada vez aumenta 0.25, suma 0.25 a 1.5 para encontrar el número faltante.'),

    ('¿Cuál de estos números está entre 1.4 y 1.5?',
     'Un número está entre 1.4 y 1.5 si es mayor que 1.4 y menor que 1.5.'),
    ('¿Cuál de estos números está entre 1.4 y 1.5?',
     'Mira las décimas y centésimas para ver si el número supera o no a 1.5.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 7/10?',
     '7/10 representa 7 de 10 partes iguales de una unidad.'),
    ('¿Cuál número decimal es equivalente a la fracción 7/10?',
     'Coloca el 7 en la posición de décimos para escribir el número decimal.'),

    ('¿Cuál número decimal es equivalente a la fracción 9/100?',
     '9/100 significa 9 centésimos.'),
    ('¿Cuál número decimal es equivalente a la fracción 9/100?',
     'El 9 debe quedar en la posición de centésimos, no en la de décimos.'),

    ('¿Cuál fracción es equivalente al número decimal 0.6?',
     '0.6 tiene 6 décimos, así que puedes escribirlo como una fracción con denominador 10.'),
    ('¿Cuál fracción es equivalente al número decimal 0.6?',
     'Coloca el 6 como numerador y 10 como denominador: 6/10.'),

    ('El número decimal 0.2 es equivalente a la fracción:',
     'Piensa en 0.2 como 2 décimos, es decir, 2/10.'),
    ('El número decimal 0.2 es equivalente a la fracción:',
     'Simplifica 2/10 dividiendo numerador y denominador entre 2.'),

    ('Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?',
     '0.25 significa 25 centésimos, o 25/100.'),
    ('Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?',
     '25/100 se puede simplificar dividiendo entre 25.'),

    -- LO.7.4.1 – Adición y sustracción de decimales
    ('Calcula: 3.4 + 2.6 =',
     'Alinea 3.4 y 2.6 por el punto decimal antes de sumar.'),
    ('Calcula: 3.4 + 2.6 =',
     'Suma los décimos y las unidades por separado.'),

    ('Calcula: 5.75 + 1.25 =',
     'Suma primero las centésimas, luego las décimas y al final las unidades.'),
    ('Calcula: 5.75 + 1.25 =',
     'Puedes notar que al sumar 0.75 y 0.25 completas una unidad más.'),

    ('Calcula: 6.5 − 2.8 =',
     'Resta los décimos y las unidades con cuidado; si es necesario, piensa en 6.5 como 6.50.'),
    ('Calcula: 6.5 − 2.8 =',
     'Resta 2.8 a 6.5 alineando los decimales y calculando paso a paso.'),

    ('En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?',
     'Debes sumar 2.45 y 1.80 alineando los decimales.'),
    ('En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?',
     'Suma primero los céntimos y luego los soles.'),

    ('Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?',
     'Primero suma 2.50 y 1.75 para saber cuánto gastó en total.'),
    ('Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?',
     'Luego resta el total gastado al dinero que tenía al inicio.')
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
-- SOLUTION_STEPS C.7 INTERMEDIATE (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación
    ('¿Cómo se lee correctamente el número decimal 0.48?',1,
     'Observa que 0.48 tiene dos cifras decimales: 4 en décimos y 8 en centésimos.'),
    ('¿Cómo se lee correctamente el número decimal 0.48?',2,
     'Al tener 48 centésimos, se lee como "cuarenta y ocho centésimos".'),

    ('Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?',1,
     'Si se colorean 37 de 100 cuadritos, la fracción es 37/100.'),
    ('Un tablero tiene 100 cuadritos iguales y se colorean 37 de ellos. ¿Qué número decimal representa la parte coloreada?',2,
     '37/100 se escribe como 0.37 en forma decimal, por eso la respuesta correcta es 0.37.'),

    ('En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?',1,
     'Compara el número 0.75 con los valores 0.25, 0.5 y 0.75.'),
    ('En una recta numérica de 0 a 1 se marcan los puntos A = 0.25, B = 0.5 y C = 0.75. ¿Qué punto representa el número 0.75?',2,
     'El valor que coincide con 0.75 es el del punto C, así que ese punto lo representa.'),

    ('Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?',1,
     '1 unidad se escribe como 1 y 4 décimos se escriben después del punto como 0.4.'),
    ('Un número tiene 1 unidad y 4 décimos. ¿Cuál de los siguientes números lo representa?',2,
     'Al juntar ambos obtenemos 1.4, por eso la respuesta correcta es 1.4.'),

    ('Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?',1,
     'Escribe 2 como parte entera, 5 en la posición de décimos y 3 en la de centésimos.'),
    ('Un número tiene 2 unidades, 5 décimos y 3 centésimos. ¿Cuál es ese número decimal?',2,
     'El número formado es 2.53, por lo que esa es la opción correcta.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear
    ('Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?',1,
     'Escribe todos con dos decimales: 2.40, 2.04 y 2.14.'),
    ('Ordena de menor a mayor: 2.4, 2.04 y 2.14. ¿Cuál opción es correcta?',2,
     'El menor es 2.04, luego 2.14 y finalmente 2.40, así que el orden es 2.04, 2.14, 2.4.'),

    ('¿Cuál es mayor: 3.25 o 3.205?',1,
     'Escribe 3.25 como 3.250 para compararlo con 3.205.'),
    ('¿Cuál es mayor: 3.25 o 3.205?',2,
     'Como 3.250 tiene más centésimos que 3.205, 3.25 es mayor.'),

    ('¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?',1,
     'La décima es 6 y la centésima es 8 en el número 4.68.'),
    ('¿A cuánto se aproxima 4.68 si lo redondeas a la décima más cercana?',2,
     'Como 8 es mayor o igual que 5, la décima sube de 6 a 7, por eso se redondea a 4.7.'),

    ('Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.',1,
     'Entre 1.0 y 1.25 aumenta 0.25 y entre 1.25 y 1.5 también aumenta 0.25.'),
    ('Secuencia: 1.0, 1.25, 1.5, __, 2.0. Escribe el número que falta.',2,
     'Después de 1.5 viene 1.75 sumando 0.25, y luego 2.0; por eso el número que falta es 1.75.'),

    ('¿Cuál de estos números está entre 1.4 y 1.5?',1,
     'Revisa si cada número es mayor que 1.4 y menor que 1.5.'),
    ('¿Cuál de estos números está entre 1.4 y 1.5?',2,
     '1.48 cumple que es mayor que 1.4 y menor que 1.5, así que es el número correcto.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 7/10?',1,
     '7/10 indica 7 décimos, por lo que el 7 debe ir en la posición de décimos.'),
    ('¿Cuál número decimal es equivalente a la fracción 7/10?',2,
     'Al escribirlo en decimal, queda 0.7, que es la respuesta correcta.'),

    ('¿Cuál número decimal es equivalente a la fracción 9/100?',1,
     '9/100 indica 9 centésimos, por lo que deben aparecer dos cifras decimales.'),
    ('¿Cuál número decimal es equivalente a la fracción 9/100?',2,
     '0.09 tiene 9 en la posición de centésimos, por eso es equivalente a 9/100.'),

    ('¿Cuál fracción es equivalente al número decimal 0.6?',1,
     '0.6 tiene 1 cifra decimal, así que el denominador de la fracción es 10.'),
    ('¿Cuál fracción es equivalente al número decimal 0.6?',2,
     'El 6 va en el numerador, obteniendo 6/10 como fracción equivalente.'),

    ('El número decimal 0.2 es equivalente a la fracción:',1,
     '0.2 significa 2 décimos, que se escriben como 2/10.'),
    ('El número decimal 0.2 es equivalente a la fracción:',2,
     '2/10 se simplifica dividiendo entre 2, dando 1/5, por eso esa es la fracción equivalente.'),

    ('Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?',1,
     '0.25 equivale a 25/100, ya que son 25 centésimos.'),
    ('Carla come 0.25 de una torta. ¿Qué fracción de la torta comió?',2,
     '25/100 se simplifica dividiendo entre 25 y resulta 1/4.'),

    -- LO.7.4.1 – Adición y sustracción de decimales
    ('Calcula: 3.4 + 2.6 =',1,
     'Suma las décimas: 0.4 + 0.6 = 1.0, lo que agrega una unidad.'),
    ('Calcula: 3.4 + 2.6 =',2,
     '3 + 2 + 1 = 6, por eso 3.4 + 2.6 = 6.0.'),

    ('Calcula: 5.75 + 1.25 =',1,
     'Primero suma 0.75 y 0.25, que dan 1.0.'),
    ('Calcula: 5.75 + 1.25 =',2,
     'Al sumar 5 + 1 + 1 obtienes 7, así que el resultado es 7.0.'),

    ('Calcula: 6.5 − 2.8 =',1,
     'Piensa en 6.5 como 6.50 para poder restar mejor.'),
    ('Calcula: 6.5 − 2.8 =',2,
     '50 centésimos menos 80 centésimos requiere tomar 1 unidad prestada, el resultado final es 3.7.'),

    ('En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?',1,
     'Suma S/ 2.45 y S/ 1.80 alineando las cifras decimales.'),
    ('En una tienda, un cuaderno cuesta S/ 2.45 y un lápiz cuesta S/ 1.80. ¿Cuánto debe pagar en total una niña si compra un cuaderno y un lápiz?',2,
     '2.45 + 1.80 = 4.25, por eso debe pagar S/ 4.25 en total.'),

    ('Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?',1,
     'Primero suma el costo del juguete y del helado: 2.50 + 1.75.'),
    ('Una niña tiene S/ 5.00. Compra un juguete que cuesta S/ 2.50 y un helado que cuesta S/ 1.75. ¿Cuánto dinero le queda?',2,
     '2.50 + 1.75 = 4.25 y 5.00 − 4.25 = 0.75, por eso le queda S/ 0.75.')
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
-- RESUMEN LOG C.7 INTERMEDIATE (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'INTERMEDIATE') AS exercises_c7_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'INTERMEDIATE') AS hints_c7_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'INTERMEDIATE') AS steps_c7_intermediate;
