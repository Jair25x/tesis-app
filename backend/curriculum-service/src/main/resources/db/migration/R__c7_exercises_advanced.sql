-- ============================================================
-- R__c7_exercises_advanced.sql
-- C.7 – DECIMALES (4.º)
--
-- Nivel: ADVANCED
-- LOs cubiertos:
--   LO.7.1.1 – Representación de números decimales
--   LO.7.2.1 – Comparar, ordenar y redondear decimales
--   LO.7.3.1 – Equivalencia entre fracciones y decimales
--   LO.7.4.1 – Adición y sustracción de decimales
--
-- 5 ejercicios ADVANCED por LO (20 en total).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE
--   - NUMBER_SEQUENCE_QA
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.7.1.1 – Representación de números decimales
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A1 — 307 de 1000 cuadritos (milésimos)
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
       'Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?',
       'ADVANCED','EQUATION',
       'B) 0.307',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.37",
            "B) 0.307",
            "C) 3.07"
          ],
          "answer": "B) 0.307"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?'
  );

-- A2 — Cinta de 1 m: 4 décimos y medio décimo (0.45 m)
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
       'Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?',
       'ADVANCED','EQUATION',
       'C) 0.45 m',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.4 m",
            "B) 0.5 m",
            "C) 0.45 m"
          ],
          "answer": "C) 0.45 m"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?'
  );

-- A3 — Punto Q tres décimos después de 2.4
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
       'En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?',
       'ADVANCED','EQUATION',
       'A) 2.7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.7",
            "B) 2.43",
            "C) 2.34"
          ],
          "answer": "A) 2.7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?'
  );

-- A4 — 0 unidades, 8 décimos, 5 centésimos y 2 milésimos
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
       'Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?',
       'ADVANCED','EQUATION',
       'B) 0.852',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.582",
            "B) 0.852",
            "C) 8.052"
          ],
          "answer": "B) 0.852"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?'
  );

-- A5 — ¿Qué descripción corresponde a 1.08?
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
       '¿Cuál de las siguientes descripciones corresponde al número 1.08?',
       'ADVANCED','EQUATION',
       'C) una unidad y ocho centésimos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) una unidad y ocho décimos",
            "B) diez unidades y ocho centésimos",
            "C) una unidad y ocho centésimos"
          ],
          "answer": "C) una unidad y ocho centésimos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes descripciones corresponde al número 1.08?'
  );

------------------------------------------------------------
-- LO.7.2.1 – Comparar, ordenar y redondear decimales
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A6 — Ordenar 3.09, 3.9, 3.19 y 3.109
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
       'Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?',
       'ADVANCED','EQUATION',
       'B) 3.09, 3.109, 3.19, 3.9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3.09, 3.19, 3.109, 3.9",
            "B) 3.09, 3.109, 3.19, 3.9",
            "C) 3.109, 3.09, 3.19, 3.9"
          ],
          "answer": "B) 3.09, 3.109, 3.19, 3.9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?'
  );

-- A7 — Completar desigualdad 4.205 __ 4.25
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
       'Completa la desigualdad: 4.205 __ 4.25',
       'ADVANCED','EQUATION',
       'A) <',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) <",
            "B) >",
            "C) ="
          ],
          "answer": "A) <"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa la desigualdad: 4.205 __ 4.25'
  );

-- A8 — Redondear 7.486 a la centésima
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
       '¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?',
       'ADVANCED','EQUATION',
       'C) 7.49',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7.48",
            "B) 7.40",
            "C) 7.49"
          ],
          "answer": "C) 7.49"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?'
  );

-- A9 — Secuencia con paso 0.125
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
       'Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.',
       'ADVANCED','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [0.5, 0.625, 0.75, null, 1.0],
          "rule": "sumar 0.125 en cada paso",
          "missingIndex": 3,
          "answer": 0.875
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.'
  );

-- A10 — Número más cercano a 2.5
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
       '¿Cuál de estos números está más cerca de 2.5?',
       'ADVANCED','EQUATION',
       'C) 2.499',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2.491",
            "B) 2.495",
            "C) 2.499"
          ],
          "answer": "C) 2.499"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿Cuál de estos números está más cerca de 2.5?'
  );

