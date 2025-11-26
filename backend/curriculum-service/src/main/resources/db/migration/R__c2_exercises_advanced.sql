-- ============================================================
-- R__c2_exercises_advanced.sql
-- C.2 – FACTORES Y MÚLTIPLOS (4.º)
-- Banco de 10 ejercicios ADVANCED:
--   LO.2.1.1 (factores y parejas de factores) – 5 ejercicios
--   LO.2.2.1 (múltiplos y divisibilidad) – 5 ejercicios
-- Todos ADVANCED, con 2 pistas y 2 pasos de solución por ejercicio.
-- Idempotente: usa NOT EXISTS y se apoya en la estructura base
-- definida en R__seed_curriculum_math_4.sql.
-- ============================================================

------------------------------------------------------------
-- S.2.1 – FACTORES DE NÚMEROS NATURALES
-- LO.2.1.1 – Identifica factores y parejas de factores (nivel avanzado).
------------------------------------------------------------

-- A1 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Factor común de 18 y 24.
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
       '¿Cuál de los siguientes números es un factor común de 18 y 24?',
       'ADVANCED','EQUATION',
       'B) 6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4",
            "B) 6",
            "C) 8"
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
      AND e.statement = '¿Cuál de los siguientes números es un factor común de 18 y 24?'
  );

-- A2 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Número con exactamente tres factores.
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
       '¿Cuál de estos números tiene exactamente tres factores?',
       'ADVANCED','EQUATION',
       'A) 4',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4",
            "B) 6",
            "C) 8"
          ],
          "answer": "A) 4"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de estos números tiene exactamente tres factores?'
  );

-- A3 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Reparto en bolsas iguales (factores de 24).
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
       'Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?',
       'ADVANCED','EQUATION',
       'B) 6 caramelos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 5 caramelos",
            "B) 6 caramelos",
            "C) 7 caramelos"
          ],
          "answer": "B) 6 caramelos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?'
  );

-- A4 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Número que no es factor de 36.
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
       '¿Cuál de los siguientes números NO es factor de 36?',
       'ADVANCED','EQUATION',
       'C) 8',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3",
            "B) 4",
            "C) 8"
          ],
          "answer": "C) 8"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números NO es factor de 36?'
  );

-- A5 — LO.2.1.1 (EQUATION_SINGLE_CHOICE)
-- Pareja de factores cuyo producto es 30.
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
       'El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?',
       'ADVANCED','EQUATION',
       'B) 5 y 6',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 y 8",
            "B) 5 y 6",
            "C) 2 y 9"
          ],
          "answer": "B) 5 y 6"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?'
  );

------------------------------------------------------------
-- S.2.2 – MÚLTIPLOS Y DIVISIBILIDAD
-- LO.2.2.1 – Reconoce múltiplos y usa criterios de divisibilidad (nivel avanzado).
------------------------------------------------------------

-- A6 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Múltiplo común de 3 y 4.
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
       '¿Cuál de los siguientes números es un múltiplo común de 3 y 4?',
       'ADVANCED','EQUATION',
       'B) 12',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 9",
            "B) 12",
            "C) 15"
          ],
          "answer": "B) 12"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es un múltiplo común de 3 y 4?'
  );

-- A7 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia de múltiplos de 15.
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
       'Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.',
       'ADVANCED','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [15, 30, 45, null, 75],
          "rule": "múltiplos de 15",
          "missingIndex": 3,
          "answer": 60
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.'
  );

-- A8 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Número divisible por 3 y por 5.
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
       '¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?',
       'ADVANCED','EQUATION',
       'B) 30',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 24",
            "B) 30",
            "C) 40"
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
      AND e.statement = '¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?'
  );

-- A9 — LO.2.2.1 (EQUATION_SINGLE_CHOICE)
-- Grupos iguales como múltiplos/división exacta.
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
       'Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?',
       'ADVANCED','EQUATION',
       'C) 9 grupos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 grupos",
            "B) 8 grupos",
            "C) 9 grupos"
          ],
          "answer": "C) 9 grupos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?'
  );

-- A10 — LO.2.2.1 (NUMBER_SEQUENCE_QA)
-- Secuencia de múltiplos de 9.
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
       'Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.',
       'ADVANCED','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [9, 18, 27, null, 45, 54],
          "rule": "múltiplos de 9",
          "missingIndex": 3,
          "answer": 36
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.'
  );

