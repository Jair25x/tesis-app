-- ============================================================
-- R__c1_exercises_basic.sql
-- C.1 – NÚMEROS NATURALES (4.º)
-- Banco de 8 ejercicios BASIC por estándar:
--   S.1.1, S.1.2, S.1.3, S.1.4
-- Total: 32 ejercicios (todos BASIC), con 2 pistas y 2 pasos cada uno.
-- Idempotente: usa NOT EXISTS y se apoya en la estructura base
-- definida en R__seed_curriculum_math_4.sql.
-- ============================================================

------------------------------------------------------------
-- S.1.1 – NÚMEROS HASTA EL 100 000
-- LO.1.1.1 (valor posicional y notación) – 4 ejercicios
------------------------------------------------------------

-- B1 — LO.1.1.1 (PLACE_VALUE_QA)
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
       '¿Cuál es la cifra de las centenas en 4 827?',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":4827,"ask":"hundreds","answer":8}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la cifra de las centenas en 4 827?'
  );

-- B2 — LO.1.1.1 (PLACE_VALUE_QA)
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
       '¿Cuál es la cifra de las decenas en 39 642?',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":39642,"ask":"tens","answer":4}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la cifra de las decenas en 39 642?'
  );

-- B3 — LO.1.1.1 (PLACE_VALUE_QA)
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
       'Escribe en forma desarrollada: 6 305.',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":6305,"ask":"expanded","answer":"6000 + 300 + 5"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en forma desarrollada: 6 305.'
  );

-- B4 — LO.1.1.1 (PLACE_VALUE_QA)
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
       'Completa: 80 000 + 400 + 9 = ____.',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":80409,"ask":"compose","answer":80409}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa: 80 000 + 400 + 9 = ____.'
  );

------------------------------------------------------------
-- LO.1.1.2 (lectura y escritura de números) – 4 ejercicios
------------------------------------------------------------

-- B5 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
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
       'Escribe en cifras: "dos mil treinta y cinco".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"dos mil treinta y cinco","answer":2035}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en cifras: "dos mil treinta y cinco".'
  );

-- B6 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
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
       'Escribe en cifras: "noventa mil siete".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"noventa mil siete","answer":90007}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en cifras: "noventa mil siete".'
  );

-- B7 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
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
       'Escribe en palabras: 47 305.',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":47305,"answer":"cuarenta y siete mil trescientos cinco"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en palabras: 47 305.'
  );

-- B8 — LO.1.1.2 (NUMBER_WORDS_BIDIR)
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
       'Escribe en palabras: 15 020.',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":15020,"answer":"quince mil veinte"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Escribe en palabras: 15 020.'
  );

------------------------------------------------------------
-- S.1.2 – COMPARAR Y ORDENAR NÚMEROS
-- LO.1.2.1 – 8 ejercicios (EQUATION_SINGLE_CHOICE)
------------------------------------------------------------

-- B9
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
       'Completa con <, > o =: 72 315 __ 72 351.',
       'BASIC','EQUATION','<','EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":"<"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 72 315 __ 72 351.'
  );

-- B10
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
       'Completa con <, > o =: 9 504 __ 9 450.',
       'BASIC','EQUATION','>','EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":">"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 9 504 __ 9 450.'
  );

-- B11
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
       'Completa con <, > o =: 38 000 __ 38 000.',
       'BASIC','EQUATION','=','EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":"="}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 38 000 __ 38 000.'
  );

-- B12
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
       'Completa con <, > o =: 4 029 __ 3 920.',
       'BASIC','EQUATION','>','EQUATION_SINGLE_CHOICE',
       '{"choices":["<",">","="],"answer":">"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Completa con <, > o =: 4 029 __ 3 920.'
  );

-- B13
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
       '¿Cuál lista está en orden ascendente?',
       'BASIC','EQUATION','B) 15 120, 15 300, 15 450','EQUATION_SINGLE_CHOICE',
       '{"choices":[
          "A) 15 300, 15 120, 15 450",
          "B) 15 120, 15 300, 15 450",
          "C) 15 450, 15 300, 15 120"
        ],
        "answer":"B) 15 120, 15 300, 15 450"
       }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál lista está en orden ascendente?'
  );