------------------------------------------------------------
-- LO.7.3.1 – Equivalencia entre fracciones y decimales
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A11 — 125/1000 como decimal
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
       '¿Cuál número decimal es equivalente a la fracción 125/1000?',
       'ADVANCED','EQUATION',
       'B) 0.125',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.25",
            "B) 0.125",
            "C) 0.0125"
          ],
          "answer": "B) 0.125"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿Cuál número decimal es equivalente a la fracción 125/1000?'
  );

-- A12 — Decimal equivalente a 3/4
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
       '¿Cuál número decimal es equivalente a la fracción 3/4?',
       'ADVANCED','EQUATION',
       'C) 0.75',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.34",
            "B) 0.7",
            "C) 0.75"
          ],
          "answer": "C) 0.75"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿Cuál número decimal es equivalente a la fracción 3/4?'
  );

-- A13 — Fracción equivalente a 0.45 (requiere simplificar)
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
       '¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?',
       'ADVANCED','EQUATION',
       'B) 9/20',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 45/10",
            "B) 9/20",
            "C) 5/9"
          ],
          "answer": "B) 9/20"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?'
  );

-- A14 — 0.6 L como fracción de litro
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
       'Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?',
       'ADVANCED','EQUATION',
       'A) 3/5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3/5",
            "B) 6/5",
            "C) 2/3"
          ],
          "answer": "A) 3/5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?'
  );

-- A15 — Parejas equivalentes fracción–decimal
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
       '¿Cuál de las siguientes parejas representa la misma cantidad?',
       'ADVANCED','EQUATION',
       'A) 0.25 y 1/4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 0.25 y 1/4",
            "B) 0.4 y 2/3",
            "C) 0.3 y 1/2"
          ],
          "answer": "A) 0.25 y 1/4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = '¿Cuál de las siguientes parejas representa la misma cantidad?'
  );

------------------------------------------------------------
-- LO.7.4.1 – Adición y sustracción de decimales
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A16 — 2.35 + 1.48
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
       'Calcula: 2.35 + 1.48 =',
       'ADVANCED','EQUATION',
       'B) 3.83',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3.73",
            "B) 3.83",
            "C) 3.93"
          ],
          "answer": "B) 3.83"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Calcula: 2.35 + 1.48 ='
  );

-- A17 — 9.6 − 3.75
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
       'Calcula: 9.6 − 3.75 =',
       'ADVANCED','EQUATION',
       'C) 5.85',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6.15",
            "B) 5.35",
            "C) 5.85"
          ],
          "answer": "C) 5.85"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Calcula: 9.6 − 3.75 ='
  );

-- A18 — Pasajes de bus y vuelto (3 pasajes de 1.80, paga con 10)
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
       'Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?',
       'ADVANCED','EQUATION',
       'A) S/ 4.60',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) S/ 4.60",
            "B) S/ 5.40",
            "C) S/ 3.40"
          ],
          "answer": "A) S/ 4.60"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?'
  );

-- A19 — Suma de tres longitudes: 0.75 m + 1.25 m + 0.5 m
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
       'Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?',
       'ADVANCED','EQUATION',
       'C) 2.5 m',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1.75 m",
            "B) 2.25 m",
            "C) 2.5 m"
          ],
          "answer": "C) 2.5 m"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?'
  );

-- A20 — ¿Alcanza para el helado?
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
       'Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?',
       'ADVANCED','EQUATION',
       'C) No, le falta dinero.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Sí, le sobran S/ 0.05.",
            "B) Sí, le sobra más de S/ 0.10.",
            "C) No, le falta dinero."
          ],
          "answer": "C) No, le falta dinero."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
      WHERE e.learning_objective_id = (SELECT id FROM lo)
        AND e.statement = 'Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?'
  );

