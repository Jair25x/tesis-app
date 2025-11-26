-- ============================================================
-- R__c3_exercises_advanced.sql
-- C.3 – CUATRO OPERACIONES CON NÚMEROS NATURALES (4.º)
--
-- Nivel: ADVANCED
-- LOs cubiertos:
--   LO.3.1.1 – Multiplicación por un número de una cifra
--   LO.3.1.2 – Multiplicación por un número de dos cifras
--   LO.3.2.1 – División entre un número de una cifra
--   LO.3.3.1 – Igualdades con operaciones
--   LO.3.3.2 – Resolución de problemas con las cuatro operaciones
--
-- 3 ejercicios ADVANCED por LO (total: 15).
-- Todos usan la plantilla EQUATION_SINGLE_CHOICE.
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.3.1.1 – Multiplicación por un número de una cifra
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- A1 — 38 × 7
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
       '¿Cuánto es 38 × 7?',
       'ADVANCED','EQUATION',
       'B) 266',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 248",
            "B) 266",
            "C) 276"
          ],
          "answer": "B) 266"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 38 × 7?'
  );

-- A2 — problema 9 × 8
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
       'En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?',
       'ADVANCED','EQUATION',
       'A) 72 marcadores',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 72 marcadores",
            "B) 64 marcadores",
            "C) 81 marcadores"
          ],
          "answer": "A) 72 marcadores"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?'
  );

-- A3 — 46 × 5
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
       '¿Cuál es el resultado de 46 × 5?',
       'ADVANCED','EQUATION',
       'B) 230',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 220",
            "B) 230",
            "C) 240"
          ],
          "answer": "B) 230"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 46 × 5?'
  );

------------------------------------------------------------
-- LO.3.1.2 – Multiplicación por un número de dos cifras
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- A4 — 15 × 12
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
       '¿Cuánto es 15 × 12?',
       'ADVANCED','EQUATION',
       'B) 180',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 175",
            "B) 180",
            "C) 185"
          ],
          "answer": "B) 180"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 15 × 12?'
  );

-- A5 — problema 24 × 12
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
       'Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?',
       'ADVANCED','EQUATION',
       'C) 288 galletas',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 248 galletas",
            "B) 260 galletas",
            "C) 288 galletas"
          ],
          "answer": "C) 288 galletas"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?'
  );

-- A6 — 27 × 14
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
       '¿Cuál es el resultado de 27 × 14?',
       'ADVANCED','EQUATION',
       'A) 378',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 378",
            "B) 368",
            "C) 388"
          ],
          "answer": "A) 378"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 27 × 14?'
  );

------------------------------------------------------------
-- LO.3.2.1 – División entre un número de una cifra
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- A7 — 96 ÷ 8
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
       '¿Cuánto es 96 ÷ 8?',
       'ADVANCED','EQUATION',
       'B) 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 11",
            "B) 12",
            "C) 14"
          ],
          "answer": "B) 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuánto es 96 ÷ 8?'
  );

-- A8 — problema 72 ÷ 8
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
       'En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?',
       'ADVANCED','EQUATION',
       'B) 9 cuadernos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 cuadernos",
            "B) 9 cuadernos",
            "C) 10 cuadernos"
          ],
          "answer": "B) 9 cuadernos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?'
  );

-- A9 — 84 ÷ 7
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
       '¿Cuál es el resultado de 84 ÷ 7?',
       'ADVANCED','EQUATION',
       'B) 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 11",
            "B) 12",
            "C) 13"
          ],
          "answer": "B) 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es el resultado de 84 ÷ 7?'
  );

------------------------------------------------------------
-- LO.3.3.1 – Igualdades con operaciones
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- A10 — igualdad correcta suma/multiplicación
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
       'ADVANCED','EQUATION',
       'B) 3 × 9 = 18 + 9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 × 4 = 6 + 4",
            "B) 3 × 9 = 18 + 9",
            "C) 5 × 5 = 5 + 10"
          ],
          "answer": "B) 3 × 9 = 18 + 9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades es correcta?'
  );

