-- ============================================================
-- R__c3_exercises_basic.sql
-- C.3 – CUATRO OPERACIONES CON NÚMEROS NATURALES (4.º)
--
-- LOs cubiertos (solo dificultad BASIC):
--   LO.3.1.1 – Multiplicación por un número de una cifra
--   LO.3.1.2 – Multiplicación por un número de dos cifras
--   LO.3.2.1 – División entre un número de una cifra
--   LO.3.3.1 – Igualdades con operaciones
--   LO.3.3.2 – Resolución de problemas con las cuatro operaciones
--
-- 3 ejercicios BASIC por LO (total: 15 ejercicios).
-- Todos con 2 pistas y 2 pasos de solución.
-- Usa la plantilla EQUATION_SINGLE_CHOICE (ya definida en InMemoryTemplateService).
-- Idempotente: usa NOT EXISTS y se apoya en LOs ya sembrados.
-- ============================================================

------------------------------------------------------------
-- LO.3.1.1 – Multiplicación por un número de una cifra
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B1 — 3 × 4
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
       '¿Cuánto es 3 × 4?',
       'BASIC','EQUATION',
       'C) 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 10",
            "B) 11",
            "C) 12"
          ],
          "answer": "C) 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 3 × 4?'
  );

-- B2 — problema simple 5 × 3
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
       'En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?',
       'BASIC','EQUATION',
       'C) 15',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8",
            "B) 12",
            "C) 15"
          ],
          "answer": "C) 15"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?'
  );

-- B3 — 7 × 2
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
       '¿Cuál es el resultado de 7 × 2?',
       'BASIC','EQUATION',
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
      AND e.statement = '¿Cuál es el resultado de 7 × 2?'
  );

------------------------------------------------------------
-- LO.3.1.2 – Multiplicación por un número de dos cifras
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B4 — 12 × 3
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
       '¿Cuánto es 12 × 3?',
       'BASIC','EQUATION',
       'C) 36',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 24",
            "B) 30",
            "C) 36"
          ],
          "answer": "C) 36"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 12 × 3?'
  );

-- B5 — problema con 10 × 4
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
       'Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?',
       'BASIC','EQUATION',
       'C) 40',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 14",
            "B) 24",
            "C) 40"
          ],
          "answer": "C) 40"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?'
  );

-- B6 — 15 × 2
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
       '¿Cuál es el resultado de 15 × 2?',
       'BASIC','EQUATION',
       'C) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 20",
            "B) 25",
            "C) 30"
          ],
          "answer": "C) 30"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 15 × 2?'
  );

------------------------------------------------------------
-- LO.3.2.1 – División entre un número de una cifra
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B7 — 12 ÷ 3
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
       '¿Cuánto es 12 ÷ 3?',
       'BASIC','EQUATION',
       'B) 4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3",
            "B) 4",
            "C) 5"
          ],
          "answer": "B) 4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 12 ÷ 3?'
  );

-- B8 — problema 20 ÷ 4
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
       'En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?',
       'BASIC','EQUATION',
       'B) 5',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4",
            "B) 5",
            "C) 6"
          ],
          "answer": "B) 5"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?'
  );

-- B9 — 18 ÷ 2
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
       '¿Cuál es el resultado de 18 ÷ 2?',
       'BASIC','EQUATION',
       'C) 9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7",
            "B) 8",
            "C) 9"
          ],
          "answer": "C) 9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 18 ÷ 2?'
  );

------------------------------------------------------------
-- LO.3.3.1 – Igualdades con operaciones
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B10 — igualdad correcta 3 × 4
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
       '¿Cuál de las siguientes igualdades es correcta?',
       'BASIC','EQUATION',
       'B) 3 × 4 = 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 × 4 = 10",
            "B) 3 × 4 = 12",
            "C) 3 × 4 = 14"
          ],
          "answer": "B) 3 × 4 = 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades es correcta?'
  );

-- B11 — igualdad equivalente a 4 × 5
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
       '¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?',
       'BASIC','EQUATION',
       'B) 4 + 4 + 4 + 4 + 4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5 + 5 + 5",
            "B) 4 + 4 + 4 + 4 + 4",
            "C) 2 + 2 + 2 + 2"
          ],
          "answer": "B) 4 + 4 + 4 + 4 + 4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?'
  );

-- B12 — verificar 16 ÷ 4 = 4 con multiplicación
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
       '¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?',
       'BASIC','EQUATION',
       'A) 4 × 4 = 16',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 × 4 = 16",
            "B) 4 + 4 = 16",
            "C) 16 − 4 = 4"
          ],
          "answer": "A) 4 × 4 = 16"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?'
  );

------------------------------------------------------------
-- LO.3.3.2 – Resolución de problemas con las cuatro operaciones
-- 3 ejercicios BASIC
------------------------------------------------------------