-- B14
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
       '¿Cuál lista está en orden descendente?',
       'BASIC','EQUATION','A) 8 010, 7 900, 7 850, 7 800','EQUATION_SINGLE_CHOICE',
       '{"choices":[
          "A) 8 010, 7 900, 7 850, 7 800",
          "B) 7 800, 7 850, 7 900, 8 010",
          "C) 7 900, 8 010, 7 850, 7 800"
        ],
        "answer":"A) 8 010, 7 900, 7 850, 7 800"
       }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál lista está en orden descendente?'
  );

-- B15
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
       'Elige la opción donde los números están ordenados de menor a mayor.',
       'BASIC','EQUATION','A) 23 405, 23 450, 23 500, 23 540','EQUATION_SINGLE_CHOICE',
       '{"choices":[
          "A) 23 405, 23 450, 23 500, 23 540",
          "B) 23 540, 23 500, 23 450, 23 405",
          "C) 23 405, 23 500, 23 450, 23 540"
        ],
        "answer":"A) 23 405, 23 450, 23 500, 23 540"
       }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Elige la opción donde los números están ordenados de menor a mayor.'
  );

-- B16
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
       'Elige la opción donde los números están ordenados de mayor a menor.',
       'BASIC','EQUATION','B) 9 020, 9 015, 8 990','EQUATION_SINGLE_CHOICE',
       '{"choices":[
          "A) 8 990, 9 015, 9 020",
          "B) 9 020, 9 015, 8 990",
          "C) 9 015, 8 990, 9 020"
        ],
        "answer":"B) 9 020, 9 015, 8 990"
       }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Elige la opción donde los números están ordenados de mayor a menor.'
  );

------------------------------------------------------------
-- S.1.3 – PATRONES NUMÉRICOS
-- LO.1.3.1 – 8 ejercicios (NUMBER_SEQUENCE_QA)
------------------------------------------------------------

-- B17
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
       'Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[2400,2450,2500,null,2600],
         "rule":"+50 cada paso",
         "missingIndex":3,
         "answer":2550}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.'
  );

-- B18
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
       'Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[1005,1015,1025,null,1045],
         "rule":"+10 cada paso",
         "missingIndex":3,
         "answer":1035}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.'
  );

-- B19
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
       'Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[8000,7800,7600,null,7200],
         "rule":"-200 cada paso",
         "missingIndex":3,
         "answer":7400}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.'
  );

-- B20
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
       'Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[35200,35300,null,35500,35600],
         "rule":"+100 cada paso",
         "missingIndex":2,
         "answer":35400}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.'
  );

-- B21
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
       'Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[9900,9700,9500,null,9100],
         "rule":"-200 cada paso",
         "missingIndex":3,
         "answer":9300}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.'
  );

-- B22
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
       'Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[4050,4100,4150,4200,null,4300],
         "rule":"+50 cada paso",
         "missingIndex":4,
         "answer":4250}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.'
  );

-- B23
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
       'Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[500,750,1000,null,1500],
         "rule":"+250 cada paso",
         "missingIndex":3,
         "answer":1250}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.'
  );

-- B24
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
       'Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[10000,9500,9000,null,8000],
         "rule":"-500 cada paso",
         "missingIndex":3,
         "answer":8500}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.'
  );

------------------------------------------------------------
-- S.1.4 – REDONDEO Y ESTIMACIÓN
-- LO.1.4.1 – 8 ejercicios (EQUATION_SINGLE_CHOICE)
------------------------------------------------------------

-- B25
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
       'Redondea 47 al múltiplo de 10 más cercano.',
       'BASIC','EQUATION','50','EQUATION_SINGLE_CHOICE',
       '{"choices":["40","50","60"],"answer":"50"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 47 al múltiplo de 10 más cercano.'
  );

-- B26
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
       'Redondea 263 a la centena más cercana.',
       'BASIC','EQUATION','300','EQUATION_SINGLE_CHOICE',
       '{"choices":["200","300","400"],"answer":"300"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 263 a la centena más cercana.'
  );

-- B27
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
       'Redondea 5 684 a la decena más cercana.',
       'BASIC','EQUATION','5 680','EQUATION_SINGLE_CHOICE',
       '{"choices":["5 680","5 690","5 700"],"answer":"5 680"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 5 684 a la decena más cercana.'
  );

-- B28
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
       'Redondea 18 349 a la centena más cercana.',
       'BASIC','EQUATION','18 300','EQUATION_SINGLE_CHOICE',
       '{"choices":["18 300","18 400","18 500"],"answer":"18 300"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 18 349 a la centena más cercana.'
  );

