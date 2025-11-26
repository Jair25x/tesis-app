-- ============================================================
-- R__c6_exercises_intermediate.sql
-- C.6 – CUADRADOS Y RECTÁNGULOS (4.º)
--
-- Nivel: INTERMEDIATE
-- LOs cubiertos:
--   LO.6.1.1 – Propiedades de cuadrados y rectángulos
--   LO.6.2.1 – Construcción y resolución de problemas con figuras rectangulares
--
-- 7 ejercicios INTERMEDIATE por LO (total: 14).
-- Plantilla principal:
--   - EQUATION_SINGLE_CHOICE (MCQ conceptual / con cálculo sencillo)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.6.1.1 – Propiedades de cuadrados y rectángulos
-- 7 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I1 — Descripción correcta de cuadrado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes descripciones corresponde a un cuadrado?',
       'INTERMEDIATE','EQUATION',
       'A) Cuadrilátero con cuatro lados iguales y cuatro ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Cuadrilátero con cuatro lados iguales y cuatro ángulos rectos.",
            "B) Cuadrilátero con solo dos lados iguales y cuatro ángulos rectos.",
            "C) Cuadrilátero con cuatro lados diferentes."
          ],
          "answer": "A) Cuadrilátero con cuatro lados iguales y cuatro ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes descripciones corresponde a un cuadrado?'
  );

-- I2 — Descripción de rectángulo que no es cuadrado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?',
       'INTERMEDIATE','EQUATION',
       'B) Tiene dos lados de 6 cm y dos lados de 4 cm, todos los ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Tiene cuatro lados iguales y cuatro ángulos rectos.",
            "B) Tiene dos lados de 6 cm y dos lados de 4 cm, todos los ángulos rectos.",
            "C) Tiene tres lados iguales y un lado diferente."
          ],
          "answer": "B) Tiene dos lados de 6 cm y dos lados de 4 cm, todos los ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?'
  );

-- I3 — Clasificación de cuadrilátero 5,5,8,8 con ángulos rectos
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?',
       'INTERMEDIATE','EQUATION',
       'B) Rectángulo',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Cuadrado",
            "B) Rectángulo",
            "C) Triángulo"
          ],
          "answer": "B) Rectángulo"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?'
  );

-- I4 — Por qué no es rectángulo si lados no son por pares
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?',
       'INTERMEDIATE','EQUATION',
       'B) Porque en un rectángulo los lados opuestos deben medir lo mismo.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Porque un rectángulo no tiene ángulos rectos.",
            "B) Porque en un rectángulo los lados opuestos deben medir lo mismo.",
            "C) Porque un rectángulo debe tener lados curvos."
          ],
          "answer": "B) Porque en un rectángulo los lados opuestos deben medir lo mismo."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?'
  );

-- I5 — Afirmación verdadera sobre lados de un rectángulo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué afirmación es verdadera sobre los lados de un rectángulo?',
       'INTERMEDIATE','EQUATION',
       'B) Los lados opuestos de un rectángulo tienen la misma medida.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Todos los lados de un rectángulo siempre son iguales.",
            "B) Los lados opuestos de un rectángulo tienen la misma medida.",
            "C) Solo un lado de un rectángulo es más largo que los otros."
          ],
          "answer": "B) Los lados opuestos de un rectángulo tienen la misma medida."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué afirmación es verdadera sobre los lados de un rectángulo?'
  );

-- I6 — Inferir todos los lados del cuadrado a partir de uno
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?',
       'INTERMEDIATE','EQUATION',
       'B) Todos los lados del cuadrado miden 7 cm.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Dos lados miden 7 cm y los otros dos miden otra cantidad.",
            "B) Todos los lados del cuadrado miden 7 cm.",
            "C) Solo un lado mide 7 cm."
          ],
          "answer": "B) Todos los lados del cuadrado miden 7 cm."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?'
  );

