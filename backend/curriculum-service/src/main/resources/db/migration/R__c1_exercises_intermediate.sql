-- ============================================================
-- R__c1_exercises_intermediate.sql
-- C.1 — NÚMEROS NATURALES (4.º)
-- Banco de 32 ejercicios nivel INTERMEDIATE:
-- - 8 para S.1.1 (LO.1.1.1 y LO.1.1.2)
-- - 8 para S.1.2 (LO.1.2.1)
-- - 8 para S.1.3 (LO.1.3.1)
-- - 8 para S.1.4 (LO.1.4.1)
-- Incluye 2 pistas + 2 pasos por ejercicio.
-- Idempotente: usa NOT EXISTS y se apoya en la estructura base
-- definida en R__seed_curriculum_math_4.sql.
-- ============================================================

/* ============================================================
   S.1.1 — NÚMEROS HASTA 100 000
   LO.1.1.1 (Valor posicional y notación)
   LO.1.1.2 (Lectura y escritura de números)
   8 ejercicios INTERMEDIATE
   ============================================================ */

------------------------------------------------------------
-- I1 — LO.1.1.1 (PLACE_VALUE_QA)
-- Cifra de las centenas (número mayor)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es la cifra de las centenas en 64 872?',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":64872,"ask":"hundreds","answer":8}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la cifra de las centenas en 64 872?'
  );

-- Hints I1
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 64 872?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe el número separando posiciones: 6 (d.millar), 4 (millares), 8 (centenas), 7 (decenas), 2 (unidades).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Escribe el número separando posiciones: 6 (d.millar), 4 (millares), 8 (centenas), 7 (decenas), 2 (unidades).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 64 872?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'La cifra de las centenas es la tercera desde la derecha.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'La cifra de las centenas es la tercera desde la derecha.'
  );

-- Steps I1
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 64 872?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Ubica las posiciones: 6 (decenas de millar), 4 (millares), 8 (centenas), 7 (decenas), 2 (unidades).',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 64 872?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'La cifra ubicada en las centenas es 8.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I2 — LO.1.1.1 (PLACE_VALUE_QA)
-- Cifra de las centenas (otro ejemplo)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál es la cifra de las centenas en 93 541?',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":93541,"ask":"hundreds","answer":5}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la cifra de las centenas en 93 541?'
  );

-- Hints I2
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 93 541?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe el número como 9 (d.millar), 3 (millares), 5 (centenas), 4 (decenas), 1 (unidades).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Escribe el número como 9 (d.millar), 3 (millares), 5 (centenas), 4 (decenas), 1 (unidades).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 93 541?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cuenta desde la derecha: unidades, decenas, centenas...',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cuenta desde la derecha: unidades, decenas, centenas...'
  );

-- Steps I2
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 93 541?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Identifica la tercera cifra desde la derecha: 9 3 5 4 1 → 1 (u), 4 (d), 5 (c).',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál es la cifra de las centenas en 93 541?'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'La cifra de las centenas es 5.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I3 — LO.1.1.1 (PLACE_VALUE_QA)
-- Forma desarrollada (sin ceros intermedios)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en forma desarrollada: 52 708.',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":52708,"ask":"expanded","answer":"50 000 + 2 000 + 700 + 8"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en forma desarrollada: 52 708.'
  );

-- Hints I3
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 52 708.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Separa por valor posicional: 5 (d.millar), 2 (millares), 7 (centenas), 0 (decenas), 8 (unidades).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Separa por valor posicional: 5 (d.millar), 2 (millares), 7 (centenas), 0 (decenas), 8 (unidades).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 52 708.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe cada valor: 50 000 + 2 000 + 700 + 0 + 8.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Escribe cada valor: 50 000 + 2 000 + 700 + 0 + 8.'
  );

-- Steps I3
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 52 708.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Descompón: 52 708 = 50 000 + 2 000 + 700 + 0 + 8.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 52 708.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Se suele omitir la suma con 0 decenas: 50 000 + 2 000 + 700 + 8.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I4 — LO.1.1.1 (PLACE_VALUE_QA)
-- Forma desarrollada (con cero en centenas)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en forma desarrollada: 80 304.',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":80304,"ask":"expanded","answer":"80 000 + 300 + 4"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en forma desarrollada: 80 304.'
  );

