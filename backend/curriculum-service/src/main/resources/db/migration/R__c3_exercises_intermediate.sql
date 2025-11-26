-- ============================================================
-- R__c3_exercises_intermediate.sql
-- C.3 – CUATRO OPERACIONES CON NÚMEROS NATURALES (4.º)
--
-- Nivel: INTERMEDIATE
-- LOs cubiertos:
--   LO.3.1.1 – Multiplicación por un número de una cifra
--   LO.3.1.2 – Multiplicación por un número de dos cifras
--   LO.3.2.1 – División entre un número de una cifra
--   LO.3.3.1 – Igualdades con operaciones
--   LO.3.3.2 – Resolución de problemas con las cuatro operaciones
--
-- 3 ejercicios INTERMEDIATE por LO (total: 15).
-- Todos usan la plantilla EQUATION_SINGLE_CHOICE.
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.3.1.1 – Multiplicación por un número de una cifra
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I1 — 24 × 3
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 24 × 3?',
       'INTERMEDIATE','EQUATION',
       'B) 72',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 64",
            "B) 72",
            "C) 76"
          ],
          "answer": "B) 72"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 24 × 3?'
  );

-- I2 — problema 7 × 6
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?',
       'INTERMEDIATE','EQUATION',
       'C) 42 cartas',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 36 cartas",
            "B) 40 cartas",
            "C) 42 cartas"
          ],
          "answer": "C) 42 cartas"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?'
  );

-- I3 — 9 × 4
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es el resultado de 9 × 4?',
       'INTERMEDIATE','EQUATION',
       'A) 36',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 36",
            "B) 32",
            "C) 40"
          ],
          "answer": "A) 36"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 9 × 4?'
  );

------------------------------------------------------------
-- LO.3.1.2 – Multiplicación por un número de dos cifras
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I4 — 23 × 4
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 23 × 4?',
       'INTERMEDIATE','EQUATION',
       'C) 92',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 82",
            "B) 88",
            "C) 92"
          ],
          "answer": "C) 92"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 23 × 4?'
  );

-- I5 — problema 18 × 3
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?',
       'INTERMEDIATE','EQUATION',
       'B) 54 libros',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 48 libros",
            "B) 54 libros",
            "C) 60 libros"
          ],
          "answer": "B) 54 libros"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?'
  );

-- I6 — 27 × 3
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es el resultado de 27 × 3?',
       'INTERMEDIATE','EQUATION',
       'B) 81',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 72",
            "B) 81",
            "C) 90"
          ],
          "answer": "B) 81"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 27 × 3?'
  );

------------------------------------------------------------
-- LO.3.2.1 – División entre un número de una cifra
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I7 — 56 ÷ 7
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuánto es 56 ÷ 7?',
       'INTERMEDIATE','EQUATION',
       'C) 8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6",
            "B) 7",
            "C) 8"
          ],
          "answer": "C) 8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 56 ÷ 7?'
  );

-- I8 — problema 36 ÷ 6
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?',
       'INTERMEDIATE','EQUATION',
       'B) 6 lápices',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5 lápices",
            "B) 6 lápices",
            "C) 7 lápices"
          ],
          "answer": "B) 6 lápices"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?'
  );

-- I9 — 63 ÷ 3
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es el resultado de 63 ÷ 3?',
       'INTERMEDIATE','EQUATION',
       'A) 21',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 21",
            "B) 18",
            "C) 24"
          ],
          "answer": "A) 21"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 63 ÷ 3?'
  );

------------------------------------------------------------
-- LO.3.3.1 – Igualdades con operaciones
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I10 — igualdad verdadera
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes igualdades es verdadera?',
       'INTERMEDIATE','EQUATION',
       'B) 4 × 6 = 24',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 + 7 = 14",
            "B) 4 × 6 = 24",
            "C) 5 × 5 = 20"
          ],
          "answer": "B) 4 × 6 = 24"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades es verdadera?'
  );

-- I11 — igualdad equivalente a 3 × 8 + 4
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?',
       'INTERMEDIATE','EQUATION',
       'C) 4 × 6 + 4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2 × 10 + 4",
            "B) 3 × 6 + 6",
            "C) 4 × 6 + 4"
          ],
          "answer": "C) 4 × 6 + 4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?'
  );

-- I12 — verificar 35 ÷ 5 = 7
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?',
       'INTERMEDIATE','EQUATION',
       'A) 7 × 5 = 35',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7 × 5 = 35",
            "B) 7 + 5 = 35",
            "C) 35 − 7 = 5"
          ],
          "answer": "A) 7 × 5 = 35"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?'
  );

------------------------------------------------------------
-- LO.3.3.2 – Resolución de problemas con las cuatro operaciones
-- 3 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I13 — 25 − 7
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?',
       'INTERMEDIATE','EQUATION',
       'B) 18 stickers',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 17 stickers",
            "B) 18 stickers",
            "C) 20 stickers"
          ],
          "answer": "B) 18 stickers"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?'
  );