-- I7 — Propiedad común entre cuadrado y rectángulo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?',
       'INTERMEDIATE','EQUATION',
       'A) Ambos tienen cuatro lados y cuatro ángulos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ambos tienen cuatro lados y cuatro ángulos.",
            "B) En los dos todas las longitudes de lados son siempre iguales.",
            "C) En los dos siempre hay ángulos agudos."
          ],
          "answer": "A) Ambos tienen cuatro lados y cuatro ángulos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?'
  );

------------------------------------------------------------
-- LO.6.2.1 – Construcción y problemas con cuadrados/rectángulos
-- 7 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I8 — Perímetro dado y lado corto conocido
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?',
       'INTERMEDIATE','EQUATION',
       'B) 6 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 cm",
            "B) 6 cm",
            "C) 9 cm"
          ],
          "answer": "B) 6 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?'
  );

-- I9 — Perímetro de un cuadrado y lado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?',
       'INTERMEDIATE','EQUATION',
       'B) 6 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 cm",
            "B) 6 cm",
            "C) 8 cm"
          ],
          "answer": "B) 6 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?'
  );

-- I10 — Completar lado opuesto en rectángulo 5 x 3 (cuadritos)
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?',
       'INTERMEDIATE','EQUATION',
       'B) 5 cuadritos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 cuadritos",
            "B) 5 cuadritos",
            "C) 8 cuadritos"
          ],
          "answer": "B) 5 cuadritos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?'
  );

-- I11 — Componer dos rectángulos iguales y medir lado largo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?',
       'INTERMEDIATE','EQUATION',
       'C) 14 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7 cm",
            "B) 9 cm",
            "C) 14 cm"
          ],
          "answer": "C) 14 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?'
  );

-- I12 — Lado faltante en rectángulo con tres lados conocidos
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?',
       'INTERMEDIATE','EQUATION',
       'B) 6 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 cm",
            "B) 6 cm",
            "C) 8 cm"
          ],
          "answer": "B) 6 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?'
  );

-- I13 — Ángulo faltante en rectángulo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?',
       'INTERMEDIATE','EQUATION',
       'A) 90 grados',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 90 grados",
            "B) 45 grados",
            "C) 180 grados"
          ],
          "answer": "A) 90 grados"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?'
  );

-- I14 — Área sencilla de cuadrado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.6.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?',
       'INTERMEDIATE','EQUATION',
       'C) 16 cm2',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 8 cm2",
            "B) 12 cm2",
            "C) 16 cm2"
          ],
          "answer": "C) 16 cm2"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?'
  );