-- Hints I4
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 80 304.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '80 304 tiene: 8 (d.millar), 0 (millares), 3 (centenas), 0 (decenas), 4 (unidades).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '80 304 tiene: 8 (d.millar), 0 (millares), 3 (centenas), 0 (decenas), 4 (unidades).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 80 304.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Solo se escriben los valores diferentes de cero: 80 000 + 300 + 4.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Solo se escriben los valores diferentes de cero: 80 000 + 300 + 4.'
  );

-- Steps I4
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 80 304.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Descompón: 80 304 = 80 000 + 0 + 300 + 0 + 4.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en forma desarrollada: 80 304.'
    AND template_type = 'PLACE_VALUE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Al omitir los sumandos con 0 queda: 80 000 + 300 + 4.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I5 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
-- Palabras → cifras (hasta 100 000)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en cifras: "cuarenta y nueve mil ciento veinte".',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"cuarenta y nueve mil ciento veinte","answer":49120}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en cifras: "cuarenta y nueve mil ciento veinte".'
  );

-- Hints I5
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "cuarenta y nueve mil ciento veinte".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '"Cuarenta y nueve mil" = 49 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '"Cuarenta y nueve mil" = 49 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "cuarenta y nueve mil ciento veinte".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '"Ciento veinte" = 120, entonces 49 000 + 120 = 49 120.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '"Ciento veinte" = 120, entonces 49 000 + 120 = 49 120.'
  );

-- Steps I5
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "cuarenta y nueve mil ciento veinte".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Separa en dos partes: "cuarenta y nueve mil" y "ciento veinte".',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "cuarenta y nueve mil ciento veinte".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '"Cuarenta y nueve mil" = 49 000 y "ciento veinte" = 120 → 49 120.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I6 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
-- Cifras → palabras
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en palabras: 36 405.',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":36405,"answer":"treinta y seis mil cuatrocientos cinco"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en palabras: 36 405.'
  );

-- Hints I6
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 36 405.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Piensa en 36 000 y luego en 405.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Piensa en 36 000 y luego en 405.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 36 405.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '"Treinta y seis mil" + "cuatrocientos cinco".',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '"Treinta y seis mil" + "cuatrocientos cinco".'
  );

-- Steps I6
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 36 405.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '36 405 = 36 000 + 405.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 36 405.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Se lee: "treinta y seis mil cuatrocientos cinco".',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I7 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
-- Palabras → cifras (con cero en centenas)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en cifras: "sesenta mil trescientos ocho".',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"sesenta mil trescientos ocho","answer":60308}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en cifras: "sesenta mil trescientos ocho".'
  );

-- Hints I7
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "sesenta mil trescientos ocho".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '"Sesenta mil" = 60 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '"Sesenta mil" = 60 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "sesenta mil trescientos ocho".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '"Trescientos ocho" = 308 → 60 000 + 308 = 60 308.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '"Trescientos ocho" = 308 → 60 000 + 308 = 60 308.'
  );

-- Steps I7
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "sesenta mil trescientos ocho".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Separa: "sesenta mil" y "trescientos ocho".',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en cifras: "sesenta mil trescientos ocho".'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '"Sesenta mil" = 60 000, "trescientos ocho" = 308 → 60 308.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I8 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
-- Cifras → palabras (con decenas de millar)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Escribe en palabras: 95 070.',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":95070,"answer":"noventa y cinco mil setenta"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en palabras: 95 070.'
  );

-- Hints I8
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 95 070.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '95 070 = 95 000 + 70.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '95 070 = 95 000 + 70.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 95 070.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '95 000 se lee "noventa y cinco mil" y 70 se lee "setenta".',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '95 000 se lee "noventa y cinco mil" y 70 se lee "setenta".'
  );

-- Steps I8
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 95 070.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Descompón: 95 070 = 95 000 + 70.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Escribe en palabras: 95 070.'
    AND template_type = 'NUMBER_WORDS_BIDIR'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Se lee: "noventa y cinco mil setenta".',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