-- A11 — distributiva 4 × (5 + 3)
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
       '¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?',
       'ADVANCED','EQUATION',
       'B) 4 × 5 + 4 × 3',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 × 5 + 3",
            "B) 4 × 5 + 4 × 3",
            "C) 5 × 4 + 5"
          ],
          "answer": "B) 4 × 5 + 4 × 3"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?'
  );

-- A12 — verificar 48 ÷ 6 = 8
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
       '¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?',
       'ADVANCED','EQUATION',
       'A) 6 × 8 = 48',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 × 8 = 48",
            "B) 8 + 6 = 48",
            "C) 48 − 8 = 6"
          ],
          "answer": "A) 6 × 8 = 48"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?'
  );

------------------------------------------------------------
-- LO.3.3.2 – Resolución de problemas con las cuatro operaciones
-- 3 ejercicios ADVANCED
------------------------------------------------------------

-- A13 — 3 × 28 − 16
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
       'En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?',
       'ADVANCED','EQUATION',
       'A) 68 estudiantes',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 68 estudiantes",
            "B) 70 estudiantes",
            "C) 72 estudiantes"
          ],
          "answer": "A) 68 estudiantes"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?'
  );

-- A14 — 5 × 12 + 18
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
       'En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?',
       'ADVANCED','EQUATION',
       'B) 78 cuadernos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 72 cuadernos",
            "B) 78 cuadernos",
            "C) 80 cuadernos"
          ],
          "answer": "B) 78 cuadernos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?'
  );

-- A15 — 128 − 10 × 8
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
       'En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?',
       'ADVANCED','EQUATION',
       'C) 48 cuadernos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 28 cuadernos",
            "B) 38 cuadernos",
            "C) 48 cuadernos"
          ],
          "answer": "C) 48 cuadernos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?'
  );

