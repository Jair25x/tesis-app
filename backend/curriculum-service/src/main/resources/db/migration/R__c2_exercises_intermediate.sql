-- ============================================================
-- R__c2_exercises_intermediate.sql
-- C.2 – FACTORES Y MÚLTIPLOS (4.º)
-- Banco de 10 ejercicios INTERMEDIATE:
--   LO.2.1.1 (factores y parejas de factores) – 5 ejercicios
--   LO.2.2.1 (múltiplos y divisibilidad) – 5 ejercicios
-- Todos INTERMEDIATE, con 2 pistas y 2 pasos de solución por ejercicio.
-- Idempotente: usa NOT EXISTS y se apoya en la estructura base
-- definida en R__seed_curriculum_math_4.sql.
-- ============================================================

------------------------------------------------------------
-- S.2.1 – FACTORES DE NÚMEROS NATURALES
-- LO.2.1.1 – Identifica factores y parejas de factores.
------------------------------------------------------------

-- I1 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Lista completa de factores de 18.
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
       '¿Cuál de las siguientes listas muestra todos los factores de 18?',
       'INTERMEDIATE','EQUATION',
       'A) 1, 2, 3, 6, 9, 18',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 1, 2, 3, 6, 9, 18",
            "B) 1, 2, 3, 9, 18",
            "C) 1, 3, 6, 9, 18"
          ],
          "answer": "A) 1, 2, 3, 6, 9, 18"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes listas muestra todos los factores de 18?'
  );

-- I2 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Número con exactamente cuatro factores.
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
       '¿Cuál de estos números tiene exactamente cuatro factores?',
       'INTERMEDIATE','EQUATION',
       'B) 6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5",
            "B) 6",
            "C) 9"
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
      AND e.statement = '¿Cuál de estos números tiene exactamente cuatro factores?'
  );

-- I3 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Pareja de factores de 36.
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
       '¿Cuál de las siguientes parejas de números son factores de 36?',
       'INTERMEDIATE','EQUATION',
       'B) 4 y 9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 y 11",
            "B) 4 y 9",
            "C) 5 y 6"
          ],
          "answer": "B) 4 y 9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes parejas de números son factores de 36?'
  );

-- I4 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Descomposición de 28 en producto de dos factores.
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
       'En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?',
       'INTERMEDIATE','EQUATION',
       'B) 4 y 7',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 2 y 9",
            "B) 4 y 7",
            "C) 3 y 8"
          ],
          "answer": "B) 4 y 7"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?'
  );

-- I5 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Problema de reparto con factores de 24.
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
       'Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?',
       'INTERMEDIATE','EQUATION',
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
      AND e.statement = 'Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?'
  );

------------------------------------------------------------
-- S.2.2 – MÚLTIPLOS Y DIVISIBILIDAD
-- LO.2.2.1 – Reconoce múltiplos y usa criterios de divisibilidad.
------------------------------------------------------------

-- I6 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Múltiplo común de 4 y 6.
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
       '¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?',
       'INTERMEDIATE','EQUATION',
       'B) 24',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 18",
            "B) 24",
            "C) 20"
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
      AND e.statement = '¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?'
  );

-- I7 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Número que NO es múltiplo de 10.
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
       '¿Cuál de los siguientes números NO es múltiplo de 10?',
       'INTERMEDIATE','EQUATION',
       'B) 45',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30",
            "B) 45",
            "C) 50"
          ],
          "answer": "B) 45"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números NO es múltiplo de 10?'
  );

-- I8 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia de múltiplos de 5.
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
       'Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [5, 10, 15, null, 25, 30],
          "rule": "múltiplos de 5",
          "missingIndex": 3,
          "answer": 20
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.'
  );

-- I9 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia descendente restando 5.
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
       'Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [40, 35, 30, 25, null],
          "rule": "restando 5 cada vez",
          "missingIndex": 4,
          "answer": 20
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.'
  );

-- I10 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Problema de divisibilidad con 36 galletas.
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
       'En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?',
       'INTERMEDIATE','EQUATION',
       'B) 9',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5",
            "B) 9",
            "C) 10"
          ],
          "answer": "B) 9"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?'
  );