/* ============================================================
   S.1.2 — COMPARAR Y ORDENAR NÚMEROS
   LO.1.2.1 (Comparar y ordenar hasta 100 000)
   8 ejercicios INTERMEDIATE
   Usamos EQUATION_SINGLE_CHOICE para comparaciones y orden.
   ============================================================ */

------------------------------------------------------------
-- I9 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Completar con <, > o =
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Completa con <, > o =: 56 480 ___ 56 408.',
       'INTERMEDIATE','EQUATION','>',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":">"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 56 480 ___ 56 408.'
  );

-- Hints I9
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 56 480 ___ 56 408.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Compara primero las decenas: 8 decenas (80) y 0 decenas (00).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Compara primero las decenas: 8 decenas (80) y 0 decenas (00).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 56 480 ___ 56 408.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '56 480 es mayor que 56 408, por eso usamos ">".',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '56 480 es mayor que 56 408, por eso usamos ">".'
  );

-- Steps I9
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 56 480 ___ 56 408.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara 56 480 y 56 408 cifra por cifra: miles y centenas son iguales, revisa decenas y unidades.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 56 480 ___ 56 408.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Como 80 > 08, entonces 56 480 > 56 408, se coloca ">".',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I10 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Completar con <, > o = (otro caso)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Completa con <, > o =: 73 025 ___ 73 250.',
       'INTERMEDIATE','EQUATION','<',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":"<"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 73 025 ___ 73 250.'
  );

-- Hints I10
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 73 025 ___ 73 250.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Las decenas de 73 025 son 2 (20) y las de 73 250 son 5 (50).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Las decenas de 73 025 son 2 (20) y las de 73 250 son 5 (50).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 73 025 ___ 73 250.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '73 025 es menor que 73 250, así que usamos "<".',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '73 025 es menor que 73 250, así que usamos "<".'
  );

-- Steps I10
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 73 025 ___ 73 250.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara 73 025 y 73 250: los miles son iguales, revisa centenas, decenas y unidades.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Completa con <, > o =: 73 025 ___ 73 250.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Como 25 < 50 en la parte final, se cumple 73 025 < 73 250.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I11 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- ¿Cuál es el mayor número?
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es el mayor?',
       'INTERMEDIATE','EQUATION','45 503',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["45 320","45 503","45 305"],"answer":"45 503"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es el mayor?'
  );

-- Hints I11
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Compara primero las centenas: 3, 5 y 3.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Compara primero las centenas: 3, 5 y 3.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El número con 5 centenas es el mayor: 45 503.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'El número con 5 centenas es el mayor: 45 503.'
  );

-- Steps I11
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Escribe los números uno debajo de otro y compara cifra por cifra desde la izquierda.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Se observa que 45 503 tiene más centenas que los otros: es el mayor.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I12 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- ¿Cuál es el menor número?
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes números es el menor?',
       'INTERMEDIATE','EQUATION','82 109',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["82 190","82 109","82 901"],"answer":"82 109"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes números es el menor?'
  );

-- Hints I12
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Todos empiezan con 82 mil, compara las centenas, decenas y unidades.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Todos empiezan con 82 mil, compara las centenas, decenas y unidades.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El que tiene 0 centenas es el menor: 82 109.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'El que tiene 0 centenas es el menor: 82 109.'
  );

-- Steps I12
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara 82 190, 82 109 y 82 901: primero centenas (1, 0 y 9).',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿Cuál de los siguientes números es el menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'El número con la menor centena (0) es 82 109, por eso es el menor.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I13 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Orden de menor a mayor
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿En cuál alternativa los números están ordenados de menor a mayor?',
       'INTERMEDIATE','EQUATION','24 083 < 24 308 < 24 380',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["24 083 < 24 308 < 24 380","24 083 < 24 380 < 24 308","24 380 < 24 083 < 24 308"],"answer":"24 083 < 24 308 < 24 380"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿En cuál alternativa los números están ordenados de menor a mayor?'
  );

-- Hints I13
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de menor a mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Compara 24 083, 24 308 y 24 380 y escribe el orden correcto en un borrador.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Compara 24 083, 24 308 y 24 380 y escribe el orden correcto en un borrador.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de menor a mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '24 083 es el menor y 24 380 es el mayor.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '24 083 es el menor y 24 380 es el mayor.'
  );