------------------------------------------------------------
-- HINTS C.6 INTERMEDIATE (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('¿Cuál de las siguientes descripciones corresponde a un cuadrado?',
     'Piensa en una figura con cuatro lados del mismo tamaño y cuatro esquinas rectas.'),
    ('¿Cuál de las siguientes descripciones corresponde a un cuadrado?',
     'El cuadrado es un rectángulo especial que tiene todos sus lados iguales.'),

    ('¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?',
     'Un rectángulo que no es cuadrado tiene dos lados de una medida y dos de otra, pero mantiene los ángulos rectos.'),
    ('¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?',
     'Busca la opción donde hay dos pares de lados iguales y ángulos rectos, pero no los cuatro lados iguales.'),

    ('Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?',
     'Si hay dos pares de lados iguales y todos los ángulos son rectos, la figura se parece a un rectángulo.'),
    ('Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?',
     'No puede ser cuadrado porque no todos los lados miden lo mismo.'),

    ('Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?',
     'En un rectángulo, los lados opuestos deben ser iguales en medida.'),
    ('Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?',
     'Observa que no hay dos lados opuestos que midan 5 cm, por eso no cumple la condición de rectángulo.'),

    ('¿Qué afirmación es verdadera sobre los lados de un rectángulo?',
     'Piensa en la forma típica de un rectángulo: tiene dos lados largos y dos lados cortos.'),
    ('¿Qué afirmación es verdadera sobre los lados de un rectángulo?',
     'En un rectángulo, cada lado largo tiene enfrente otro lado largo de la misma medida.'),

    ('En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?',
     'En un cuadrado, todos los lados tienen la misma longitud.'),
    ('En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?',
     'Si un lado mide 7 cm, los cuatro lados deben medir 7 cm.'),

    ('Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?',
     'Recuerda que tanto el cuadrado como el rectángulo son cuadriláteros.'),
    ('Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?',
     'Ambas figuras tienen cuatro lados y cuatro ángulos.'),

    -- LO.6.2.1 – Construcción y problemas con figuras rectangulares
    ('Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?',
     'El perímetro es la suma de todos los lados del rectángulo.'),
    ('Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?',
     'Resta del perímetro los dos lados cortos y reparte lo que queda entre los dos lados largos.'),

    ('El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?',
     'El perímetro de un cuadrado es cuatro veces la medida de un lado.'),
    ('El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?',
     'Divide 24 entre 4 para encontrar cuánto mide cada lado.'),

    ('Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?',
     'En un rectángulo, los lados opuestos tienen la misma medida.'),
    ('Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?',
     'El lado que está enfrente al de 5 cuadritos debe medir también 5 cuadritos.'),

    ('Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?',
     'Imagina dos rectángulos de 7 cm por 2 cm puestos uno al lado del otro sobre el lado de 7 cm.'),
    ('Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?',
     'La parte larga ahora está formada por 7 cm más 7 cm.'),

    ('Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?',
     'En un rectángulo, los lados opuestos son iguales.'),
    ('Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?',
     'Si ya aparecen dos lados de 4 cm, el lado que falta debe ser igual al de 6 cm.'),

    ('En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?',
     'En un rectángulo, todos los ángulos son iguales.'),
    ('En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?',
     'Si ya tres miden 90 grados y la figura es un rectángulo, el cuarto también debe medir 90 grados.'),

    ('Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?',
     'El área de un cuadrado se calcula multiplicando lado por lado.'),
    ('Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?',
     'Multiplica 4 por 4 para encontrar el área en unidades cuadradas.')
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
-- SOLUTION_STEPS C.6 INTERMEDIATE (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('¿Cuál de las siguientes descripciones corresponde a un cuadrado?',1,
     'Revisa cada descripción y busca la que tenga cuatro lados iguales y cuatro ángulos rectos.'),
    ('¿Cuál de las siguientes descripciones corresponde a un cuadrado?',2,
     'La opción A menciona cuatro lados iguales y cuatro ángulos rectos, que son las características de un cuadrado.'),

    ('¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?',1,
     'Para que sea rectángulo debe tener cuatro ángulos rectos; para que no sea cuadrado, no debe tener los cuatro lados iguales.'),
    ('¿Cuál de las siguientes descripciones corresponde a un rectángulo que no es cuadrado?',2,
     'La opción B tiene dos lados de 6 cm y dos de 4 cm, todos con ángulos rectos, por eso es un rectángulo que no es cuadrado.'),

    ('Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?',1,
     'Hay dos pares de lados iguales y todos los ángulos son rectos, lo que coincide con un rectángulo.'),
    ('Un cuadrilátero tiene dos lados de 5 cm y dos lados de 8 cm, y todos sus ángulos son rectos. ¿Qué tipo de figura es?',2,
     'Como no todos los lados son iguales, no es cuadrado; la respuesta correcta es rectángulo.'),

    ('Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?',1,
     'En un rectángulo los lados opuestos deben tener la misma longitud.'),
    ('Un cuadrilátero tiene cuatro ángulos rectos pero sus lados miden 3 cm, 3 cm, 3 cm y 5 cm. ¿Por qué no puede ser un rectángulo?',2,
     'Aquí solo un lado mide 5 cm y ningún lado opuesto mide lo mismo, por eso no cumple la propiedad de los rectángulos.'),

    ('¿Qué afirmación es verdadera sobre los lados de un rectángulo?',1,
     'Piensa en los lados enfrentados: el lado de arriba es igual al de abajo y el de la izquierda es igual al de la derecha.'),
    ('¿Qué afirmación es verdadera sobre los lados de un rectángulo?',2,
     'Esto significa que los lados opuestos tienen la misma medida, tal como dice la opción B.'),

    ('En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?',1,
     'El cuadrado tiene los cuatro lados del mismo tamaño.'),
    ('En un cuadrado, un lado mide 7 cm. ¿Cuál afirmación es correcta?',2,
     'Si un lado mide 7 cm, todos los lados miden 7 cm, por eso la opción correcta es la B.'),

    ('Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?',1,
     'El cuadrado y el rectángulo son cuadriláteros, es decir, tienen cuatro lados.'),
    ('Si comparamos un cuadrado y un rectángulo, ¿qué es siempre igual en los dos?',2,
     'Ambos tienen cuatro lados y cuatro ángulos, por eso la opción correcta es la A.'),

    -- LO.6.2.1 – Construcción y problemas con figuras rectangulares
    ('Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?',1,
     'Escribe el perímetro como suma de todos los lados: 18 = lado largo + lado largo + 3 + 3.'),
    ('Un rectángulo tiene perímetro de 18 cm. Sus lados cortos miden 3 cm cada uno. ¿Cuánto mide cada lado largo?',2,
     'Suma los lados cortos: 3 + 3 = 6. Resta 18 - 6 = 12 y reparte entre dos lados largos: 12 ÷ 2 = 6. Cada lado largo mide 6 cm.'),

    ('El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?',1,
     'El perímetro del cuadrado es 4 veces la medida de un lado.'),
    ('El perímetro de un cuadrado es 24 cm. ¿Cuánto mide cada lado?',2,
     'Calcula 24 ÷ 4 = 6, así que cada lado del cuadrado mide 6 cm.'),

    ('Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?',1,
     'En un rectángulo, el lado opuesto al de 5 cuadritos debe tener la misma medida.'),
    ('Ana dibuja un rectángulo con un lado de 5 cuadritos y el lado vecino de 3 cuadritos. ¿Cuánto debe medir el lado opuesto al de 5 cuadritos para que la figura sea un rectángulo?',2,
     'Por eso, el lado opuesto al de 5 cuadritos también mide 5 cuadritos; la respuesta correcta es la opción B.'),

    ('Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?',1,
     'Si pegas el segundo rectángulo sobre el lado largo de 7 cm, sumas 7 cm más 7 cm.'),
    ('Un rectángulo tiene lados de 7 cm y 2 cm. Si dibujamos otro igual pegado a uno de sus lados largos, ¿cuánto mide ahora el lado más largo de la nueva figura?',2,
     'El lado largo ahora mide 7 + 7 = 14 cm, así que la opción correcta es 14 cm.'),

    ('Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?',1,
     'Ya tienes dos lados de 4 cm, que son opuestos entre sí. El lado que falta debe ser opuesto al de 6 cm.'),
    ('Un rectángulo tiene tres lados conocidos: 4 cm, 6 cm y 4 cm. ¿Cuánto mide el lado que falta?',2,
     'El lado que falta es igual al de 6 cm, por eso la respuesta correcta es 6 cm.'),

    ('En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?',1,
     'En un rectángulo todos los ángulos son rectos.'),
    ('En un rectángulo, tres de sus ángulos miden 90 grados. ¿Cuánto mide el cuarto ángulo?',2,
     'Si ya tres ángulos miden 90 grados, el cuarto también debe medir 90 grados.'),

    ('Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?',1,
     'La fórmula del área del cuadrado es lado por lado.'),
    ('Un cuadrado tiene un lado que mide 4 cm. ¿Cuál es su área?',2,
     'Multiplica 4 x 4 = 16, así que el área del cuadrado es 16 cm2.')
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
-- RESUMEN LOG C.6 INTERMEDIATE (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS exercises_c6_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS hints_c6_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'INTERMEDIATE') AS steps_c6_intermediate;
