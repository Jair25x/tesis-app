-- ============================================================
-- R__seed_curriculum_math_4.sql – Estructura base (U1 completa)
-- ============================================================

-- 1) CURR
INSERT INTO curricula (id, code, name, description, grade, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'CURR-MATH-4',
       'Currículo de Matemática - Cuarto grado',
       'Unidad 1: Números naturales – estructura base',
       '4', TRUE, 'seed','seed', now(), now()
ON CONFLICT (code) DO NOTHING;

-- 2) COMPETENCY
WITH curr AS (SELECT id FROM curricula WHERE code = 'CURR-MATH-4')
INSERT INTO competencies (id, code, name, description, active, curriculum_id,
                          created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'C.1', 'NÚMEROS NATURALES',
       'Lectura, escritura, comparación, patrones y redondeo hasta 100 000.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
ON CONFLICT (code) DO NOTHING;

-- 3) STANDARDS
WITH c1 AS (SELECT id FROM competencies WHERE code = 'C.1')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'S.1.1','Números hasta el 100 000','Lectura/escritura y valor posicional.',TRUE,(SELECT id FROM c1),'seed','seed',now(),now()),
  (gen_random_uuid(),'S.1.2','Comparar y ordenar','Uso de <, >, = y ordenamiento.',TRUE,(SELECT id FROM c1),'seed','seed',now(),now()),
  (gen_random_uuid(),'S.1.3','Patrones numéricos','Secuencias y reglas mixtas.',TRUE,(SELECT id FROM c1),'seed','seed',now(),now()),
  (gen_random_uuid(),'S.1.4','Redondeo','A decenas, centenas, millares y decenas de millar.',TRUE,(SELECT id FROM c1),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

-- 4) LEARNING OBJECTIVES
WITH s11 AS (SELECT id FROM standards WHERE code='S.1.1'),
     s12 AS (SELECT id FROM standards WHERE code='S.1.2'),
     s13 AS (SELECT id FROM standards WHERE code='S.1.3'),
     s14 AS (SELECT id FROM standards WHERE code='S.1.4')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(),'LO.1.1.1','Valor posicional y notación','Identifica valor posicional y descompone.',TRUE,(SELECT id FROM s11),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.1.2','Lectura y escritura','Escribe en palabras y en cifras.',TRUE,(SELECT id FROM s11),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.2.1','Comparar y ordenar hasta 100 000','Usa <, >, = y ordena listas.',TRUE,(SELECT id FROM s12),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.3.1','Patrones y secuencias','Completa secuencias y explica reglas.',TRUE,(SELECT id FROM s13),'seed','seed',now(),now()),
  (gen_random_uuid(),'LO.1.4.1','Redondeo contextual','Redondea a distintas unidades.',TRUE,(SELECT id FROM s14),'seed','seed',now(),now())
ON CONFLICT (code) DO NOTHING;

-- 5) Smoke mínimo (uno por LO clave) — idempotente
-- A) PLACE_VALUE_QA (LO.1.1.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.1.1')
INSERT INTO exercises (id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),
  'Valor posicional de 7 en 74 325.',
  'BASIC','QA',NULL,'PLACE_VALUE_QA',
  '{
    "kind":"place_value",
    "number":74325,
    "digit":7,
    "place":"ten_thousands",
    "answer":"70 000"
  }'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.template_type='PLACE_VALUE_QA');

-- B) NUMBER_WORDS_BIDIR (LO.1.1.2)
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
  'Escribe en palabras 70 015.',
  'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
  '{
    "mode":"to_words",
    "number":70015,
    "locale":"es-PE",
    "answer":"Setenta mil quince"
  }'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.template_type='NUMBER_WORDS_BIDIR' AND e.statement='Escribe en palabras 70 015.');

-- C) NUMBER_SEQUENCE_QA (LO.1.3.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.3.1')
INSERT INTO exercises SELECT gen_random_uuid(),
  'Completa la secuencia: 9005, 8905, 8805, 8705, __, 8505.',
  'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
  '{
    "sequence":[9005,8905,8805,8705],
    "missingIndices":[4],
    "answers":[8605],
    "ruleHint":"Disminuye de 100 en 100."
  }'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.template_type='NUMBER_SEQUENCE_QA');

-- D) BASE_TEN_BLOCKS_QA (LO.1.1.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
  'Número representado por 3 centenas, 4 decenas y 2 unidades.',
  'BASIC','QA',NULL,'BASE_TEN_BLOCKS_QA',
  '{
    "hundreds":3,"tens":4,"ones":2,"answer":342,
    "altText":"3 centenas, 4 decenas y 2 unidades"
  }'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.template_type='BASE_TEN_BLOCKS_QA');