-- Steps I13
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de menor a mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara primero las centenas: 0, 3 y 3. 24 083 tiene 0 centenas, es el menor.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de menor a mayor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Entre 24 308 y 24 380, el mayor es 24 380 → orden: 24 083 < 24 308 < 24 380.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I14 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Orden de mayor a menor
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿En cuál alternativa los números están ordenados de mayor a menor?',
       'INTERMEDIATE','EQUATION','67 904 > 67 409 > 67 094',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["67 904 > 67 409 > 67 094","67 094 > 67 409 > 67 904","67 409 > 67 904 > 67 094"],"answer":"67 904 > 67 409 > 67 094"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿En cuál alternativa los números están ordenados de mayor a menor?'
  );

-- Hints I14
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de mayor a menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Compara 67 904, 67 409 y 67 094. Todos tienen 67 mil, mira las centenas, decenas y unidades.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Compara 67 904, 67 409 y 67 094. Todos tienen 67 mil, mira las centenas, decenas y unidades.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de mayor a menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El mayor es 67 904 y el menor es 67 094.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'El mayor es 67 904 y el menor es 67 094.'
  );

-- Steps I14
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de mayor a menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Ordena primero los tres números de menor a mayor y luego invierte el orden.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = '¿En cuál alternativa los números están ordenados de mayor a menor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'De menor a mayor: 67 094 < 67 409 < 67 904 → de mayor a menor: 67 904 > 67 409 > 67 094.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I15 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Número que queda al centro al ordenar
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?',
       'INTERMEDIATE','EQUATION','67 509',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["67 095","67 509","67 590"],"answer":"67 509"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?'
  );

-- Hints I15
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Anota los tres números y ordénalos usando < o >.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Anota los tres números y ordénalos usando < o >.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El orden de menor a mayor es: 67 095, 67 509, 67 590.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'El orden de menor a mayor es: 67 095, 67 509, 67 590.'
  );

-- Steps I15
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara 67 590, 67 095 y 67 509: todos tienen 67 mil, revisa centenas, decenas y unidades.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Ordena los números 67 590, 67 095 y 67 509 de menor a mayor. ¿Cuál queda en el centro?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Ordenados: 67 095 < 67 509 < 67 590, por eso el número del centro es 67 509.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I16 — LO.1.2.1 (EQUATION_SINGLE_CHOICE)
-- Comparación en contexto
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?',
       'INTERMEDIATE','EQUATION','48 720 > 48 270',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["48 720 > 48 270","48 720 < 48 270","48 720 = 48 270"],"answer":"48 720 > 48 270"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?'
  );

-- Hints I16
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Compara 48 720 y 48 270, fijándote en las centenas y decenas.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Compara 48 720 y 48 270, fijándote en las centenas y decenas.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'La biblioteca A tiene más libros que la B.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'La biblioteca A tiene más libros que la B.'
  );

-- Steps I16
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Escribe: 48 720 y 48 270. Compara centenas: 7 centenas (700) y 2 centenas (200).',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En la biblioteca A hay 48 720 libros y en la biblioteca B hay 48 270 libros. ¿Qué comparación es correcta?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Como 48 720 tiene más centenas, se cumple 48 720 > 48 270.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

/* ============================================================
   S.1.3 — PATRONES NUMÉRICOS
   LO.1.3.1 (Patrones y secuencias numéricas)
   8 ejercicios INTERMEDIATE con NUMBER_SEQUENCE_QA
   ============================================================ */

------------------------------------------------------------
-- I17 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +250
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[12500,12750,null,13250,13500],"rule":"+250 cada paso","missingIndex":2,"answer":13000}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.'
  );

-- Hints I17
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula la diferencia entre 12 750 y 12 500.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Calcula la diferencia entre 12 750 y 12 500.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cada vez aumentamos 250. Suma 250 a 12 750.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cada vez aumentamos 250. Suma 250 a 12 750.'
  );

-- Steps I17
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'La diferencia entre términos es 12 750 - 12 500 = 250, por lo que el patrón es +250.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 12 500, 12 750, ____, 13 250, 13 500. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Sumamos 250 a 12 750: 12 750 + 250 = 13 000. Ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I18 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón -500
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[40000,39500,39000,null,38000],"rule":"-500 cada paso","missingIndex":3,"answer":38500}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.'
  );