-- B29
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
       'Redondea 9 749 al millar más cercano.',
       'BASIC','EQUATION','10 000','EQUATION_SINGLE_CHOICE',
       '{"choices":["9 000","9 700","10 000"],"answer":"10 000"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 9 749 al millar más cercano.'
  );

-- B30
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
       'Redondea 42 120 al millar más cercano.',
       'BASIC','EQUATION','42 000','EQUATION_SINGLE_CHOICE',
       '{"choices":["42 000","42 500","43 000"],"answer":"42 000"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Redondea 42 120 al millar más cercano.'
  );

-- B31
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
       '¿Cuál es la mejor estimación de 198 + 403?',
       'BASIC','EQUATION','600','EQUATION_SINGLE_CHOICE',
       '{"choices":["500","600","700"],"answer":"600"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la mejor estimación de 198 + 403?'
  );

-- B32
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
       '¿Cuál es la mejor estimación de 3 248 + 1 901?',
       'BASIC','EQUATION','5 100','EQUATION_SINGLE_CHOICE',
       '{"choices":["4 000","5 000","5 100","5 500"],"answer":"5 100"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál es la mejor estimación de 3 248 + 1 901?'
  );

------------------------------------------------------------
-- HINTS (2 por ejercicio BASIC de estos LOs)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.2.1','LO.1.3.1','LO.1.4.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- S.1.1 / LO.1.1.1
    ('¿Cuál es la cifra de las centenas en 4 827?',
     'Ubica las posiciones: millares, centenas, decenas y unidades.'),
    ('¿Cuál es la cifra de las centenas en 4 827?',
     'En 4 827, la cifra de las centenas es 8.'),
    ('¿Cuál es la cifra de las decenas en 39 642?',
     'Observa la columna de las decenas en el número.'),
    ('¿Cuál es la cifra de las decenas en 39 642?',
     'En 39 642, la cifra de las decenas es 4.'),
    ('Escribe en forma desarrollada: 6 305.',
     'Separa el número en miles, centenas, decenas y unidades.'),
    ('Escribe en forma desarrollada: 6 305.',
     '6 305 = 6 000 + 300 + 5.'),
    ('Completa: 80 000 + 400 + 9 = ____.',
     'Suma primero los miles con las centenas.'),
    ('Completa: 80 000 + 400 + 9 = ____.',
     '80 000 + 400 + 9 = 80 409.'),

    -- S.1.1 / LO.1.1.2
    ('Escribe en cifras: "dos mil treinta y cinco".',
     'Identifica miles (2 000) y el número “treinta y cinco” (35).'),
    ('Escribe en cifras: "dos mil treinta y cinco".',
     '2 000 + 35 = 2 035.'),
    ('Escribe en cifras: "noventa mil siete".',
     '“Noventa mil” es 90 000.'),
    ('Escribe en cifras: "noventa mil siete".',
     '90 000 + 7 = 90 007.'),
    ('Escribe en palabras: 47 305.',
     'Separa en clases: 47 mil y 305.'),
    ('Escribe en palabras: 47 305.',
     'Se lee: "cuarenta y siete mil trescientos cinco".'),
    ('Escribe en palabras: 15 020.',
     '15 020 es 15 mil y 20.'),
    ('Escribe en palabras: 15 020.',
     'Se lee: "quince mil veinte".'),

    -- S.1.2 / LO.1.2.1 (comparar y ordenar)
    ('Completa con <, > o =: 72 315 __ 72 351.',
     'Compara primero las cifras de las decenas y unidades.'),
    ('Completa con <, > o =: 72 315 __ 72 351.',
     '72 315 es menor que 72 351.'),
    ('Completa con <, > o =: 9 504 __ 9 450.',
     'Compara las centenas, luego las decenas.'),
    ('Completa con <, > o =: 9 504 __ 9 450.',
     '9 504 es mayor que 9 450.'),
    ('Completa con <, > o =: 38 000 __ 38 000.',
     'Observa que ambos números son exactamente iguales.'),
    ('Completa con <, > o =: 38 000 __ 38 000.',
     'Si los números son iguales, se usa el símbolo =.'),
    ('Completa con <, > o =: 4 029 __ 3 920.',
     'Compara la cifra de los millares primero.'),
    ('Completa con <, > o =: 4 029 __ 3 920.',
     '4 029 es mayor que 3 920.'),

    ('¿Cuál lista está en orden ascendente?',
     'En un orden ascendente los números van de menor a mayor.'),
    ('¿Cuál lista está en orden ascendente?',
     'Busca la opción donde cada número siguiente es mayor que el anterior.'),
    ('¿Cuál lista está en orden descendente?',
     'En un orden descendente los números van de mayor a menor.'),
    ('¿Cuál lista está en orden descendente?',
     'Busca la opción donde cada número es menor que el anterior.'),
    ('Elige la opción donde los números están ordenados de menor a mayor.',
     'Identifica primero el número más pequeño de la lista.'),
    ('Elige la opción donde los números están ordenados de menor a mayor.',
     'Verifica que cada número siguiente sea mayor que el anterior.'),
    ('Elige la opción donde los números están ordenados de mayor a menor.',
     'Identifica primero el número más grande de la lista.'),
    ('Elige la opción donde los números están ordenados de mayor a menor.',
     'Verifica que cada número siguiente sea menor que el anterior.'),

    -- S.1.3 / LO.1.3.1 (patrones)
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',
     'Observa cuánto aumenta cada número.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',
     'Cada término aumenta 50.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',
     'Calcula la diferencia entre dos términos seguidos.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',
     'Cada término aumenta 10.'),
    ('Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.',
     'Observa si la secuencia aumenta o disminuye.'),
    ('Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.',
     'Cada término disminuye 200.'),
    ('Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.',
     'Calcula la diferencia entre 35 200 y 35 300.'),
    ('Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.',
     'Cada término aumenta 100.'),

    ('Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.',
     'La secuencia va disminuyendo de 200 en 200.'),
    ('Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.',
     'Después de 9 500 sigue 9 300.'),
    ('Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.',
     'Observa cuánto aumenta la secuencia en cada paso.'),
    ('Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.',
     'Cada término aumenta 50.'),
    ('Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.',
     'Calcula la diferencia entre 500 y 750.'),
    ('Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.',
     'La diferencia entre términos consecutivos es 250.'),
    ('Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.',
     'La secuencia disminuye de 500 en 500.'),
    ('Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.',
     'Después de 9 000 sigue 8 500.'),

    -- S.1.4 / LO.1.4.1 (redondeo y estimación)
    ('Redondea 47 al múltiplo de 10 más cercano.',
     'Observa la cifra de las unidades (7).'),
    ('Redondea 47 al múltiplo de 10 más cercano.',
     'Si la unidad es 5–9, se redondea hacia arriba.'),
    ('Redondea 263 a la centena más cercana.',
     'Mira la cifra de las decenas (6).'),
    ('Redondea 263 a la centena más cercana.',
     'Si las decenas son 5–9, la centena sube en 1.'),
    ('Redondea 5 684 a la decena más cercana.',
     'Mira la cifra de las unidades (4).'),
    ('Redondea 5 684 a la decena más cercana.',
     'Si la unidad es 0–4, se redondea hacia abajo.'),
    ('Redondea 18 349 a la centena más cercana.',
     'La cifra de las decenas es 4.'),
    ('Redondea 18 349 a la centena más cercana.',
     '18 349 está más cerca de 18 300 que de 18 400.'),

    ('Redondea 9 749 al millar más cercano.',
     'Compara la cifra de las centenas con 5.'),
    ('Redondea 9 749 al millar más cercano.',
     '9 749 está más cerca de 10 000 que de 9 000.'),
    ('Redondea 42 120 al millar más cercano.',
     'Observa las centenas (1).'),
    ('Redondea 42 120 al millar más cercano.',
     '42 120 está más cerca de 42 000 que de 43 000.'),
    ('¿Cuál es la mejor estimación de 198 + 403?',
     'Redondea 198 y 403 a la decena o centena más cercana.'),
    ('¿Cuál es la mejor estimación de 198 + 403?',
     '198 ≈ 200 y 403 ≈ 400, 200 + 400 = 600.'),
    ('¿Cuál es la mejor estimación de 3 248 + 1 901?',
     'Redondea ambos números a la centena más cercana.'),
    ('¿Cuál es la mejor estimación de 3 248 + 1 901?',
     '3 248 ≈ 3 200 y 1 901 ≈ 1 900, 3 200 + 1 900 ≈ 5 100.')
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
-- SOLUTION_STEPS (2 por ejercicio BASIC de estos LOs)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.2.1','LO.1.3.1','LO.1.4.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- S.1.1 / LO.1.1.1
    ('¿Cuál es la cifra de las centenas en 4 827?',1,
     'Escribe 4 827 indicando posiciones: 4 millares, 8 centenas, 2 decenas y 7 unidades.'),
    ('¿Cuál es la cifra de las centenas en 4 827?',2,
     'La cifra de las centenas es 8.'),
    ('¿Cuál es la cifra de las decenas en 39 642?',1,
     'Descompón 39 642: 3 decenas de millar, 9 unidades de millar, 6 centenas, 4 decenas y 2 unidades.'),
    ('¿Cuál es la cifra de las decenas en 39 642?',2,
     'La cifra de las decenas es 4.'),

    ('Escribe en forma desarrollada: 6 305.',1,
     'Identifica las posiciones: 6 en miles, 3 en centenas, 0 en decenas y 5 en unidades.'),
    ('Escribe en forma desarrollada: 6 305.',2,
     'Escribe: 6 000 + 300 + 5.'),
    ('Completa: 80 000 + 400 + 9 = ____.',1,
     'Suma primero 80 000 + 400 = 80 400.'),
    ('Completa: 80 000 + 400 + 9 = ____.',2,
     '80 400 + 9 = 80 409.'),

    -- S.1.1 / LO.1.1.2
    ('Escribe en cifras: "dos mil treinta y cinco".',1,
     '“Dos mil” corresponde a 2 000.'),
    ('Escribe en cifras: "dos mil treinta y cinco".',2,
     '2 000 + 35 = 2 035 → escribe 2 035.'),
    ('Escribe en cifras: "noventa mil siete".',1,
     '“Noventa mil” corresponde a 90 000 y “siete” a 7.'),
    ('Escribe en cifras: "noventa mil siete".',2,
     '90 000 + 7 = 90 007.'),

    ('Escribe en palabras: 47 305.',1,
     'Identifica 47 000 y 305.'),
    ('Escribe en palabras: 47 305.',2,
     'Se lee: "cuarenta y siete mil trescientos cinco".'),
    ('Escribe en palabras: 15 020.',1,
     'Separa en 15 000 y 20.'),
    ('Escribe en palabras: 15 020.',2,
     'Se lee: "quince mil veinte".'),

    -- S.1.2 / LO.1.2.1
    ('Completa con <, > o =: 72 315 __ 72 351.',1,
     'Compara decenas y unidades: 72 315 y 72 351.'),
    ('Completa con <, > o =: 72 315 __ 72 351.',2,
     'Como 315 < 351, 72 315 < 72 351.'),
    ('Completa con <, > o =: 9 504 __ 9 450.',1,
     'Compara 9 504 y 9 450; ambas tienen 9 en millares y 5 en centenas.'),
    ('Completa con <, > o =: 9 504 __ 9 450.',2,
     'Como 504 > 450, 9 504 > 9 450.'),

    ('Completa con <, > o =: 38 000 __ 38 000.',1,
     'Observa que los dos números tienen las mismas cifras.'),
    ('Completa con <, > o =: 38 000 __ 38 000.',2,
     'Entonces 38 000 = 38 000.'),
    ('Completa con <, > o =: 4 029 __ 3 920.',1,
     'Compara primero los millares: 4 000 frente a 3 000.'),
    ('Completa con <, > o =: 4 029 __ 3 920.',2,
     'Como 4 000 > 3 000, 4 029 > 3 920.'),

    ('¿Cuál lista está en orden ascendente?',1,
     'Revisa cada opción y observa si van de menor a mayor.'),
    ('¿Cuál lista está en orden ascendente?',2,
     'En la opción correcta cada número siguiente es mayor que el anterior.'),
    ('¿Cuál lista está en orden descendente?',1,
     'Revisa cada opción y observa si van de mayor a menor.'),
    ('¿Cuál lista está en orden descendente?',2,
     'En la opción correcta cada número siguiente es menor que el anterior.'),

    ('Elige la opción donde los números están ordenados de menor a mayor.',1,
     'Identifica el número más pequeño y verifica que aparezca primero.'),
    ('Elige la opción donde los números están ordenados de menor a mayor.',2,
     'Comprueba que cada número sea mayor que el anterior.'),
    ('Elige la opción donde los números están ordenados de mayor a menor.',1,
     'Identifica el número más grande y verifica que esté al inicio.'),
    ('Elige la opción donde los números están ordenados de mayor a menor.',2,
     'Comprueba que los números vayan disminuyendo.'),

    -- S.1.3 / LO.1.3.1
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',1,
     'Calcula 2 450 - 2 400 y 2 500 - 2 450 para hallar la regla.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',2,
     'Cada paso suma 50, así que 2 500 + 50 = 2 550.'),

    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',1,
     'Calcula 1 015 - 1 005 y 1 025 - 1 015.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',2,
     'Cada paso suma 10, entonces 1 025 + 10 = 1 035.'),

    ('Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.',1,
     'Calcula 7 800 - 8 000 y 7 600 - 7 800.'),
    ('Secuencia: 8 000, 7 800, 7 600, ____, 7 200. Escribe el número que falta.',2,
     'Cada paso resta 200, así que 7 600 - 200 = 7 400.'),

    ('Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.',1,
     'Observa que 35 300 - 35 200 = 100.'),
    ('Secuencia: 35 200, 35 300, ____, 35 500, 35 600. Escribe el número que falta.',2,
     'Sigue la regla: 35 300 + 100 = 35 400.'),

    ('Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.',1,
     'Cada paso disminuye 200 unidades.'),
    ('Secuencia: 9 900, 9 700, 9 500, ____, 9 100. Escribe el número que falta.',2,
     'Después de 9 500 viene 9 300.'),
    ('Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.',1,
     'Calcula la diferencia entre 4 050 y 4 100.'),
    ('Secuencia: 4 050, 4 100, 4 150, 4 200, ____, 4 300. Escribe el número que falta.',2,
     'Cada paso suma 50, por lo tanto 4 200 + 50 = 4 250.'),

    ('Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.',1,
     'Calcula 750 - 500 y 1 000 - 750.'),
    ('Secuencia: 500, 750, 1 000, ____, 1 500. Escribe el número que falta.',2,
     'La diferencia es 250, entonces 1 000 + 250 = 1 250.'),

    ('Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.',1,
     'Calcula 9 500 - 10 000 y 9 000 - 9 500.'),
    ('Secuencia: 10 000, 9 500, 9 000, ____, 8 000. Escribe el número que falta.',2,
     'Cada paso resta 500, entonces 9 000 - 500 = 8 500.'),

    -- S.1.4 / LO.1.4.1
    ('Redondea 47 al múltiplo de 10 más cercano.',1,
     '47 está entre 40 y 50.'),
    ('Redondea 47 al múltiplo de 10 más cercano.',2,
     'Como termina en 7 (≥5), se redondea a 50.'),

    ('Redondea 263 a la centena más cercana.',1,
     '263 está entre 200 y 300, pero más cerca de 300.'),
    ('Redondea 263 a la centena más cercana.',2,
     'Decenas 6 (≥5) → 263 se redondea a 300.'),

    ('Redondea 5 684 a la decena más cercana.',1,
     '5 684 está entre 5 680 y 5 690.'),
    ('Redondea 5 684 a la decena más cercana.',2,
     'Como 4 < 5, se redondea a 5 680.'),

    ('Redondea 18 349 a la centena más cercana.',1,
     '18 349 está entre 18 300 y 18 400.'),
    ('Redondea 18 349 a la centena más cercana.',2,
     'Como las decenas son 4 (<5), se redondea a 18 300.'),

    ('Redondea 9 749 al millar más cercano.',1,
     '9 749 está entre 9 000 y 10 000.'),
    ('Redondea 9 749 al millar más cercano.',2,
     'Está más cerca de 10 000 que de 9 000.'),

    ('Redondea 42 120 al millar más cercano.',1,
     '42 120 está entre 42 000 y 43 000.'),
    ('Redondea 42 120 al millar más cercano.',2,
     'Como las centenas son 1 (<5), se redondea a 42 000.'),

    ('¿Cuál es la mejor estimación de 198 + 403?',1,
     'Aproxima 198 a 200 y 403 a 400.'),
    ('¿Cuál es la mejor estimación de 198 + 403?',2,
     '200 + 400 ≈ 600.'),

    ('¿Cuál es la mejor estimación de 3 248 + 1 901?',1,
     'Aproxima 3 248 a 3 200 y 1 901 a 1 900.'),
    ('¿Cuál es la mejor estimación de 3 248 + 1 901?',2,
     '3 200 + 1 900 ≈ 5 100.')
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
-- RESUMEN LOG (para ver conteos en consola)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.2.1','LO.1.3.1','LO.1.4.1')
     AND e.difficulty = 'BASIC') AS exercises_c1_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.2.1','LO.1.3.1','LO.1.4.1')
     AND e.difficulty = 'BASIC') AS hints_c1_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.2.1','LO.1.3.1','LO.1.4.1')
     AND e.difficulty = 'BASIC') AS steps_c1_basic;