------------------------------------------------------------
-- HINTS C.2 (2 por ejercicio ADVANCED de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores (ADVANCED)
    ('¿Cuál de los siguientes números es un factor común de 18 y 24?',
     'Un factor común divide exactamente a 18 y también a 24.'),
    ('¿Cuál de los siguientes números es un factor común de 18 y 24?',
     'Prueba dividir 18 y 24 entre cada opción y verifica en cuáles la división es exacta.'),

    ('¿Cuál de estos números tiene exactamente tres factores?',
     'Enumera los factores de cada número y cuenta cuántos tiene.'),
    ('¿Cuál de estos números tiene exactamente tres factores?',
     'Busca el número que tiene como factores solo 1, un número primo y su cuadrado.'),

    ('Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?',
     'La cantidad en cada bolsa debe ser un divisor de 24.'),
    ('Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?',
     'Divide 24 entre 5, 6 y 7 y revisa en qué caso la división es exacta.'),

    ('¿Cuál de los siguientes números NO es factor de 36?',
     'Un factor de 36 debe dividir a 36 sin dejar residuo.'),
    ('¿Cuál de los siguientes números NO es factor de 36?',
     'Divide 36 entre 3, 4 y 8 y observa en cuál caso no obtienes un número entero.'),

    ('El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?',
     'Multiplica cada pareja y comprueba cuál da como resultado 30.'),
    ('El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?',
     'Además de dar 30 como producto, cada uno de los números debe dividir a 30 sin dejar residuo.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad (ADVANCED)
    ('¿Cuál de los siguientes números es un múltiplo común de 3 y 4?',
     'Un múltiplo común debe estar en la tabla del 3 y también en la tabla del 4.'),
    ('¿Cuál de los siguientes números es un múltiplo común de 3 y 4?',
     'Verifica si cada opción es divisible por 3 y por 4 al mismo tiempo.'),

    ('Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.',
     'Observa cuánto aumenta la secuencia de un término a otro.'),
    ('Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.',
     'Los números son múltiplos de 15; piensa qué múltiplo viene después de 45.'),

    ('¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?',
     'Divisible por 3: la suma de sus cifras debe ser múltiplo de 3.'),
    ('¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?',
     'Además debe terminar en 0 o en 5 para ser divisible por 5.'),

    ('Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?',
     'Piensa cuántas veces cabe el 4 en 36.'),
    ('Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?',
     'Calcula 36 ÷ 4 para hallar la cantidad de grupos.'),

    ('Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.',
     'Observa la diferencia entre 9, 18 y 27.'),
    ('Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.',
     'La secuencia avanza de 9 en 9; sigue el mismo patrón para encontrar el número que falta.')
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
-- SOLUTION_STEPS C.2 (2 por ejercicio ADVANCED de LO.2.1.1 y LO.2.2.1)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.2.1.1 – Factores (ADVANCED)
    ('¿Cuál de los siguientes números es un factor común de 18 y 24?',1,
     'Divide 18 entre 4, 6 y 8 y observa en qué casos la división es exacta.'),
    ('¿Cuál de los siguientes números es un factor común de 18 y 24?',2,
     'Solo 18 ÷ 6 y 24 ÷ 6 dan resultado entero; por eso 6 es factor común de 18 y 24.'),

    ('¿Cuál de estos números tiene exactamente tres factores?',1,
     'Escribe los factores de 4, 6 y 8. Por ejemplo, 4 tiene como factores 1, 2 y 4.'),
    ('¿Cuál de estos números tiene exactamente tres factores?',2,
     '4 tiene exactamente tres factores (1, 2 y 4); los demás tienen más factores.'),

    ('Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?',1,
     'Calcula 24 ÷ 5, 24 ÷ 6 y 24 ÷ 7 para ver cuándo la división es exacta.'),
    ('Ana tiene 24 caramelos y quiere repartirlos en bolsas con la misma cantidad en cada una, sin que sobre ninguno. ¿Cuál de las siguientes cantidades podría poner en cada bolsa?',2,
     '24 ÷ 6 = 4 es una división exacta; por eso 6 caramelos por bolsa es una opción posible.'),

    ('¿Cuál de los siguientes números NO es factor de 36?',1,
     'Divide 36 entre 3, 4 y 8 y revisa cuál no da un número entero.'),
    ('¿Cuál de los siguientes números NO es factor de 36?',2,
     '36 ÷ 8 no es un número entero, así que 8 no es factor de 36.'),

    ('El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?',1,
     'Calcula 4 × 8, 5 × 6 y 2 × 9 para ver cuáles dan 30.'),
    ('El producto de dos números es 30 y ambos son factores de 30. ¿Cuál pareja cumple esta condición?',2,
     'Solo 5 × 6 = 30 y tanto 5 como 6 son factores de 30, así que esa pareja es la correcta.'),

    -- LO.2.2.1 – Múltiplos y divisibilidad (ADVANCED)
    ('¿Cuál de los siguientes números es un múltiplo común de 3 y 4?',1,
     'Revisa la tabla del 3 y la tabla del 4 y busca números que aparezcan en ambas.'),
    ('¿Cuál de los siguientes números es un múltiplo común de 3 y 4?',2,
     '12 aparece en la tabla del 3 (3, 6, 9, 12) y en la del 4 (4, 8, 12); por eso es múltiplo común.'),

    ('Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.',1,
     'Calcula las diferencias: 30 − 15 y 45 − 30 para encontrar la regla.'),
    ('Secuencia: 15, 30, 45, __, 75. Escribe el número que falta.',2,
     'Cada término aumenta 15; después de 45 viene 60, luego 75.'),

    ('¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?',1,
     'Suma las cifras de 24, 30 y 40 y mira cuáles sumas son múltiplos de 3.'),
    ('¿Cuál de los siguientes números es divisible por 3 y por 5 al mismo tiempo?',2,
     'Solo 30 tiene suma de cifras 3 + 0 = 3 (múltiplo de 3) y termina en 0, por eso es divisible por 3 y por 5.'),

    ('Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?',1,
     'Plantea la división 36 ÷ 4 para saber cuántos grupos puedes formar.'),
    ('Para un juego, se reparten 36 tarjetas en grupos de 4. ¿Cuántos grupos completos se forman?',2,
     '36 ÷ 4 = 9, por lo tanto se forman 9 grupos completos.'),

    ('Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.',1,
     'Calcula 18 − 9 y 27 − 18 para ver de cuánto en cuánto aumenta la secuencia.'),
    ('Secuencia: 9, 18, 27, __, 45, 54. Escribe el número que falta.',2,
     'La secuencia aumenta de 9 en 9; después de 27 viene 36, luego 45 y 54.')
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
-- RESUMEN LOG C.2 (ADVANCED, para ver conteos en consola)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'ADVANCED') AS exercises_c2_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'ADVANCED') AS hints_c2_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.2.1.1','LO.2.2.1')
     AND e.difficulty = 'ADVANCED') AS steps_c2_advanced;