-- Hints I18
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Observa que de 40 000 a 39 500 se resta 500.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Observa que de 40 000 a 39 500 se resta 500.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Después de 39 000 viene 38 500 si seguimos restando 500.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Después de 39 000 viene 38 500 si seguimos restando 500.'
  );

-- Steps I18
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'El patrón es -500: 40 000 - 500 = 39 500, 39 500 - 500 = 39 000.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 40 000, 39 500, 39 000, ____, 38 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Restamos 500 a 39 000: 39 000 - 500 = 38 500, que es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I19 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +1 000
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[27300,28300,29300,30300,null],"rule":"+1 000 cada paso","missingIndex":4,"answer":31300}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.'
  );

-- Hints I19
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cada vez aumenta 1 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cada vez aumenta 1 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Después de 30 300, suma 1 000 para encontrar el siguiente número.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Después de 30 300, suma 1 000 para encontrar el siguiente número.'
  );

-- Steps I19
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Identifica el patrón: 27 300 → 28 300 → 29 300 → 30 300, se suma 1 000 cada vez.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 27 300, 28 300, 29 300, 30 300, ____. Escribe el número que sigue.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '30 300 + 1 000 = 31 300, ese es el número que sigue.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I20 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +120
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[9840,9960,10080,null,10320],"rule":"+120 cada paso","missingIndex":3,"answer":10200}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.'
  );

-- Hints I20
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula 9 960 - 9 840 y 10 080 - 9 960.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Calcula 9 960 - 9 840 y 10 080 - 9 960.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cada vez aumentamos 120. Suma 120 a 10 080.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cada vez aumentamos 120. Suma 120 a 10 080.'
  );

-- Steps I20
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '9 960 - 9 840 = 120 y 10 080 - 9 960 = 120, el patrón es +120.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 9 840, 9 960, 10 080, ____, 10 320. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Suma 120 a 10 080: 10 080 + 120 = 10 200. Ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I21 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +100 (números de 4 cifras)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[5005,5105,null,5305,5405],"rule":"+100 cada paso","missingIndex":2,"answer":5205}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.'
  );

-- Hints I21
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula 5 105 - 5 005.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Calcula 5 105 - 5 005.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cada vez se suma 100. Después de 5 105 viene 5 205.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cada vez se suma 100. Después de 5 105 viene 5 205.'
  );

-- Steps I21
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '5 105 - 5 005 = 100, el patrón es +100.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 5 005, 5 105, ____, 5 305, 5 405. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Sumamos 100 a 5 105: 5 105 + 100 = 5 205. Ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I22 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón -2 000
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[30000,28000,26000,null,22000],"rule":"-2 000 cada paso","missingIndex":3,"answer":24000}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.'
  );

-- Hints I22
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'De 30 000 a 28 000 se resta 2 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'De 30 000 a 28 000 se resta 2 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Después de 26 000 viene 24 000 si sigues restando 2 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Después de 26 000 viene 24 000 si sigues restando 2 000.'
  );

-- Steps I22
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '30 000 - 2 000 = 28 000, 28 000 - 2 000 = 26 000. El patrón es -2 000.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 30 000, 28 000, 26 000, ____, 22 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '26 000 - 2 000 = 24 000, ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I23 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +75
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[10050,10125,null,10275,10350],"rule":"+75 cada paso","missingIndex":2,"answer":10200}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.'
  );

-- Hints I23
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Calcula 10 125 - 10 050.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Calcula 10 125 - 10 050.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cada vez aumentamos 75. Después de 10 125 viene 10 200.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Cada vez aumentamos 75. Después de 10 125 viene 10 200.'
  );

-- Steps I23
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '10 125 - 10 050 = 75, el patrón es +75.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 10 050, 10 125, ____, 10 275, 10 350. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '10 125 + 75 = 10 200, ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I24 — LO.1.3.1 (NUMBER_SEQUENCE_QA)
-- Patrón +400
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[16400,16800,null,17600,18000],"rule":"+400 cada paso","missingIndex":2,"answer":17200}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.'
  );