------------------------------------------------------------
-- HINTS C.3 ADVANCED (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 38 × 7?',
     'Descompón 38 en 30 y 8 para multiplicar cada parte por 7.'),
    ('¿Cuánto es 38 × 7?',
     'Calcula 30 × 7 y 8 × 7 y luego suma los resultados.'),

    ('En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?',
     'Piensa en 8 grupos de 9 marcadores.'),
    ('En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?',
     'Usa la multiplicación 9 × 8 para encontrar el total.'),

    ('¿Cuál es el resultado de 46 × 5?',
     'Recuerda que multiplicar por 5 es como multiplicar por 10 y dividir entre 2.'),
    ('¿Cuál es el resultado de 46 × 5?',
     'Puedes calcular 50 × 5 y luego restar 4 × 5 para ajustar.'),

    -- LO.3.1.2
    ('¿Cuánto es 15 × 12?',
     'Descompón 12 en 10 y 2 para multiplicar 15 por cada parte.'),
    ('¿Cuánto es 15 × 12?',
     'Calcula 15 × 10 y 15 × 2 y luego suma los resultados.'),

    ('Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?',
     'Plantea la multiplicación 24 × 12 para hallar el total.'),
    ('Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?',
     'Piensa en 24 × 10 y 24 × 2 y suma ambos productos.'),

    ('¿Cuál es el resultado de 27 × 14?',
     'Descompón 14 en 10 y 4 para multiplicar 27 por cada parte.'),
    ('¿Cuál es el resultado de 27 × 14?',
     'Calcula 27 × 10 y 27 × 4 por separado y luego suma.'),

    -- LO.3.2.1
    ('¿Cuánto es 96 ÷ 8?',
     'Piensa qué número multiplicado por 8 da 96.'),
    ('¿Cuánto es 96 ÷ 8?',
     'Puedes usar 8 × 10 = 80 y ver cuánto falta para llegar a 96.'),

    ('En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?',
     'Plantea la división 72 ÷ 8.'),
    ('En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?',
     'Busca un número que al multiplicarlo por 8 dé 72.'),

    ('¿Cuál es el resultado de 84 ÷ 7?',
     'Piensa en la tabla del 7 y busca el número que da 84.'),
    ('¿Cuál es el resultado de 84 ÷ 7?',
     'Puedes usar 7 × 10 y sumar más veces 7 hasta llegar a 84.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es correcta?',
     'Calcula el resultado de cada lado de las igualdades y compáralos.'),
    ('¿Cuál de las siguientes igualdades es correcta?',
     'Revisa si la multiplicación y la suma dan el mismo resultado.'),

    ('¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?',
     'Primero resuelve 5 + 3 y luego multiplica por 4.'),
    ('¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?',
     'Compara el resultado con las expresiones dadas para ver cuál coincide.'),

    ('¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?',
     'Recuerda que puedes comprobar una división con la multiplicación.'),
    ('¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?',
     'Multiplica el cociente y el divisor y revisa si obtienes 48.'),

    -- LO.3.3.2
    ('En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?',
     'Primero calcula cuántos estudiantes iban a viajar en total con los 3 buses.'),
    ('En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?',
     'Usa una multiplicación y luego una resta para considerar a las estudiantes que no pudieron ir.'),

    ('En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?',
     'Calcula primero cuántos cuadernos hay en los paquetes.'),
    ('En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?',
     'Usa una multiplicación para los paquetes y luego suma los cuadernos sueltos.'),

    ('En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?',
     'Calcula cuántos cuadernos se entregan en total a los 10 colegios.'),
    ('En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?',
     'Después de hallar cuántos cuadernos se entregan, réstalos de 128 para saber cuántos quedan.')
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
-- SOLUTION_STEPS C.3 ADVANCED (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.3.1.1','LO.3.1.2','LO.3.2.1','LO.3.3.1','LO.3.3.2')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.3.1.1
    ('¿Cuánto es 38 × 7?',1,
     'Descompón 38 en 30 y 8 para multiplicar 7 por cada parte.'),
    ('¿Cuánto es 38 × 7?',2,
     '30 × 7 = 210 y 8 × 7 = 56; 210 + 56 = 266, por eso 38 × 7 = 266.'),

    ('En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?',1,
     'Plantea la multiplicación 9 × 8, porque hay 8 cajas con 9 marcadores cada una.'),
    ('En cada caja hay 9 marcadores y hay 8 cajas iguales. ¿Cuántos marcadores hay en total?',2,
     '9 × 8 = 72, por eso hay 72 marcadores en total.'),

    ('¿Cuál es el resultado de 46 × 5?',1,
     'Puedes calcular 46 × 10 = 460 y luego dividir el resultado entre 2.'),
    ('¿Cuál es el resultado de 46 × 5?',2,
     '460 ÷ 2 = 230, así que 46 × 5 = 230.'),

    -- LO.3.1.2
    ('¿Cuánto es 15 × 12?',1,
     'Descompón 12 en 10 y 2 y multiplica 15 por cada parte: 15 × 10 y 15 × 2.'),
    ('¿Cuánto es 15 × 12?',2,
     '15 × 10 = 150 y 15 × 2 = 30; 150 + 30 = 180, por eso 15 × 12 = 180.'),

    ('Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?',1,
     'Plantea la multiplicación 24 × 12 para hallar el número total de galletas.'),
    ('Una caja contiene 24 galletas. Si se compran 12 cajas iguales, ¿cuántas galletas hay en total?',2,
     '24 × 12 = 24 × (10 + 2) = 24 × 10 + 24 × 2 = 240 + 48 = 288 galletas.'),

    ('¿Cuál es el resultado de 27 × 14?',1,
     'Descompón 14 en 10 y 4: calcula 27 × 10 y 27 × 4.'),
    ('¿Cuál es el resultado de 27 × 14?',2,
     '27 × 10 = 270 y 27 × 4 = 108; 270 + 108 = 378, por eso 27 × 14 = 378.'),

    -- LO.3.2.1
    ('¿Cuánto es 96 ÷ 8?',1,
     'Busca un número que multiplicado por 8 dé 96.'),
    ('¿Cuánto es 96 ÷ 8?',2,
     '8 × 10 = 80 y 8 × 2 = 16; 80 + 16 = 96, así que 96 ÷ 8 = 12.'),

    ('En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?',1,
     'Plantea la división 72 ÷ 8 para repartir en partes iguales.'),
    ('En el aula hay 72 cuadernos que se repartirán en partes iguales entre 8 estudiantes. ¿Cuántos cuadernos recibe cada una?',2,
     '8 × 9 = 72, por eso 72 ÷ 8 = 9 y cada estudiante recibe 9 cuadernos.'),

    ('¿Cuál es el resultado de 84 ÷ 7?',1,
     'Piensa en cuántas veces cabe 7 en 84 usando la tabla del 7.'),
    ('¿Cuál es el resultado de 84 ÷ 7?',2,
     '7 × 12 = 84, por eso 84 ÷ 7 = 12.'),

    -- LO.3.3.1
    ('¿Cuál de las siguientes igualdades es correcta?',1,
     'Calcula el resultado de 6 × 4, 6 + 4, 3 × 9, 18 + 9, 5 × 5 y 5 + 10.'),
    ('¿Cuál de las siguientes igualdades es correcta?',2,
     '6 × 4 = 24 y 6 + 4 = 10 (no son iguales); 3 × 9 = 27 y 18 + 9 = 27 (son iguales); 5 × 5 = 25 y 5 + 10 = 15 (no son iguales). La igualdad correcta es 3 × 9 = 18 + 9.'),

    ('¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?',1,
     'Resuelve primero el paréntesis: 5 + 3 y luego multiplica por 4.'),
    ('¿Cuál de las siguientes expresiones tiene el mismo valor que 4 × (5 + 3)?',2,
     '5 + 3 = 8 y 4 × 8 = 32; 4 × 5 + 4 × 3 = 20 + 12 = 32, por eso esa expresión tiene el mismo valor.'),

    ('¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?',1,
     'Para comprobar una división, multiplica el cociente por el divisor.'),
    ('¿Cuál de las siguientes igualdades es una forma correcta de comprobar que 48 ÷ 6 = 8?',2,
     '8 × 6 = 48, que es lo mismo que 6 × 8 = 48, por eso esa igualdad comprueba que 48 ÷ 6 = 8.'),

    -- LO.3.3.2
    ('En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?',1,
     'Primero calcula cuántas estudiantes iban en los 3 buses: 3 × 28.'),
    ('En una excursión viajan 3 buses con 28 estudiantes en cada uno. Si 16 estudiantes no pudieron ir al final, ¿cuántos estudiantes viajaron?',2,
     '3 × 28 = 84; como 16 no pudieron ir, 84 − 16 = 68, por eso viajaron 68 estudiantes.'),

    ('En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?',1,
     'Primero calcula cuántos cuadernos hay en los 5 paquetes: 5 × 12.'),
    ('En una librería se vendieron 5 paquetes con 12 cuadernos cada uno y además 18 cuadernos sueltos. ¿Cuántos cuadernos se vendieron en total?',2,
     '5 × 12 = 60 y luego 60 + 18 = 78, por eso se vendieron 78 cuadernos.'),

    ('En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?',1,
     'Calcula cuántos cuadernos se entregan: 10 paquetes de 8 cuadernos cada uno.'),
    ('En una campaña de donación se recolectaron 128 cuadernos. Se arman paquetes de 8 cuadernos para cada colegio. Si se entregan paquetes a 10 colegios, ¿cuántos cuadernos quedan sin entregar?',2,
     '10 × 8 = 80 cuadernos entregados; 128 − 80 = 48, por eso quedan 48 cuadernos sin entregar.')
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
-- RESUMEN LOG C.3 ADVANCED (por LO)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo311_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo311_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo311_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'ADVANCED') AS exercises_lo312_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'ADVANCED') AS hints_lo312_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.1.2'
     AND e.difficulty = 'ADVANCED') AS steps_lo312_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo321_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo321_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.2.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo321_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'ADVANCED') AS exercises_lo331_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'ADVANCED') AS hints_lo331_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.1'
     AND e.difficulty = 'ADVANCED') AS steps_lo331_advanced,

  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'ADVANCED') AS exercises_lo332_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'ADVANCED') AS hints_lo332_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code = 'LO.3.3.2'
     AND e.difficulty = 'ADVANCED') AS steps_lo332_advanced;