------------------------------------------------------------
-- HINTS C.7 ADVANCED (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación
    ('Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?',
     'Piensa en la fracción 307/1000: cada cuadrito es un milésimo.'),
    ('Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?',
     'Ubica 307 en la parte de milésimos: 0.307.'),

    ('Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?',
     'Cada parte es un décimo de metro, es decir, 0.1 m.'),
    ('Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?',
     '4 décimos son 0.4 y la mitad de un décimo es 0.05; suma ambas cantidades.'),

    ('En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?',
     'Tres décimos equivalen a 0.3.'),
    ('En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?',
     'Suma 2.4 + 0.3 y obtendrás el número representado por Q.'),

    ('Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?',
     'Coloca 8 en la posición de décimos, 5 en la de centésimos y 2 en la de milésimos.'),
    ('Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?',
     'El número debe escribirse como 0.852.'),

    ('¿Cuál de las siguientes descripciones corresponde al número 1.08?',
     'En 1.08, el 0 está en la posición de décimos y el 8 en la de centésimos.'),
    ('¿Cuál de las siguientes descripciones corresponde al número 1.08?',
     'Por eso se lee como una unidad y ocho centésimos, no como ocho décimos.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear
    ('Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?',
     'Escribe todos como 3.090, 3.900, 3.190 y 3.109 para comparar mejor.'),
    ('Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?',
     'Compara primero las décimas, luego las centésimas y finalmente las milésimas.'),

    ('Completa la desigualdad: 4.205 __ 4.25',
     '4.205 tiene tres cifras decimales y 4.25 tiene dos, puedes escribir 4.25 como 4.250.'),
    ('Completa la desigualdad: 4.205 __ 4.25',
     'Compara 4.205 con 4.250 para ver cuál es mayor.'),

    ('¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?',
     'La centésima es 8 y la milésima es 6.'),
    ('¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?',
     'Si la milésima es 5 o mayor, la centésima sube en 1.'),

    ('Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.',
     'Calcula cuánto aumenta la secuencia de un término a otro.'),
    ('Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.',
     'Suma 0.125 a 0.75 para encontrar el siguiente término.'),

    ('¿Cuál de estos números está más cerca de 2.5?',
     'Calcula la diferencia entre cada número y 2.5.'),
    ('¿Cuál de estos números está más cerca de 2.5?',
     'El número cuya diferencia con 2.5 sea menor es el más cercano.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 125/1000?',
     '125/1000 indica 125 milésimos.'),
    ('¿Cuál número decimal es equivalente a la fracción 125/1000?',
     'Ubica 125 en la posición de milésimos: 0.125.'),

    ('¿Cuál número decimal es equivalente a la fracción 3/4?',
     '3/4 también puede verse como 75/100.'),
    ('¿Cuál número decimal es equivalente a la fracción 3/4?',
     '75/100 se escribe como 0.75 en forma decimal.'),

    ('¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?',
     '0.45 se puede escribir como 45/100.'),
    ('¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?',
     'Simplifica 45/100 dividiendo entre 5 y luego entre 5 nuevamente.'),

    ('Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?',
     '0.6 tiene una cifra decimal, por lo que corresponde a una fracción con denominador 10.'),
    ('Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?',
     '0.6 = 6/10 y se simplifica dividiendo numerador y denominador entre 2.'),

    ('¿Cuál de las siguientes parejas representa la misma cantidad?',
     '0.25 puede verse como 25/100.'),
    ('¿Cuál de las siguientes parejas representa la misma cantidad?',
     '25/100 se simplifica a 1/4, por eso 0.25 y 1/4 representan lo mismo.'),

    -- LO.7.4.1 – Adición y sustracción
    ('Calcula: 2.35 + 1.48 =',
     'Alinea los números por el punto decimal antes de sumar.'),
    ('Calcula: 2.35 + 1.48 =',
     'Suma centésimas, luego décimas y al final unidades para obtener el resultado.'),

    ('Calcula: 9.6 − 3.75 =',
     'Piensa en 9.6 como 9.60 para restar más fácilmente.'),
    ('Calcula: 9.6 − 3.75 =',
     'Resta 3.75 de 9.60 paso a paso para obtener el resultado.'),

    ('Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?',
     'Primero calcula cuánto cuestan los 3 pasajes en total.'),
    ('Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?',
     'Resta el total gastado al monto de S/ 10.00 para encontrar el vuelto.'),

    ('Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?',
     'Suma primero 0.75 m y 1.25 m.'),
    ('Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?',
     'Luego suma el resultado con 0.5 m para obtener la distancia total.'),

    ('Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?',
     'Primero suma 7.35 y 2.80 para saber cuánto ha gastado antes del helado.'),
    ('Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?',
     'Luego suma el precio del helado y compara el total con los S/ 12.00 que tiene.')
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
-- SOLUTION_STEPS C.7 ADVANCED (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.7.1.1 – Representación
    ('Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?',1,
     'Cada cuadrito es 1/1000 de la unidad, así que la parte coloreada es 307/1000.'),
    ('Un tablero tiene 1000 cuadritos iguales y se colorean 307 de ellos. ¿Qué número decimal representa la parte coloreada?',2,
     '307/1000 se escribe como 0.307, por eso esa es la respuesta correcta.'),

    ('Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?',1,
     '4 partes completas son 4 décimos: 4 × 0.1 = 0.4 m.'),
    ('Una cinta de 1 metro se divide en 10 partes iguales. Se colorean 4 partes completas y la mitad de la siguiente parte. ¿Qué longitud decimal representa la parte coloreada?',2,
     'La mitad de un décimo es 0.05, entonces 0.4 + 0.05 = 0.45 m.'),

    ('En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?',1,
     'Tres décimos equivalen a 0.3, así que sumamos 2.4 + 0.3.'),
    ('En una recta numérica se marca el número 2.4. El punto Q está tres décimos más a la derecha que 2.4. ¿Qué número representa Q?',2,
     '2.4 + 0.3 = 2.7, por eso Q representa el número 2.7.'),

    ('Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?',1,
     'Escribe 0 en la parte entera y luego 8, 5 y 2 en la parte decimal: décimos, centésimos y milésimos.'),
    ('Un número decimal tiene 0 unidades, 8 décimos, 5 centésimos y 2 milésimos. ¿Cuál es ese número?',2,
     'El número formado es 0.852, que coincide con la opción correcta.'),

    ('¿Cuál de las siguientes descripciones corresponde al número 1.08?',1,
     'En 1.08 la cifra 0 indica que no hay décimos, y la cifra 8 indica ocho centésimos.'),
    ('¿Cuál de las siguientes descripciones corresponde al número 1.08?',2,
     'Por eso se describe como una unidad y ocho centésimos.'),

    -- LO.7.2.1 – Comparar, ordenar y redondear
    ('Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?',1,
     'Escribe los números como 3.090, 3.900, 3.190 y 3.109 para compararlos.'),
    ('Ordena de menor a mayor: 3.09, 3.9, 3.19 y 3.109. ¿Cuál opción es correcta?',2,
     'El orden correcto es 3.09 (3.090), 3.109, 3.19 (3.190) y 3.9 (3.900).'),

    ('Completa la desigualdad: 4.205 __ 4.25',1,
     'Escribe 4.25 como 4.250 para compararlo con 4.205.'),
    ('Completa la desigualdad: 4.205 __ 4.25',2,
     '4.205 es menor que 4.250, por eso el signo correcto es "<".'),

    ('¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?',1,
     'La centésima es 8 y la milésima es 6, que es mayor que 5.'),
    ('¿A cuánto se aproxima 7.486 si lo redondeas a la centésima más cercana?',2,
     'Al ser 6 mayor que 5, la centésima sube de 8 a 9, quedando 7.49.'),

    ('Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.',1,
     'De 0.5 a 0.625 aumenta 0.125, y de 0.625 a 0.75 también aumenta 0.125.'),
    ('Secuencia: 0.5, 0.625, 0.75, __, 1.0. Escribe el número que falta.',2,
     'Después de 0.75, sumamos 0.125 y obtenemos 0.875; luego 0.875 + 0.125 = 1.0.'),

    ('¿Cuál de estos números está más cerca de 2.5?',1,
     'Calcula: |2.491 − 2.5|, |2.495 − 2.5| y |2.499 − 2.5|.'),
    ('¿Cuál de estos números está más cerca de 2.5?',2,
     'La diferencia más pequeña es la de 2.499, por eso es el número más cercano.'),

    -- LO.7.3.1 – Equivalencia fracción–decimal
    ('¿Cuál número decimal es equivalente a la fracción 125/1000?',1,
     '125/1000 significa 125 milésimos, es decir, tres cifras decimales.'),
    ('¿Cuál número decimal es equivalente a la fracción 125/1000?',2,
     'Al ubicar 125 en la parte decimal obtenemos 0.125.'),

    ('¿Cuál número decimal es equivalente a la fracción 3/4?',1,
     'Divide 3 entre 4 o piensa en cuántos centésimos son 3/4.'),
    ('¿Cuál número decimal es equivalente a la fracción 3/4?',2,
     '3/4 equivale a 75/100, que se escribe como 0.75.'),

    ('¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?',1,
     '0.45 puede escribirse como 45/100.'),
    ('¿Cuál fracción es equivalente al número decimal 0.45 en su forma simplificada?',2,
     '45/100 se simplifica dividiendo numerador y denominador entre 5 y luego entre 5, obteniendo 9/20.'),

    ('Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?',1,
     '0.6 es lo mismo que 6 décimos, por lo que se escribe 6/10.'),
    ('Una botella contiene 0.6 litros de jugo. ¿Qué fracción del litro representa esa cantidad?',2,
     '6/10 se simplifica dividiendo entre 2, resultando 3/5.'),

    ('¿Cuál de las siguientes parejas representa la misma cantidad?',1,
     '0.25 se puede escribir como 25/100.'),
    ('¿Cuál de las siguientes parejas representa la misma cantidad?',2,
     '25/100 se simplifica a 1/4, así que 0.25 y 1/4 representan la misma cantidad.'),

    -- LO.7.4.1 – Adición y sustracción
    ('Calcula: 2.35 + 1.48 =',1,
     'Alinea los números: 2.35 y 1.48, y suma primero centésimas y décimas.'),
    ('Calcula: 2.35 + 1.48 =',2,
     '2.35 + 1.48 = 3.83, sumando 0.35 + 0.48 = 0.83 y 2 + 1 = 3.'),

    ('Calcula: 9.6 − 3.75 =',1,
     'Escribe 9.6 como 9.60 y luego resta 3.75.'),
    ('Calcula: 9.6 − 3.75 =',2,
     '9.60 − 3.75 = 5.85, por eso la respuesta correcta es 5.85.'),

    ('Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?',1,
     'Multiplica 1.80 × 3 para saber cuánto gasta en pasajes.'),
    ('Un pasaje de bus cuesta S/ 1.80. Una niña compra 3 pasajes y paga con un billete de S/ 10.00. ¿Cuánto dinero recibe de vuelto?',2,
     '1.80 × 3 = 5.40; luego 10.00 − 5.40 = 4.60, ese es el vuelto.'),

    ('Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?',1,
     'Suma 0.75 + 1.25 para obtener 2.0 m.'),
    ('Una niña recorre 0.75 m en la sala, 1.25 m en el pasillo y 0.5 m en el patio. ¿Cuántos metros recorre en total?',2,
     'Después suma 2.0 + 0.5 = 2.5 m, que es la distancia total.'),

    ('Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?',1,
     'Suma 7.35 + 2.80 para saber cuánto gasta antes del helado.'),
    ('Karla tiene S/ 12.00. Compra un libro que cuesta S/ 7.35 y un cuaderno que cuesta S/ 2.80. Luego quiere comprar un helado que cuesta S/ 1.90. ¿Podrá comprar el helado?',2,
     '7.35 + 2.80 + 1.90 = 12.05, que es mayor que 12.00, por eso no le alcanza el dinero.')
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
-- RESUMEN LOG C.7 ADVANCED (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'ADVANCED') AS exercises_c7_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'ADVANCED') AS hints_c7_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.7.1.1','LO.7.2.1','LO.7.3.1','LO.7.4.1')
     AND e.difficulty = 'ADVANCED') AS steps_c7_advanced;