-- Hints I24
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '16 800 - 16 400 = 400.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '16 800 - 16 400 = 400.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Después de 16 800 viene 17 200 si agregas 400.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Después de 16 800 viene 17 200 si agregas 400.'
  );

-- Steps I24
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'La diferencia entre 16 800 y 16 400 es 400, el patrón es +400.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Secuencia: 16 400, 16 800, ____, 17 600, 18 000. Escribe el número que falta.'
    AND template_type = 'NUMBER_SEQUENCE_QA'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '16 800 + 400 = 17 200, ese es el número que falta.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

/* ============================================================
   S.1.4 — REDONDEO Y ESTIMACIÓN
   LO.1.4.1 (Redondeo y estimación en contexto)
   8 ejercicios INTERMEDIATE con EQUATION_SINGLE_CHOICE
   ============================================================ */

------------------------------------------------------------
-- I25 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Redondeo a decenas
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 6 748 a la decena más cercana.',
       'INTERMEDIATE','EQUATION','6 750',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["6 740","6 750","6 700"],"answer":"6 750"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 6 748 a la decena más cercana.'
  );

-- Hints I25
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 6 748 a la decena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Fíjate en la cifra de las unidades (8).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Fíjate en la cifra de las unidades (8).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 6 748 a la decena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si la unidad es 5, 6, 7, 8 o 9, se redondea hacia arriba.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Si la unidad es 5, 6, 7, 8 o 9, se redondea hacia arriba.'
  );

-- Steps I25
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 6 748 a la decena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'La cifra de las unidades es 8 (≥5), entonces se sube a la siguiente decena.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 6 748 a la decena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'La decena más cercana es 6 750.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I26 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Redondeo a centenas
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 42 361 a la centena más cercana.',
       'INTERMEDIATE','EQUATION','42 400',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["42 300","42 400","42 000"],"answer":"42 400"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 42 361 a la centena más cercana.'
  );

-- Hints I26
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 42 361 a la centena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Fíjate en la cifra de las decenas (6).',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Fíjate en la cifra de las decenas (6).'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 42 361 a la centena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si la decena es 5 o más, se sube a la siguiente centena.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Si la decena es 5 o más, se sube a la siguiente centena.'
  );

-- Steps I26
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 42 361 a la centena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Las centenas cercanas son 42 300 y 42 400. La decena es 6 (≥5), redondeamos hacia arriba.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 42 361 a la centena más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'El número redondeado a la centena más cercana es 42 400.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I27 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Redondeo a millares (hacia arriba)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 18 620 a la unidad de millar más cercana.',
       'INTERMEDIATE','EQUATION','19 000',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["18 000","18 500","19 000"],"answer":"19 000"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 18 620 a la unidad de millar más cercana.'
  );

-- Hints I27
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 18 620 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Piensa entre qué dos millares está 18 620: entre 18 000 y 19 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Piensa entre qué dos millares está 18 620: entre 18 000 y 19 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 18 620 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si la parte final es 500 o más, se redondea hacia arriba.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Si la parte final es 500 o más, se redondea hacia arriba.'
  );

-- Steps I27
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 18 620 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '18 620 está más cerca de 19 000 que de 18 000, porque 620 ≥ 500.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 18 620 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Por eso, 18 620 redondeado a la unidad de millar más cercana es 19 000.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I28 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Redondeo a millares (hacia abajo)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 53 230 a la unidad de millar más cercana.',
       'INTERMEDIATE','EQUATION','53 000',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["53 000","53 500","54 000"],"answer":"53 000"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 53 230 a la unidad de millar más cercana.'
  );

-- Hints I28
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 53 230 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '53 230 está entre 53 000 y 54 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '53 230 está entre 53 000 y 54 000.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 53 230 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Como 230 < 500, se redondea hacia abajo.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Como 230 < 500, se redondea hacia abajo.'
  );

-- Steps I28
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 53 230 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Compara 53 230 con 53 000 y 54 000: está más cerca de 53 000 porque la parte final es 230.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Redondea 53 230 a la unidad de millar más cercana.'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Por eso, redondeado a la unidad de millar más cercana es 53 000.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I29 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Estimación de suma (dos sumandos)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?',
       'INTERMEDIATE','EQUATION','600',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["500","600","700"],"answer":"600"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?'
  );