------------------------------------------------------------
-- HINTS C.2 INTERMEDIATE
-- (2 por ejercicio INTERMEDIATE de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores (INTERMEDIATE)
    ('¿Cuál de las siguientes listas muestra todos los factores de 18?',
     'Recuerda que los factores son números que multiplicados dan como resultado 18.'),
    ('¿Cuál de las siguientes listas muestra todos los factores de 18?',
     'Verifica que cada número de la lista divida exactamente a 18.'),

    ('¿Cuál de estos números tiene exactamente cuatro factores?',
     'Piensa cuántos divisores tiene cada número, empezando por 1 y por el mismo número.'),
    ('¿Cuál de estos números tiene exactamente cuatro factores?',
     'Cuenta cuántos números dividen exactamente a 5, 6 y 9.'),

    ('¿Cuál de las siguientes parejas de números son factores de 36?',
     'Una pareja de factores multiplicada debe dar como resultado 36.'),
    ('¿Cuál de las siguientes parejas de números son factores de 36?',
     'Multiplica cada pareja y elige la que da exactamente 36.'),

    ('En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?',
     'Para que la igualdad sea verdadera, el producto de a y b debe ser 28.'),
    ('En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?',
     'Prueba multiplicar las parejas 2 × 9, 4 × 7 y 3 × 8.'),

    ('Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?',
     'Los tamaños de grupo posibles deben ser divisores de 24.'),
    ('Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?',
     'Prueba dividir 24 entre 5, 6 y 7 y fíjate en qué caso no sobra nada.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad (INTERMEDIATE)
    ('¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?',
     'Un número múltiplo de 4 y de 6 a la vez es múltiplo de 12.'),
    ('¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?',
     'Divide cada número entre 4 y entre 6 y revisa si las divisiones son exactas.'),

    ('¿Cuál de los siguientes números NO es múltiplo de 10?',
     'Los múltiplos de 10 siempre terminan en 0.'),
    ('¿Cuál de los siguientes números NO es múltiplo de 10?',
     'Fíjate en la última cifra de 30, 45 y 50.'),

    ('Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.',
     'Observa de cuánto en cuánto aumenta la secuencia.'),
    ('Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.',
     'Cada término aumenta en la misma cantidad; compara 5, 10 y 15.'),

    ('Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.',
     'Mira cómo cambian los números: 40, 35, 30, 25...'),
    ('Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.',
     'Resta siempre la misma cantidad para encontrar el siguiente número.'),

    ('En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?',
     'La cantidad por bolsa debe dividir exactamente a 36.'),
    ('En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?',
     'Prueba dividir 36 entre 5, 9 y 10 y revisa en qué caso no sobra nada.')
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
-- SOLUTION_STEPS C.2 INTERMEDIATE
-- (2 por ejercicio INTERMEDIATE de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores (INTERMEDIATE)
    ('¿Cuál de las siguientes listas muestra todos los factores de 18?',1,
     'Escribe todos los factores de 18: 1, 2, 3, 6, 9 y 18.'),
    ('¿Cuál de las siguientes listas muestra todos los factores de 18?',2,
     'Compara con las opciones y elige la lista que contiene exactamente esos números.'),

    ('¿Cuál de estos números tiene exactamente cuatro factores?',1,
     'Encuentra los divisores de cada número: 5, 6 y 9.'),
    ('¿Cuál de estos números tiene exactamente cuatro factores?',2,
     '5 tiene 2 factores, 6 tiene 4 factores y 9 tiene 3; por eso el número con cuatro factores es 6.'),

    ('¿Cuál de las siguientes parejas de números son factores de 36?',1,
     'Calcula 3 × 11, 4 × 9 y 5 × 6.'),
    ('¿Cuál de las siguientes parejas de números son factores de 36?',2,
     'Solo 4 × 9 = 36; esa es la pareja de factores de 36.'),

    ('En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?',1,
     'Multiplica las parejas: 2 × 9, 4 × 7 y 3 × 8.'),
    ('En la multiplicación 28 = a × b, ¿cuál de las siguientes parejas puede representar a y b?',2,
     'Solo 4 × 7 = 28; entonces a = 4 y b = 7.'),

    ('Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?',1,
     'Busca qué números dividen a 24 sin dejar residuo.'),
    ('Camila tiene 24 stickers y quiere repartirlos en grupos iguales sin que sobre ninguno. ¿Cuál de estos tamaños de grupo puede usar?',2,
     '24 ÷ 5 y 24 ÷ 7 no son divisiones exactas; 24 ÷ 6 = 4, así que puede usar grupos de 6 stickers.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad (INTERMEDIATE)
    ('¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?',1,
     'Recuerda que un número múltiplo de 4 y de 6 debe ser múltiplo de 12.'),
    ('¿Cuál de los siguientes números es múltiplo de 4 y de 6 a la vez?',2,
     '12 divide exactamente a 24, pero no a 18 ni a 20; por eso el número correcto es 24.'),

    ('¿Cuál de los siguientes números NO es múltiplo de 10?',1,
     'Revisa la última cifra de 30, 45 y 50.'),
    ('¿Cuál de los siguientes números NO es múltiplo de 10?',2,
     '30 y 50 terminan en 0 (múltiplos de 10); 45 no termina en 0, así que no es múltiplo de 10.'),

    ('Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.',1,
     'Calcula las diferencias: 10 − 5 y 15 − 10 para encontrar la regla.'),
    ('Secuencia: 5, 10, 15, __, 25, 30. Escribe el número que falta.',2,
     'La secuencia aumenta de 5 en 5; después de 15 viene 20, luego 25 y 30.'),

    ('Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.',1,
     'Calcula la diferencia entre 40 y 35, y entre 35 y 30.'),
    ('Secuencia: 40, 35, 30, 25, __. Escribe el número que falta.',2,
     'Cada vez restas 5; después de 25 viene 20, así que el número que falta es 20.'),

    ('En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?',1,
     'Divide 36 entre 5, 9 y 10 y observa los resultados.'),
    ('En el recreo, 36 galletas se quieren repartir en bolsas con la misma cantidad y sin que sobre ninguna. ¿Cuál de estas cantidades de galletas por bolsa es posible?',2,
     '36 ÷ 5 y 36 ÷ 10 no son enteros; 36 ÷ 9 = 4, así que 9 galletas por bolsa es una cantidad posible.')
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
-- RESUMEN LOG C.2 INTERMEDIATE (para ver conteos en consola)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS exercises_c2_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS hints_c2_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS steps_c2_intermediate;
