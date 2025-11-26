-- ============================================================
-- R__c7_exercises_basic.sql
-- C.7 – DECIMALES (4.º)
--
-- Nivel: BASIC
-- LOs cubiertos:
--   LO.7.1.1 – Representación de números decimales
--   LO.7.2.1 – Comparar, ordenar y redondear decimales
--   LO.7.3.1 – Equivalencia entre fracciones y decimales
--   LO.7.4.1 – Adición y sustracción de decimales
--
-- 5 ejercicios BASIC por LO (20 en total).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE (MCQ conceptual / cálculo)
--   - NUMBER_SEQUENCE_QA (secuencias decimales con hueco)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.7.1.1 – Representación de números decimales
-- Interpreta décimos, centésimos y milésimos.
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B1 — Lectura de 0.4
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
       '¿Cómo se lee correctamente el número decimal 0.4?',
       'BASIC','EQUATION',
       'A) cuatro décimos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) cuatro décimos",
            "B) cuatro unidades",
            "C) cuatro centésimos"
          ],
          "answer": "A) cuatro décimos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cómo se lee correctamente el número decimal 0.4?'
  );

-- B2 — Barra dividida en décimos, 3 partes coloreadas
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
       'María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?',
       'BASIC','EQUATION',
       'B) 0.3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.03",
            "B) 0.3",
            "C) 3.0"
          ],
          "answer": "B) 0.3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?'
  );

-- B3 — Tablero de 100 cuadritos, 25 coloreados
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
       'Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?',
       'BASIC','EQUATION',
       'B) 0.25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.52",
            "B) 0.25",
            "C) 2.5"
          ],
          "answer": "B) 0.25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?'
  );

-- B4 — Interpretar 0.7 como décimos
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
       '¿Cuál afirmación describe mejor el número 0.7?',
       'BASIC','EQUATION',
       'A) Tiene 7 décimos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Tiene 7 décimos.",
            "B) Tiene 7 unidades.",
            "C) Tiene 7 centésimos."
          ],
          "answer": "A) Tiene 7 décimos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál afirmación describe mejor el número 0.7?'
  );

-- B5 — Combinación de décimos y centésimos → 0.35
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
       'Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?',
       'BASIC','EQUATION',
       'B) 0.35',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.53",
            "B) 0.35",
            "C) 3.5"
          ],
          "answer": "B) 0.35"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?'
  );

------------------------------------------------------------
-- LO.7.2.1 – Comparar, ordenar y redondear decimales
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B6 — Comparar 0.5 y 0.8
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
       '¿Cuál es mayor: 0.5 o 0.8?',
       'BASIC','EQUATION',
       'B) 0.8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.5",
            "B) 0.8",
            "C) Son iguales."
          ],
          "answer": "B) 0.8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es mayor: 0.5 o 0.8?'
  );

-- B7 — ¿Cuál es el menor de 0.2, 0.7 y 0.5?
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
       '¿Cuál es el número decimal menor?',
       'BASIC','EQUATION',
       'A) 0.2',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.2",
            "B) 0.5",
            "C) 0.7"
          ],
          "answer": "A) 0.2"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el número decimal menor?'
  );

-- B8 — Redondeo a la décima más cercana (2.36)
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
       '¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?',
       'BASIC','EQUATION',
       'B) 2.4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.3",
            "B) 2.4",
            "C) 2.0"
          ],
          "answer": "B) 2.4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?'
  );

-- B9 — Secuencia decimal (NUMBER_SEQUENCE_QA)
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
       'Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.',
       'BASIC','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [1.0, 1.1, 1.2, null, 1.4],
          "rule": "sumar 0.1 en cada paso",
          "missingIndex": 3,
          "answer": 1.3
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.'
  );

-- B10 — Número más cercano a 3
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
       '¿Cuál de los siguientes números decimales está más cerca de 3?',
       'BASIC','EQUATION',
       'A) 2.9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.9",
            "B) 3.5",
            "C) 2.4"
          ],
          "answer": "A) 2.9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números decimales está más cerca de 3?'
  );