-- I14 — 3 × 6 + 2 × 2
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?',
       'INTERMEDIATE','EQUATION',
       'C) 22 soles',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 18 soles",
            "B) 20 soles",
            "C) 22 soles"
          ],
          "answer": "C) 22 soles"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?'
  );

-- I15 — 4 × 8 − 5
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.3.3.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?',
       'INTERMEDIATE','EQUATION',
       'A) 27 pelotas',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 27 pelotas",
            "B) 29 pelotas",
            "C) 31 pelotas"
          ],
          "answer": "A) 27 pelotas"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?'
  );

------------------------------------------------------------
-- HINTS C.3 INTERMEDIATE (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 24 × 3?',
     'Piensa en 3 grupos de 24 o en 24 + 24 + 24.'),
    ('¿Cuánto es 24 × 3?',
     'Primero calcula 20 × 3 y luego 4 × 3 y suma los resultados.'),

    ('Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?',
     'Cada sobre tiene 6 cartas; usa la multiplicación 7 × 6.'),
    ('Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?',
     'Multiplica 7 × 6 o suma 6 siete veces para encontrar el total.'),

    ('¿Cuál es el resultado de 9 × 4?',
     'Puedes sumar 9 + 9 + 9 + 9 para encontrar el resultado.'),
    ('¿Cuál es el resultado de 9 × 4?',
     'Piensa en 10 × 4 y luego réstale 4.'),

    -- LO.3.1.2
    ('¿Cuánto es 23 × 4?',
     'Descompón 23 como 20 + 3 y multiplica cada parte por 4.'),
    ('¿Cuánto es 23 × 4?',
     'Calcula 20 × 4 y 3 × 4, luego suma los resultados.'),

    ('En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?',
     'Usa la multiplicación 18 × 3 para hallar el número total de libros.'),
    ('En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?',
     'Piensa en 10 × 3 y 8 × 3 y suma los resultados.'),

    ('¿Cuál es el resultado de 27 × 3?',
     'Descompón 27 como 20 + 7 y multiplica cada parte por 3.'),
    ('¿Cuál es el resultado de 27 × 3?',
     'Calcula 20 × 3 y 7 × 3, luego suma los resultados.'),

    -- LO.3.2.1
    ('¿Cuánto es 56 ÷ 7?',
     'Piensa qué número multiplicado por 7 da 56.'),
    ('¿Cuánto es 56 ÷ 7?',
     'Puedes usar la tabla de 7 para encontrar el número que da 56.'),

    ('En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?',
     'Plantea la división 36 ÷ 6.'),
    ('En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?',
     'Piensa qué número multiplicado por 6 da 36.'),

    ('¿Cuál es el resultado de 63 ÷ 3?',
     'Piensa cuántas veces cabe 3 en 63.'),
    ('¿Cuál es el resultado de 63 ÷ 3?',
     'Puedes usar que 21 × 3 = 63.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es verdadera?',
     'Calcula los resultados de cada igualdad y compáralos.'),
    ('¿Cuál de las siguientes igualdades es verdadera?',
     'Verifica cuál de las operaciones da exactamente el número indicado.'),

    ('¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?',
     'Primero calcula 3 × 8 y luego suma 4.'),
    ('¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?',
     'Compara el resultado con cada expresión para ver cuál coincide.'),

    ('¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?',
     'Recuerda que puedes verificar una división usando la multiplicación.'),
    ('¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?',
     'Multiplica el cociente por el divisor y revisa si obtienes 35.'),

    -- LO.3.3.2
    ('Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?',
     'Cuando regala stickers, la cantidad disminuye; debes restar.'),
    ('Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?',
     'Calcula 25 − 7 para encontrar cuántos le quedan.'),

    ('La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?',
     'Primero calcula cuánto paga por los cuadernos y luego por los lapiceros.'),
    ('La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?',
     'Usa 3 × 6 para los cuadernos y 2 × 2 para los lapiceros y suma los resultados.'),

    ('El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?',
     'Primero calcula cuántas pelotas hay en total en las 4 cajas.'),
    ('El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?',
     'Calcula 4 × 8 y luego réstale las 5 pelotas que se regalaron.')
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
-- SOLUTION_STEPS C.3 INTERMEDIATE (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 24 × 3?',1,
     'Descompón 24 en 20 y 4: calcula 20 × 3 y 4 × 3.'),
    ('¿Cuánto es 24 × 3?',2,
     '20 × 3 = 60 y 4 × 3 = 12; 60 + 12 = 72, por eso 24 × 3 = 72.'),

    ('Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?',1,
     'Plantea la multiplicación 7 × 6 porque hay 7 grupos de 6 cartas.'),
    ('Rosa tiene 7 sobres y en cada sobre guarda 6 cartas. ¿Cuántas cartas tiene en total?',2,
     '7 × 6 = 42, por eso Rosa tiene 42 cartas en total.'),

    ('¿Cuál es el resultado de 9 × 4?',1,
     'Piensa en 10 × 4 y réstale 4 para ajustar.'),
    ('¿Cuál es el resultado de 9 × 4?',2,
     '10 × 4 = 40; 40 − 4 = 36, por eso 9 × 4 = 36.'),

    -- LO.3.1.2
    ('¿Cuánto es 23 × 4?',1,
     'Descompón 23 en 20 y 3 para multiplicar por separado: 20 × 4 y 3 × 4.'),
    ('¿Cuánto es 23 × 4?',2,
     '20 × 4 = 80 y 3 × 4 = 12; 80 + 12 = 92, así que 23 × 4 = 92.'),

    ('En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?',1,
     'Plantea la multiplicación 18 × 3 (libros por estante por cantidad de estantes).'),
    ('En la biblioteca hay 18 libros en cada estante y hay 3 estantes iguales. ¿Cuántos libros hay en total?',2,
     '18 × 3 = 54, por lo tanto hay 54 libros en total.'),

    ('¿Cuál es el resultado de 27 × 3?',1,
     'Descompón 27 en 20 y 7 para multiplicar cada parte por 3.'),
    ('¿Cuál es el resultado de 27 × 3?',2,
     '20 × 3 = 60 y 7 × 3 = 21; 60 + 21 = 81, por eso 27 × 3 = 81.'),

    -- LO.3.2.1
    ('¿Cuánto es 56 ÷ 7?',1,
     'Busca un número que al multiplicarlo por 7 dé 56.'),
    ('¿Cuánto es 56 ÷ 7?',2,
     '7 × 8 = 56, por eso 56 ÷ 7 = 8.'),

    ('En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?',1,
     'Plantea la división 36 ÷ 6 para repartir en partes iguales.'),
    ('En una caja hay 36 lápices que se reparten en partes iguales entre 6 estudiantes. ¿Cuántos lápices recibe cada una?',2,
     '36 ÷ 6 = 6, así que cada estudiante recibe 6 lápices.'),

    ('¿Cuál es el resultado de 63 ÷ 3?',1,
     'Piensa en 3 × 20 y 3 × 1 para acercarte a 63.'),
    ('¿Cuál es el resultado de 63 ÷ 3?',2,
     '3 × 20 = 60 y falta 3, que es 3 × 1; 20 + 1 = 21, por eso 63 ÷ 3 = 21.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es verdadera?',1,
     'Calcula cada operación: 8 + 7, 4 × 6 y 5 × 5.'),
    ('¿Cuál de las siguientes igualdades es verdadera?',2,
     '8 + 7 = 15 (no 14), 4 × 6 = 24 (correcta) y 5 × 5 = 25 (no 20), por eso la igualdad verdadera es 4 × 6 = 24.'),

    ('¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?',1,
     'Calcula 3 × 8 + 4: primero 3 × 8 y luego suma 4.'),
    ('¿Cuál de las siguientes expresiones tiene el mismo resultado que 3 × 8 + 4?',2,
     '3 × 8 = 24; 24 + 4 = 28. 4 × 6 + 4 = 24 + 4 = 28, por eso esa expresión tiene el mismo resultado.'),

    ('¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?',1,
     'Para verificar una división, multiplica el cociente (7) por el divisor (5).'),
    ('¿Cuál de las siguientes igualdades sirve para verificar que 35 ÷ 5 = 7?',2,
     '7 × 5 = 35, por eso esa igualdad verifica que 35 ÷ 5 = 7.'),

    -- LO.3.3.2
    ('Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?',1,
     'Cuando se regala una cantidad, se resta: plantea 25 − 7.'),
    ('Carla tenía 25 stickers y regaló 7 a su amiga. ¿Cuántos stickers le quedan?',2,
     '25 − 7 = 18, así que a Carla le quedan 18 stickers.'),

    ('La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?',1,
     'Primero calcula cuánto paga por los cuadernos (3 × 6) y luego por los lapiceros (2 × 2).'),
    ('La profesora compra 3 cuadernos de 6 soles cada uno y 2 lapiceros de 2 soles cada uno. ¿Cuánto paga en total?',2,
     '3 × 6 = 18 y 2 × 2 = 4; 18 + 4 = 22, por eso paga 22 soles en total.'),

    ('El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?',1,
     'Primero calcula cuántas pelotas hay en total: 4 × 8.'),
    ('El colegio compró 4 cajas con 8 pelotas en cada una y luego regaló 5 pelotas. ¿Cuántas pelotas quedaron?',2,
     '4 × 8 = 32; luego 32 − 5 = 27, por eso quedan 27 pelotas.')
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
-- RESUMEN LOG C.3 INTERMEDIATE (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo311_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo311_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo311_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo312_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo312_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo312_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo321_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo321_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo321_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo331_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo331_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo331_intermediate,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'INTERMEDIATE') AS exercises_lo332_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'INTERMEDIATE') AS hints_lo332_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'INTERMEDIATE') AS steps_lo332_intermediate;
