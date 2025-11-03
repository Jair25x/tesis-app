-- Seed repeatable: Currículo 4.º con los mismos 3 ejercicios (para compatibilidad FE)
-- Estrategia: insertar por code + NOT EXISTS por statement; auditoría mínima 'seed'.

-- 1) CURR
INSERT INTO curricula (id, code, name, description, grade, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'CURR-MATH-4', 'Currículo de Matemática - Cuarto grado',
       'MVP – Ejemplos para 3 plantillas (seed repeatable)', '4', TRUE, 'seed', 'seed', now(), now()
ON CONFLICT (code) DO NOTHING;

-- 2) COMPETENCIES
WITH curr AS (SELECT id FROM curricula WHERE code = 'CURR-MATH-4' LIMIT 1)
INSERT INTO competencies (id, code, name, description, active, curriculum_id,
                          created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'C.1', 'BIENVENIDOS', 'Tablas y totales', TRUE, (SELECT id FROM curr), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'C.2', 'CANTIDAD Y OPERACIONES', 'Multiplicación en contextos reales', TRUE, (SELECT id FROM curr), 'seed','seed', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 3) STANDARDS
WITH c1 AS (SELECT id FROM competencies WHERE code = 'C.1'),
     c2 AS (SELECT id FROM competencies WHERE code = 'C.2')
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'S.1.1', 'Ficha 1: Juntamos las tablas', 'Organizar y representar datos en tablas.', TRUE, (SELECT id FROM c1), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'S.2.1', 'Ficha 2: Candados y decenas', 'Aplicar multiplicación con unidades de medida y valor posicional.', TRUE, (SELECT id FROM c2), 'seed','seed', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 4) LEARNING OBJECTIVES
WITH s11 AS (SELECT id FROM standards WHERE code = 'S.1.1'),
     s21 AS (SELECT id FROM standards WHERE code = 'S.2.1')
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'LO.1.1.1', 'Analizar tablas de frecuencia', 'Interpretar tablas con datos estadísticos simples.', TRUE, (SELECT id FROM s11), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'LO.2.1.1', 'Resolver problemas con multiplicación', 'Usar operaciones para resolver problemas sobre cantidades.', TRUE, (SELECT id FROM s21), 'seed','seed', now(), now())
ON CONFLICT (code) DO NOTHING;

-- 5) EXERCISES + HINTS + STEPS
-- A) FREQUENCY_TABLE_QA (LO.1.1.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises (id, statement, difficulty, type, correct_answer, template_type, parameters,
                       active, is_diagnostic, learning_objective_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),
       'Observa la tabla y responde.',
       'BASIC',
       'TABLE_QA',
       NULL,
       'FREQUENCY_TABLE_QA',
       '{
          "columns":["Actividad","Frecuencia"],
          "rows":[
            {"actividad":"Ajedrez","frecuencia":10},
            {"actividad":"Cantar","frecuencia":12},
            {"actividad":"Bailar","frecuencia":8},
            {"actividad":"Otras","frecuencia":5}
          ],
          "questions":[
            {"id":"q1","kind":"single_choice","prompt":"¿Cuál es la moda?","options":["Ajedrez","Cantar","Bailar","Otras"],"answer":"Cantar"},
            {"id":"q2","kind":"numeric","prompt":"¿Total de estudiantes?","answer":35}
          ]
        }'::jsonb,
       TRUE, FALSE, (SELECT id FROM lo),
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id = (SELECT id FROM lo)
    AND e.statement = 'Observa la tabla y responde.'
);

-- Hint para A)
WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Observa la tabla y responde.' LIMIT 1
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'La moda es el mayor valor de la columna Frecuencia.', 1, (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM hints h WHERE h.exercise_id = (SELECT id FROM ex)
    AND h.hint_text = 'La moda es el mayor valor de la columna Frecuencia.'
);

-- B) EQUATION_SINGLE_CHOICE (LO.2.1.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.2.1.1')
INSERT INTO exercises (id, statement, difficulty, type, correct_answer, template_type, parameters,
                       active, is_diagnostic, learning_objective_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),
       'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?',
       'BASIC',
       'CHOICE',
       NULL,
       'EQUATION_SINGLE_CHOICE',
       '{
          "a":90,
          "b":18,
          "choices":["S/ 180.00","S/ 1620.00","S/ 1800.00"],
          "answer":"S/ 1620.00"
        }'::jsonb,
       TRUE, FALSE, (SELECT id FROM lo),
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id = (SELECT id FROM lo)
    AND e.statement = 'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?'
);

-- Hints + Steps para B)
WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?'
  LIMIT 1
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'Primero halla la cantidad total de candados.', 1, (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM hints h WHERE h.exercise_id = (SELECT id FROM ex)
    AND h.hint_text = 'Primero halla la cantidad total de candados.'
);

WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?'
  LIMIT 1
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'Multiplica la cantidad por el precio unitario.', 2, (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM hints h WHERE h.exercise_id = (SELECT id FROM ex)
    AND h.hint_text = 'Multiplica la cantidad por el precio unitario.'
);

WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?'
  LIMIT 1
)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 1, '9 cajas x 10 = 90 candados.', (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM solution_steps s WHERE s.exercise_id = (SELECT id FROM ex)
    AND s.step_number = 1 AND s.explanation = '9 cajas x 10 = 90 candados.'
);

WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Eliana compró 9 cajas con 10 candados cada una. Cada candado se venderá a S/ 18. ¿Cuánto dinero recibirá Eliana?'
  LIMIT 1
)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 2, '90 x 18 = S/ 1620.00.', (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM solution_steps s WHERE s.exercise_id = (SELECT id FROM ex)
    AND s.step_number = 2 AND s.explanation = '90 x 18 = S/ 1620.00.'
);

-- C) FREQUENCY_TABLE_COMPLETE (LO.2.1.1)
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.2.1.1')
INSERT INTO exercises (id, statement, difficulty, type, correct_answer, template_type, parameters,
                       active, is_diagnostic, learning_objective_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),
       'Completa el dato faltante indicando el total de personas que realizan estas actividades.',
       'BASIC',
       'TABLE_COMPLETE',
       NULL,
       'FREQUENCY_TABLE_COMPLETE',
       '{
          "columns":["Actividad","Frecuencia"],
          "rows":[
            {"actividad":"Ajedrez","frecuencia":14},
            {"actividad":"Cantar","frecuencia":11},
            {"actividad":"Bailar","frecuencia":10},
            {"actividad":"Otras","frecuencia":5}
          ],
          "missing":[{"cell":"total","answer":40}]
        }'::jsonb,
       TRUE, FALSE, (SELECT id FROM lo),
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.learning_objective_id = (SELECT id FROM lo)
    AND e.statement = 'Completa el dato faltante indicando el total de personas que realizan estas actividades.'
);

-- Hint para C)
WITH ex AS (
  SELECT id FROM exercises
  WHERE statement = 'Completa el dato faltante indicando el total de personas que realizan estas actividades.'
  LIMIT 1
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'Suma todas las frecuencias.', 1, (SELECT id FROM ex), TRUE,
       'seed','seed', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM hints h WHERE h.exercise_id = (SELECT id FROM ex)
    AND h.hint_text = 'Suma todas las frecuencias.'
);