------------------------------------------------------------
-- LO.7.3.1 – Equivalencia entre fracciones y decimales
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B11 — 3/10 como decimal
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
       '¿Cuál número decimal es equivalente a la fracción 3/10?',
       'BASIC','EQUATION',
       'B) 0.3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.03",
            "B) 0.3",
            "C) 3.0"
          ],
          "answer": "B) 0.3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 3/10?'
  );

-- B12 — 1/2 como decimal
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
       '¿Cuál número decimal es equivalente a la fracción 1/2?',
       'BASIC','EQUATION',
       'C) 0.5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.2",
            "B) 0.25",
            "C) 0.5"
          ],
          "answer": "C) 0.5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 1/2?'
  );

-- B13 — 1/4 como decimal
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
       '¿Cuál número decimal es equivalente a la fracción 1/4?',
       'BASIC','EQUATION',
       'B) 0.25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.4",
            "B) 0.25",
            "C) 0.75"
          ],
          "answer": "B) 0.25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 1/4?'
  );

-- B14 — 0.75 como fracción
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
       '¿Cuál fracción es equivalente al número decimal 0.75?',
       'BASIC','EQUATION',
       'B) 3/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1/3",
            "B) 3/4",
            "C) 7/5"
          ],
          "answer": "B) 3/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál fracción es equivalente al número decimal 0.75?'
  );

-- B15 — 25/100 como decimal
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
       '¿Cuál número decimal es equivalente a la fracción 25/100?',
       'BASIC','EQUATION',
       'A) 0.25',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.25",
            "B) 0.52",
            "C) 2.5"
          ],
          "answer": "A) 0.25"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál número decimal es equivalente a la fracción 25/100?'
  );

------------------------------------------------------------
-- LO.7.4.1 – Adición y sustracción de decimales
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B16 — 0.3 + 0.4
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
       'Calcula: 0.3 + 0.4 =',
       'BASIC','EQUATION',
       'B) 0.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.6",
            "B) 0.7",
            "C) 0.74"
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
      AND e.statement = 'Calcula: 0.3 + 0.4 ='
  );

-- B17 — 1.2 + 0.5
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
       'Calcula: 1.2 + 0.5 =',
       'BASIC','EQUATION',
       'C) 1.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.25",
            "B) 1.6",
            "C) 1.7"
          ],
          "answer": "C) 1.7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Calcula: 1.2 + 0.5 ='
  );

-- B18 — 2.5 − 1.1
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
       'Calcula: 2.5 − 1.1 =',
       'BASIC','EQUATION',
       'A) 1.4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.4",
            "B) 1.6",
            "C) 3.6"
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
      AND e.statement = 'Calcula: 2.5 − 1.1 ='
  );

-- B19 — Problema de dinero: 3.50 + 1.20
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
       'Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?',
       'BASIC','EQUATION',
       'B) S/ 4.70',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) S/ 3.70",
            "B) S/ 4.70",
            "C) S/ 5.20"
          ],
          "answer": "B) S/ 4.70"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?'
  );

-- B20 — Problema de distancia: 1.5 + 0.8
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
       'Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?',
       'BASIC','EQUATION',
       'C) 2.3 km',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.7 km",
            "B) 2.1 km",
            "C) 2.3 km"
          ],
          "answer": "C) 2.3 km"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?'
  );