-- Hints I29
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 247 y 354 a la decena más cercana.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Redondea 247 y 354 a la decena más cercana.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '247 ≈ 250 y 354 ≈ 350. Ahora suma las estimaciones.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '247 ≈ 250 y 354 ≈ 350. Ahora suma las estimaciones.'
  );

-- Steps I29
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Redondea: 247 ≈ 250, 354 ≈ 350.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Una tienda vendió 247 cuadernos el lunes y 354 cuadernos el martes. ¿Cuál es la mejor estimación del total de cuadernos vendidos?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '250 + 350 = 600. La mejor estimación es 600 cuadernos.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I30 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Estimación de suma (tres sumandos grandes)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?',
       'INTERMEDIATE','EQUATION','5 000',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["4 000","5 000","6 000"],"answer":"5 000"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?'
  );

-- Hints I30
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea cada número a la unidad de millar o centena más cercana.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Redondea cada número a la unidad de millar o centena más cercana.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '1 980 ≈ 2 000, 2 030 ≈ 2 000, 995 ≈ 1 000.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '1 980 ≈ 2 000, 2 030 ≈ 2 000, 995 ≈ 1 000.'
  );

-- Steps I30
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       'Redondea: 1 980 ≈ 2 000, 2 030 ≈ 2 000, 995 ≈ 1 000.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'En una campaña se reciclaron 1 980 botellas en un colegio, 2 030 en otro y 995 en un tercero. ¿Cuál es la mejor estimación del total?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       '2 000 + 2 000 + 1 000 = 5 000. La mejor estimación es 5 000 botellas.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I31 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Redondeo en contexto (decenas)
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?',
       'INTERMEDIATE','EQUATION','60',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["50","60","70"],"answer":"60"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?'
  );

-- Hints I31
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Observa la cifra de las unidades de 58.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Observa la cifra de las unidades de 58.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'La unidad es 8 (≥5), se redondea hacia arriba.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'La unidad es 8 (≥5), se redondea hacia arriba.'
  );

-- Steps I31
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '58 está entre 50 y 60. Como termina en 8, está más cerca de 60.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Un bus puede llevar 58 estudiantes. Para calcular rápido, ¿a qué decena redondeas 58?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'Por eso, redondeamos 58 a 60.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );

------------------------------------------------------------
-- I32 — LO.1.4.1 (EQUATION_SINGLE_CHOICE)
-- Estimar una resta con redondeo a la centena
------------------------------------------------------------
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.1.4.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?',
       'INTERMEDIATE','EQUATION','9 800 − 4 200',
       'EQUATION_SINGLE_CHOICE',
       '{"choices":["9 800 − 4 200","9 700 − 4 000","10 000 − 4 000"],"answer":"9 800 − 4 200"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?'
  );

-- Hints I32
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Redondea 9 780 y 4 190 a la centena más cercana.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = 'Redondea 9 780 y 4 190 a la centena más cercana.'
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO hints (
  id, hint_text, cost, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '9 780 ≈ 9 800 y 4 190 ≈ 4 200, por eso usamos 9 800 − 4 200.',
       1,(SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM hints h
    WHERE h.exercise_id = (SELECT id FROM ex)
      AND h.hint_text = '9 780 ≈ 9 800 y 4 190 ≈ 4 200, por eso usamos 9 800 − 4 200.'
  );

-- Steps I32
WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),1,
       '9 780 tiene decenas 8 (≥5), se aproxima a 9 800; 4 190 tiene decenas 9 (≥5), se aproxima a 4 200.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 1
  );

WITH ex AS (
  SELECT id
  FROM exercises
  WHERE statement = 'Para estimar 9 780 − 4 190, ¿qué resta usando números redondeados a la centena más cercana es la mejor?'
    AND template_type = 'EQUATION_SINGLE_CHOICE'
  LIMIT 1
)
INSERT INTO solution_steps (
  id, step_number, explanation, exercise_id,
  active, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),2,
       'La resta aproximada es 9 800 − 4 200 ≈ 5 600.',
       (SELECT id FROM ex),
       TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (
    SELECT 1 FROM solution_steps s
    WHERE s.exercise_id = (SELECT id FROM ex)
      AND s.step_number = 2
  );