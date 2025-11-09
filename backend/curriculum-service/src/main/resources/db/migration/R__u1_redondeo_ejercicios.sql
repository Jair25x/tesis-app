-- R__u1_redondeo_ejercicios.sql
-- LO.1.4.1 (Redondeo contextual) – 15 ejercicios (5 BASIC, 5 INTERMEDIATE, 5 ADVANCED)
-- Incluye 2 pistas + 2 pasos por ejercicio (idempotente por LO+statement)

-- Helper: asegurar LO de redondeo
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
SELECT 1;

-- ========== BASIC (5) ==========
-- B1
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 47 al múltiplo de 10 más cercano.',
  'BASIC', 'EQUATION', '50', 'EQUATION_SINGLE_CHOICE',
  '{"choices":["40","50","60"],"answer":"50"}'::jsonb,
  TRUE, FALSE, (SELECT id FROM lo), 'seed','seed', now(), now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id=(SELECT id FROM lo)
      AND e.statement='Redondea 47 al múltiplo de 10 más cercano.'
);

-- Hints/Steps B1
WITH ex AS (
  SELECT id FROM exercises
  WHERE statement='Redondea 47 al múltiplo de 10 más cercano.'
    AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Observa la unidad: si es 5–9, sube a la siguiente decena.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));

WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 47 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'47 está más cerca de 50 que de 40.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND 1 > (SELECT COUNT(*) FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));

WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 47 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Identifica la cifra de las unidades (7). Regla: 5–9 → redondea hacia arriba.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);

WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 47 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'De 47 a 50 hay 3; a 40 hay 7. Está más cerca de 50 → respuesta: 50.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM ex)
  AND NOT EXISTS (SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- B2
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 263 a la centena más cercana.',
  'BASIC','EQUATION','300','EQUATION_SINGLE_CHOICE',
  '{"choices":["200","300","400"],"answer":"300"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 263 a la centena más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 263 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Mira las decenas: 6 (≥5) → sube a la siguiente centena.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 263 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'263 está entre 200 y 300, más cerca de 300.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND 1>(SELECT COUNT(*) FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 263 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Cifra de decenas = 6 → regla 5–9, sube.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 263 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 300.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- B3
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 1 234 al múltiplo de 10 más cercano.',
  'BASIC','EQUATION','1 230','EQUATION_SINGLE_CHOICE',
  '{"choices":["1 220","1 230","1 240"],"answer":"1 230"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 1 234 al múltiplo de 10 más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 1 234 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Mira la unidad: 4 (<5) → redondea hacia abajo.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 1 234 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Unidad = 4 → baja a 1 230.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 1 234 al múltiplo de 10 más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 1 230.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- B4
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 5 678 a la centena más cercana.',
  'BASIC','EQUATION','5 700','EQUATION_SINGLE_CHOICE',
  '{"choices":["5 600","5 700","5 800"],"answer":"5 700"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 5 678 a la centena más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 678 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Decenas = 7 (≥5) → sube.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 678 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Compara 5 600 y 5 700: está más cerca de 5 700.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 678 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 5 700.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- B5
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 90 015 al millar más cercano.',
  'BASIC','EQUATION','90 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["89 000","90 000","91 000"],"answer":"90 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 90 015 al millar más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 90 015 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Observa centenas y decenas: < 500, baja.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 90 015 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Más cerca de 90 000 que de 91 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 90 015 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 90 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- ========== INTERMEDIATE (5) ==========
-- I1
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 74 325 a la decena de millar más cercana.',
  'INTERMEDIATE','EQUATION','70 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["70 000","74 000","80 000"],"answer":"70 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 74 325 a la decena de millar más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 74 325 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Millares: 4 325 < 5 000 → baja a 70 000.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 74 325 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Compara con 75 000 (punto medio).',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 74 325 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'74 325 < 75 000 → 70 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- I2
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 149 500 al millar más cercano.',
  'INTERMEDIATE','EQUATION','150 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["149 000","150 000","151 000"],"answer":"150 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 149 500 al millar más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 149 500 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Empate (…500) → convención: subir.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 149 500 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Está a mitad entre 149 000 y 150 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 149 500 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Convención → 150 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- I3
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 2 345 a la centena más cercana.',
  'INTERMEDIATE','EQUATION','2 300','EQUATION_SINGLE_CHOICE',
  '{"choices":["2 300","2 400","2 500"],"answer":"2 300"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 2 345 a la centena más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 2 345 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Decenas = 4 (<5) → baja.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 2 345 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Más cerca de 2 300 que de 2 400.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 2 345 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 2 300.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- I4
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 600 499 al millar más cercano.',
  'INTERMEDIATE','EQUATION','600 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["600 000","600 500","601 000"],"answer":"600 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 600 499 al millar más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 600 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'499 < 500 → baja.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 600 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Más cerca de 600 000 que de 601 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 600 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 600 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- I5
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 17 950 a la centena más cercana.',
  'INTERMEDIATE','EQUATION','18 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["17 900","18 000","17 800"],"answer":"18 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 17 950 a la centena más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 17 950 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Caso …50 → subir.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 17 950 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Entre 17 900 y 18 000 → al medio.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 17 950 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Convención: 18 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- ========== ADVANCED (5) ==========
-- A1
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 378 499 al millar más cercano.',
  'ADVANCED','EQUATION','378 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["378 000","379 000","380 000"],"answer":"378 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 378 499 al millar más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 378 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'499 < 500 → no sube.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 378 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Más cerca de 378 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 378 499 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 378 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- A2
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 84 567 a la decena de millar más cercana.',
  'ADVANCED','EQUATION','80 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["80 000","90 000","85 000"],"answer":"80 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 84 567 a la decena de millar más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 84 567 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Punto medio = 85 000 → como 84 567 < 85 000, baja.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 84 567 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Compara con 85 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 84 567 a la decena de millar más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Como es menor, → 80 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- A3
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 995 a la centena más cercana.',
  'ADVANCED','EQUATION','1 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["900","1 000","1 100"],"answer":"1 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 995 a la centena más cercana.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 995 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'95 (decenas ≥ 50) → sube.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 995 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'Más cerca de 1 000 que de 900.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 995 a la centena más cercana.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 1 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- A4
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  '¿Cuál de los siguientes NO se redondea a 3 500 a la centena más cercana?',
  'ADVANCED','EQUATION','3 449','EQUATION_SINGLE_CHOICE',
  '{"choices":["3 449","3 480","3 520"],"answer":"3 449"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='¿Cuál de los siguientes NO se redondea a 3 500 a la centena más cercana?'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='¿Cuál de los siguientes NO se redondea a 3 500 a la centena más cercana?' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Recuerda: a 3 500 redondean [3 450 … 3 549].',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='¿Cuál de los siguientes NO se redondea a 3 500 a la centena más cercana?' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'3 449 queda fuera del rango [3 450, 3 549].',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='¿Cuál de los siguientes NO se redondea a 3 500 a la centena más cercana?' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Por eso NO se redondea a 3 500; los otros sí.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);

-- A5
WITH lo AS (SELECT id FROM learning_objectives WHERE code='LO.1.4.1' LIMIT 1)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
  'Redondea 5 000 al millar más cercano.',
  'ADVANCED','EQUATION','5 000','EQUATION_SINGLE_CHOICE',
  '{"choices":["4 000","5 000","6 000"],"answer":"5 000"}'::jsonb,
  TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM lo) AND NOT EXISTS(
  SELECT 1 FROM exercises e WHERE e.learning_objective_id=(SELECT id FROM lo)
  AND e.statement='Redondea 5 000 al millar más cercano.'
);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 000 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),'Ya es múltiplo de 1 000, no cambia.',1,(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM hints h WHERE h.exercise_id=(SELECT id FROM ex));
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 000 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),1,'5 000 está exactamente en un millar.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=1);
WITH ex AS (SELECT id FROM exercises WHERE statement='Redondea 5 000 al millar más cercano.' AND template_type='EQUATION_SINGLE_CHOICE' LIMIT 1)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),2,'Resultado: 5 000.',(SELECT id FROM ex),TRUE,'seed','seed',now(),now()
WHERE EXISTS(SELECT 1 FROM ex) AND NOT EXISTS(SELECT 1 FROM solution_steps s WHERE s.exercise_id=(SELECT id FROM ex) AND s.step_number=2);