-- B13 — problema suma 12 + 5
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
       'En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?',
       'BASIC','EQUATION',
       'C) 17 canicas',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 15 canicas",
            "B) 16 canicas",
            "C) 17 canicas"
          ],
          "answer": "C) 17 canicas"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?'
  );

-- B14 — problema 24 ÷ 3
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
       'En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?',
       'BASIC','EQUATION',
       'B) 8 estudiantes',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 estudiantes",
            "B) 8 estudiantes",
            "C) 9 estudiantes"
          ],
          "answer": "B) 8 estudiantes"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?'
  );

-- B15 — problema 4 × 6 luego ÷ 3
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
       'La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?',
       'BASIC','EQUATION',
       'C) 8 stickers',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 stickers",
            "B) 6 stickers",
            "C) 8 stickers"
          ],
          "answer": "C) 8 stickers"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?'
  );

------------------------------------------------------------
-- HINTS C.3 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 3 × 4?',
     'Piensa en 3 grupos de 4 objetos y cuenta cuántos hay en total.'),
    ('¿Cuánto es 3 × 4?',
     'Puedes sumar 4 + 4 + 4 para encontrar el resultado de 3 × 4.'),

    ('En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?',
     'Imagina 3 cajas con 5 cuadernos cada una.'),
    ('En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?',
     'Multiplica 5 × 3 o suma 5 + 5 + 5 para hallar el total.'),

    ('¿Cuál es el resultado de 7 × 2?',
     'Piensa en 2 grupos de 7 o 7 grupos de 2.'),
    ('¿Cuál es el resultado de 7 × 2?',
     'Puedes sumar 7 + 7 para encontrar el resultado.'),

    -- LO.3.1.2
    ('¿Cuánto es 12 × 3?',
     'Piensa en 3 grupos de 12 o en 12 + 12 + 12.'),
    ('¿Cuánto es 12 × 3?',
     'Primero suma 12 + 12 y luego vuelve a sumar 12.'),

    ('Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?',
     'Cada caja tiene 10 lapiceros; usa la multiplicación 10 × 4.'),
    ('Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?',
     'Recuerda que 10 × 4 es como sumar 10 cuatro veces.'),

    ('¿Cuál es el resultado de 15 × 2?',
     'Puedes sumar 15 + 15 para encontrar el resultado.'),
    ('¿Cuál es el resultado de 15 × 2?',
     'Piensa en doblar la cantidad: el doble de 15.'),

    -- LO.3.2.1
    ('¿Cuánto es 12 ÷ 3?',
     'Divide 12 en 3 grupos iguales y observa cuántos elementos hay en cada grupo.'),
    ('¿Cuánto es 12 ÷ 3?',
     'Piensa qué número multiplicado por 3 da 12.'),

    ('En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?',
     'Debes repartir 20 en 4 partes iguales.'),
    ('En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?',
     'Piensa en la división 20 ÷ 4.'),

    ('¿Cuál es el resultado de 18 ÷ 2?',
     'Divide 18 en 2 grupos iguales para saber cuánto hay en cada grupo.'),
    ('¿Cuál es el resultado de 18 ÷ 2?',
     'Piensa qué número multiplicado por 2 da 18.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es correcta?',
     'Calcula 3 × 4 y compara el resultado con los de cada igualdad.'),
    ('¿Cuál de las siguientes igualdades es correcta?',
     'Solo una de las igualdades tiene el resultado correcto de 3 × 4.'),

    ('¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?',
     'Primero calcula 4 × 5 y encuentra a qué número es igual.'),
    ('¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?',
     'Compara 4 × 5 con las sumas repetidas y busca la que también da 20.'),

    ('¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?',
     'Para verificar una división puedes usar la multiplicación relacionada.'),
    ('¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?',
     'Piensa qué operación multiplicación muestra que 4 veces un número da 16.'),

    -- LO.3.3.2
    ('En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?',
     'Cuando gana canicas, la cantidad aumenta; debes sumar.'),
    ('En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?',
     'Suma 12 + 5 para obtener la nueva cantidad.'),

    ('En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?',
     'Debes repartir 24 estudiantes en 3 grupos iguales.'),
    ('En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?',
     'Piensa en la división 24 ÷ 3.'),

    ('La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?',
     'Primero encuentra cuántos stickers hay en total.'),
    ('La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?',
     'Calcula 4 × 6 y luego divide ese resultado entre 3.')
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
-- SOLUTION_STEPS C.3 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 3 × 4?',1,
     'Forma 3 grupos con 4 elementos en cada uno o suma 4 + 4 + 4.'),
    ('¿Cuánto es 3 × 4?',2,
     '4 + 4 + 4 = 12, por eso 3 × 4 = 12.'),

    ('En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?',1,
     'Piensa cuántos cuadernos hay en total si cada caja tiene 5 cuadernos y hay 3 cajas: 5 × 3.'),
    ('En una caja hay 5 cuadernos y María tiene 3 cajas. ¿Cuántos cuadernos tiene en total?',2,
     '5 × 3 = 15, por lo tanto María tiene 15 cuadernos.'),

    ('¿Cuál es el resultado de 7 × 2?',1,
     'Suma 7 + 7 para encontrar el resultado.'),
    ('¿Cuál es el resultado de 7 × 2?',2,
     '7 + 7 = 14, por eso 7 × 2 = 14.'),

    -- LO.3.1.2
    ('¿Cuánto es 12 × 3?',1,
     'Suma 12 + 12 para obtener 24 y luego suma 12 una vez más.'),
    ('¿Cuánto es 12 × 3?',2,
     '12 + 12 + 12 = 36, por eso 12 × 3 = 36.'),

    ('Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?',1,
     'Calcula 10 × 4 o suma 10 + 10 + 10 + 10.'),
    ('Una caja tiene 10 lapiceros. Si la profesora compra 4 cajas, ¿cuántos lapiceros compra en total?',2,
     '10 × 4 = 40, por lo tanto compra 40 lapiceros.'),

    ('¿Cuál es el resultado de 15 × 2?',1,
     'Dobla la cantidad: suma 15 + 15.'),
    ('¿Cuál es el resultado de 15 × 2?',2,
     '15 + 15 = 30, así que 15 × 2 = 30.'),

    -- LO.3.2.1
    ('¿Cuánto es 12 ÷ 3?',1,
     'Piensa qué número multiplicado por 3 da 12.'),
    ('¿Cuánto es 12 ÷ 3?',2,
     '4 × 3 = 12, por eso 12 ÷ 3 = 4.'),

    ('En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?',1,
     'Plantea la división 20 ÷ 4.'),
    ('En una bolsa hay 20 caramelos que se reparten en partes iguales entre 4 niñas. ¿Cuántos caramelos recibe cada una?',2,
     '20 ÷ 4 = 5, por eso cada niña recibe 5 caramelos.'),

    ('¿Cuál es el resultado de 18 ÷ 2?',1,
     'Piensa qué número multiplicado por 2 da 18.'),
    ('¿Cuál es el resultado de 18 ÷ 2?',2,
     '9 × 2 = 18, por eso 18 ÷ 2 = 9.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es correcta?',1,
     'Calcula 3 × 4 y compáralo con 10, 12 y 14.'),
    ('¿Cuál de las siguientes igualdades es correcta?',2,
     '3 × 4 = 12, por eso la igualdad correcta es 3 × 4 = 12.'),

    ('¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?',1,
     'Calcula 4 × 5 y luego el resultado de cada suma repetida.'),
    ('¿Cuál de las siguientes igualdades tiene el mismo resultado que 4 × 5?',2,
     '4 × 5 = 20 y 4 + 4 + 4 + 4 + 4 también es 20; esa igualdad tiene el mismo resultado.'),

    ('¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?',1,
     'Para verificar la división, multiplica el cociente por el divisor y revisa si da 16.'),
    ('¿Cuál de las siguientes igualdades sirve para verificar que 16 ÷ 4 = 4?',2,
     '4 × 4 = 16, por eso esa igualdad verifica que 16 ÷ 4 = 4.'),

    -- LO.3.3.2
    ('En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?',1,
     'Suma las canicas que tenía con las que ganó: 12 + 5.'),
    ('En el recreo, Ana tenía 12 canicas y ganó 5 más en un juego. ¿Cuántas canicas tiene ahora?',2,
     '12 + 5 = 17, por eso ahora tiene 17 canicas.'),

    ('En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?',1,
     'Plantea la división 24 ÷ 3.'),
    ('En un salón hay 24 estudiantes. Si se forman 3 grupos con la misma cantidad de estudiantes, ¿cuántos estudiantes hay en cada grupo?',2,
     '24 ÷ 3 = 8, por eso en cada grupo hay 8 estudiantes.'),

    ('La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?',1,
     'Primero calcula cuántos stickers hay en total: 4 × 6.'),
    ('La profesora compró 4 paquetes de stickers con 6 stickers en cada paquete. Si reparte en partes iguales los stickers entre 3 niñas, ¿cuántos stickers recibe cada una?',2,
     '4 × 6 = 24 y 24 ÷ 3 = 8, por eso cada niña recibe 8 stickers.')
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
-- RESUMEN LOG C.3 BASIC (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'BASIC') AS exercises_lo311_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'BASIC') AS hints_lo311_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'BASIC') AS steps_lo311_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'BASIC') AS exercises_lo312_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'BASIC') AS hints_lo312_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'BASIC') AS steps_lo312_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'BASIC') AS exercises_lo321_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'BASIC') AS hints_lo321_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'BASIC') AS steps_lo321_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'BASIC') AS exercises_lo331_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'BASIC') AS hints_lo331_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'BASIC') AS steps_lo331_basic,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'BASIC') AS exercises_lo332_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'BASIC') AS hints_lo332_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'BASIC') AS steps_lo332_basic;