------------------------------------------------------------
-- HINTS C.7 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación de números decimales
    ('¿Cómo se lee correctamente el número decimal 0.4?',
     'Piensa que 0.4 representa cuatro partes de 10, es decir, cuatro décimos.'),
    ('¿Cómo se lee correctamente el número decimal 0.4?',
     'No llega a una unidad completa; solo es una parte de la unidad.'),

    ('María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?',
     'Cuando divides en 10 partes iguales, cada parte es un décimo.'),
    ('María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?',
     'Tres de diez partes se representan como 3/10, que en decimal es 0.3.'),

    ('Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?',
     'Cada cuadrito representa un centésimo porque hay 100 en total.'),
    ('Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?',
     '25 de 100 partes se escriben como 25/100, que en decimal es 0.25.'),

    ('¿Cuál afirmación describe mejor el número 0.7?',
     '0.7 está entre 0 y 1 y representa una parte de la unidad.'),
    ('¿Cuál afirmación describe mejor el número 0.7?',
     'Cuenta cuántas décimas tiene: el 7 indica la cantidad de décimos.'),

    ('Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?',
     'Tres décimos equivalen a 0.3 y cinco centésimos a 0.05.'),
    ('Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?',
     'Suma 0.3 + 0.05 para obtener el número decimal.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear decimales
    ('¿Cuál es mayor: 0.5 o 0.8?',
     'Ambos están entre 0 y 1; compara cuántos décimos tiene cada uno.'),
    ('¿Cuál es mayor: 0.5 o 0.8?',
     'El número con mayor cifra en la posición de décimos es el más grande.'),

    ('¿Cuál es el número decimal menor?',
     'Compara primero la parte entera (antes de la coma o el punto) y luego los décimos.'),
    ('¿Cuál es el número decimal menor?',
     'Entre 0.2, 0.5 y 0.7, fíjate cuál tiene menos décimos.'),

    ('¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?',
     'Observa la cifra de las centésimas (la segunda después del punto).'),
    ('¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?',
     'Si la centésima es 5 o más, la décima sube en 1; si es menor que 5, la décima se queda igual.'),

    ('Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.',
     'Fíjate cuánto aumenta cada vez la secuencia.'),
    ('Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.',
     'Entre 1.0 y 1.1 aumenta 0.1; lo mismo pasa en cada paso.'),

    ('¿Cuál de los siguientes números decimales está más cerca de 3?',
     'Calcula qué tan lejos está cada número de 3.'),
    ('¿Cuál de los siguientes números decimales está más cerca de 3?',
     'Compara la diferencia entre cada número y 3.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 3/10?',
     'Un décimo es 0.1; piensa cuánto es 3 veces 0.1.'),
    ('¿Cuál número decimal es equivalente a la fracción 3/10?',
     'Escribe 3/10 en forma decimal ubicando el 3 en la posición de décimos.'),

    ('¿Cuál número decimal es equivalente a la fracción 1/2?',
     'Piensa en la mitad de 1 unidad.'),
    ('¿Cuál número decimal es equivalente a la fracción 1/2?',
     'La mitad de 1 es 0.5; recuerda esa equivalencia importante.'),

    ('¿Cuál número decimal es equivalente a la fracción 1/4?',
     'Divide 1 unidad en 4 partes iguales; cada parte es un cuarto.'),
    ('¿Cuál número decimal es equivalente a la fracción 1/4?',
     'Un cuarto es la mitad de 1/2; si 1/2 es 0.5, la mitad de 0.5 es 0.25.'),

    ('¿Cuál fracción es equivalente al número decimal 0.75?',
     '0.75 significa 75 centésimos.'),
    ('¿Cuál fracción es equivalente al número decimal 0.75?',
     '75/100 se puede simplificar dividiendo numerador y denominador entre 25.'),

    ('¿Cuál número decimal es equivalente a la fracción 25/100?',
     '25/100 tiene 25 centésimos; escríbelo como decimal.'),
    ('¿Cuál número decimal es equivalente a la fracción 25/100?',
     'Piensa que 25/100 es igual a 0.25.'),

    -- LO.7.4.1 – Adición y sustracción de decimales
    ('Calcula: 0.3 + 0.4 =',
     'Suma primero los décimos: 3 décimos más 4 décimos.'),
    ('Calcula: 0.3 + 0.4 =',
     'Piensa en 0.3 como 3/10 y 0.4 como 4/10; suma 3/10 + 4/10.'),

    ('Calcula: 1.2 + 0.5 =',
     'Alinea los números por la coma o el punto decimal antes de sumar.'),
    ('Calcula: 1.2 + 0.5 =',
     'Suma primero los décimos (2 + 5) y luego la parte entera.'),

    ('Calcula: 2.5 − 1.1 =',
     'Resta 1.1 a 2.5 alineando los decimales.'),
    ('Calcula: 2.5 − 1.1 =',
     'Resta los décimos (5 − 1) y luego las unidades (2 − 1).'),

    ('Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?',
     'Suma los soles con los soles y los céntimos con los céntimos.'),
    ('Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?',
     '3.50 + 1.20 se puede sumar como 3.5 + 1.2 en forma decimal.'),

    ('Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?',
     'Alinea los decimales 1.5 y 0.8 y súmalos.'),
    ('Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?',
     'Suma los décimos: 0.5 + 0.8 y luego ajusta si pasas de una unidad.')
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
-- SOLUTION_STEPS C.7 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación de decimales
    ('¿Cómo se lee correctamente el número decimal 0.4?',1,
     'Observa que 0.4 tiene un 4 en la posición de décimos, es decir, 4 partes de 10.'),
    ('¿Cómo se lee correctamente el número decimal 0.4?',2,
     'Por eso se lee como "cuatro décimos".'),

    ('María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?',1,
     'Si el total se divide en 10 partes iguales, cada parte es un décimo.'),
    ('María colorea 3 de 10 partes iguales de una tira. ¿Qué número decimal representa la parte coloreada?',2,
     'Tres décimos se representan como 0.3, así que la respuesta correcta es 0.3.'),

    ('Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?',1,
     'Cada cuadrito representa 1/100; colorear 25 es tener 25/100.'),
    ('Un tablero está dividido en 100 cuadritos iguales. Si Carlos colorea 25 cuadritos, ¿qué número decimal representa la parte coloreada?',2,
     '25/100 escrito como decimal es 0.25, por eso la respuesta correcta es 0.25.'),

    ('¿Cuál afirmación describe mejor el número 0.7?',1,
     'El número 0.7 tiene un 7 en la posición de décimos y 0 unidades completas.'),
    ('¿Cuál afirmación describe mejor el número 0.7?',2,
     'Eso significa que representa 7 décimos, por lo que la afirmación correcta es "Tiene 7 décimos".'),

    ('Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?',1,
     'Tres décimos se escriben como 0.3 y cinco centésimos como 0.05.'),
    ('Un número tiene 3 décimos y 5 centésimos. ¿Cuál de los siguientes números lo representa?',2,
     '0.3 + 0.05 = 0.35, por eso el número correcto es 0.35.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear
    ('¿Cuál es mayor: 0.5 o 0.8?',1,
     'Compara los décimos: 0.5 tiene 5 décimos y 0.8 tiene 8 décimos.'),
    ('¿Cuál es mayor: 0.5 o 0.8?',2,
     'Como 8 décimos es más que 5 décimos, 0.8 es mayor que 0.5.'),

    ('¿Cuál es el número decimal menor?',1,
     'Todos tienen parte entera 0, así que compara solo los décimos: 0.2, 0.5 y 0.7.'),
    ('¿Cuál es el número decimal menor?',2,
     'El más pequeño es el que tiene menos décimos; 0.2 tiene 2 décimos, por eso es el menor.'),

    ('¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?',1,
     'Mira la cifra de las centésimas: en 2.36 es 6.'),
    ('¿A cuánto se aproxima 2.36 si lo redondeas a la décima más cercana?',2,
     'Como 6 es mayor o igual que 5, la décima (3) sube a 4, quedando 2.4.'),

    ('Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.',1,
     'Entre 1.0 y 1.1 hay un aumento de 0.1; entre 1.1 y 1.2 también.'),
    ('Secuencia: 1.0, 1.1, 1.2, __, 1.4. Escribe el número que falta.',2,
     'Después de 1.2 viene 1.3, y luego 1.4; el número que falta es 1.3.'),

    ('¿Cuál de los siguientes números decimales está más cerca de 3?',1,
     'Calcula la diferencia: |2.9 − 3| = 0.1, |3.5 − 3| = 0.5 y |2.4 − 3| = 0.6.'),
    ('¿Cuál de los siguientes números decimales está más cerca de 3?',2,
     'La menor diferencia es 0.1, así que 2.9 es el número más cercano a 3.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 3/10?',1,
     'Dividir una unidad en 10 partes iguales da décimos; 3/10 son 3 de esas partes.'),
    ('¿Cuál número decimal es equivalente a la fracción 3/10?',2,
     '3/10 se escribe como 0.3 en forma decimal, porque el 3 está en la posición de décimos.'),

    ('¿Cuál número decimal es equivalente a la fracción 1/2?',1,
     'La fracción 1/2 representa la mitad de una unidad.'),
    ('¿Cuál número decimal es equivalente a la fracción 1/2?',2,
     'La mitad de 1 es 0.5, por eso 1/2 es equivalente a 0.5.'),

    ('¿Cuál número decimal es equivalente a la fracción 1/4?',1,
     '1/4 es la cuarta parte de la unidad; otra forma de verlo es que es la mitad de 1/2.'),
    ('¿Cuál número decimal es equivalente a la fracción 1/4?',2,
     'Si 1/2 es 0.5, la mitad de 0.5 es 0.25, por eso 1/4 equivale a 0.25.'),

    ('¿Cuál fracción es equivalente al número decimal 0.75?',1,
     '0.75 significa 75 centésimos; se puede escribir como 75/100.'),
    ('¿Cuál fracción es equivalente al número decimal 0.75?',2,
     '75/100 se simplifica dividiendo entre 25: 75 ÷ 25 = 3 y 100 ÷ 25 = 4, resultando 3/4.'),

    ('¿Cuál número decimal es equivalente a la fracción 25/100?',1,
     '25/100 son 25 centésimos; piensa cómo se escribe como decimal.'),
    ('¿Cuál número decimal es equivalente a la fracción 25/100?',2,
     'Se escribe 0.25, porque el 25 va en la parte de centésimos.'),

    -- LO.7.4.1 – Adición y sustracción de decimales
    ('Calcula: 0.3 + 0.4 =',1,
     'Suma los décimos: 3 décimos más 4 décimos.'),
    ('Calcula: 0.3 + 0.4 =',2,
     '3/10 + 4/10 = 7/10, que en decimal es 0.7.'),

    ('Calcula: 1.2 + 0.5 =',1,
     'Alinea los números: 1.2 y 0.5; suma 2 décimos + 5 décimos.'),
    ('Calcula: 1.2 + 0.5 =',2,
     '2 + 5 = 7 décimos, y en la parte entera 1 + 0 = 1, así que el resultado es 1.7.'),

    ('Calcula: 2.5 − 1.1 =',1,
     'Resta primero los décimos: 5 décimos menos 1 décimo.'),
    ('Calcula: 2.5 − 1.1 =',2,
     '5 − 1 = 4 décimos y 2 − 1 = 1 unidad, por eso el resultado es 1.4.'),

    ('Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?',1,
     'Escribe la suma: 3.50 + 1.20 y alinea los decimales.'),
    ('Ana tiene S/ 3.50 y recibe S/ 1.20 más. ¿Cuánto dinero tiene ahora en total?',2,
     '3.50 + 1.20 = 4.70, así que Ana tiene S/ 4.70 en total.'),

    ('Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?',1,
     'Suma 1.5 + 0.8 alineando los decimales.'),
    ('Luis recorre 1.5 km por la mañana y 0.8 km por la tarde. ¿Cuántos kilómetros recorre en total?',2,
     '5 décimos + 8 décimos = 13 décimos, que es 1.3; 1 + 0 + 1.3 = 2.3 km en total.')
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
-- RESUMEN LOG C.7 BASIC (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'BASIC') AS exercises_c7_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'BASIC') AS hints_c7_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'BASIC') AS steps_c7_basic;
