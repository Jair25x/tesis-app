-- ============================================================
-- R__c6_exercises_basic.sql
-- C.6 – CUADRADOS Y RECTÁNGULOS (4.º)
--
-- Nivel: BASIC
-- LOs cubiertos:
--   LO.6.1.1 – Propiedades de cuadrados y rectángulos
--   LO.6.2.1 – Construcción y resolución de problemas con figuras rectangulares
--
-- 7 ejercicios BASIC por LO (total: 14).
-- Plantilla principal:
--   - EQUATION_SINGLE_CHOICE (MCQ conceptual)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.6.1.1 – Propiedades de cuadrados y rectángulos
-- 7 ejercicios BASIC
------------------------------------------------------------

-- B1 — Figura con 4 lados iguales y 4 ángulos rectos
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
       '¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?',
       'BASIC','EQUATION',
       'A) Un cuadrado',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Un cuadrado",
            "B) Un rectángulo cualquiera",
            "C) Un triángulo"
          ],
          "answer": "A) Un cuadrado"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?'
  );

-- B2 — Propiedad verdadera para todo rectángulo
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
       '¿Cuál afirmación es verdadera para todo rectángulo?',
       'BASIC','EQUATION',
       'B) Tiene dos pares de lados opuestos paralelos y cuatro ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Tiene cuatro lados iguales y cuatro ángulos rectos.",
            "B) Tiene dos pares de lados opuestos paralelos y cuatro ángulos rectos.",
            "C) Tiene solo tres ángulos rectos."
          ],
          "answer": "B) Tiene dos pares de lados opuestos paralelos y cuatro ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál afirmación es verdadera para todo rectángulo?'
  );

-- B3 — Propiedad común entre cuadrado y rectángulo
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
       '¿Qué tienen en común un cuadrado y un rectángulo?',
       'BASIC','EQUATION',
       'B) Los cuatro ángulos son rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Los cuatro lados siempre son diferentes.",
            "B) Los cuatro ángulos son rectos.",
            "C) Solo tienen un ángulo recto."
          ],
          "answer": "B) Los cuatro ángulos son rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué tienen en común un cuadrado y un rectángulo?'
  );

-- B4 — Cuadrilátero con 4 lados iguales y ángulos rectos
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
       'Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?',
       'BASIC','EQUATION',
       'B) Cuadrado',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Rectángulo",
            "B) Cuadrado",
            "C) Trapecio"
          ],
          "answer": "B) Cuadrado"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?'
  );

-- B5 — Número de lados largos en un rectángulo
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
       'Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?',
       'BASIC','EQUATION',
       'B) Dos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Uno",
            "B) Dos",
            "C) Cuatro"
          ],
          "answer": "B) Dos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?'
  );

-- B6 — Lados de un cuadrado
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
       'En un cuadrado, ¿cómo son sus lados?',
       'BASIC','EQUATION',
       'C) Los cuatro lados son iguales.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Dos lados iguales y dos diferentes.",
            "B) Tres lados iguales y uno diferente.",
            "C) Los cuatro lados son iguales."
          ],
          "answer": "C) Los cuatro lados son iguales."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un cuadrado, ¿cómo son sus lados?'
  );

-- B7 — Tipo de ángulos en un rectángulo
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
       'En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?',
       'BASIC','EQUATION',
       'B) Ángulos rectos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulos agudos",
            "B) Ángulos rectos",
            "C) Ángulos obtusos"
          ],
          "answer": "B) Ángulos rectos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?'
  );

------------------------------------------------------------
-- LO.6.2.1 – Construcción y problemas con cuadrados/rectángulos
-- 7 ejercicios BASIC
------------------------------------------------------------

-- B8 — Otra base del rectángulo
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
       'Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?',
       'BASIC','EQUATION',
       'B) 5 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 cm",
            "B) 5 cm",
            "C) 8 cm"
          ],
          "answer": "B) 5 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?'
  );

-- B9 — Lados de un cuadrado con lado conocido
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
       'Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?',
       'BASIC','EQUATION',
       'B) 6 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 3 cm",
            "B) 6 cm",
            "C) 12 cm"
          ],
          "answer": "B) 6 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?'
  );

-- B10 — Perímetro de un cuadrado a partir del perímetro
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
       'El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?',
       'BASIC','EQUATION',
       'B) 5 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 4 cm",
            "B) 5 cm",
            "C) 10 cm"
          ],
          "answer": "B) 5 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?'
  );

-- B11 — Perímetro de un rectángulo 4 x 2
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
       'Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?',
       'BASIC','EQUATION',
       'C) 12 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 cm",
            "B) 10 cm",
            "C) 12 cm"
          ],
          "answer": "C) 12 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?'
  );

-- B12 — Expresión correcta de perímetro 7 x 3
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
       '¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?',
       'BASIC','EQUATION',
       'C) 2 x (7 + 3)',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 7 + 3",
            "B) 7 x 3",
            "C) 2 x (7 + 3)"
          ],
          "answer": "C) 2 x (7 + 3)"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?'
  );

-- B13 — Lados cortos de un rectángulo 9 x 4
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
       'En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?',
       'BASIC','EQUATION',
       'B) Dos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Uno",
            "B) Dos",
            "C) Cuatro"
          ],
          "answer": "B) Dos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?'
  );

-- B14 — Ángulos de un rectángulo
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
       'Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?',
       'BASIC','EQUATION',
       'A) También son rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) También son rectos.",
            "B) Son agudos.",
            "C) Son obtusos."
          ],
          "answer": "A) También son rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?'
  );

------------------------------------------------------------
-- HINTS C.6 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?',
     'Recuerda que un cuadrado tiene sus cuatro lados del mismo tamaño.'),
    ('¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?',
     'Además de tener lados iguales, el cuadrado tiene cuatro ángulos rectos.'),

    ('¿Cuál afirmación es verdadera para todo rectángulo?',
     'En un rectángulo, los lados opuestos son paralelos y los ángulos son rectos.'),
    ('¿Cuál afirmación es verdadera para todo rectángulo?',
     'No todos los rectángulos tienen los cuatro lados iguales, pero sí cuatro ángulos rectos.'),

    ('¿Qué tienen en común un cuadrado y un rectángulo?',
     'Piensa en los ángulos de ambas figuras.'),
    ('¿Qué tienen en común un cuadrado y un rectángulo?',
     'Tanto el cuadrado como el rectángulo tienen cuatro ángulos de 90 grados.'),

    ('Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?',
     'Si todos los lados miden lo mismo y hay cuatro ángulos rectos, se parece a un cuadrado.'),
    ('Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?',
     'Un rectángulo tiene ángulos rectos, pero no siempre tiene los cuatro lados iguales.'),

    ('Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?',
     'En un rectángulo, los lados opuestos tienen la misma medida.'),
    ('Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?',
     'Cuenta cuántos lados son del lado más largo.'),

    ('En un cuadrado, ¿cómo son sus lados?',
     'Un cuadrado es un caso especial de rectángulo con todos sus lados iguales.'),
    ('En un cuadrado, ¿cómo son sus lados?',
     'Imagina un cuadrado en tu cuaderno: todos los lados se ven del mismo largo.'),

    ('En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?',
     'Un ángulo de 90 grados se llama ángulo recto.'),
    ('En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?',
     'Piensa en la esquina de tu cuaderno: es un ángulo recto.'),

    -- LO.6.2.1 – Construcción y problemas con figuras rectangulares
    ('Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?',
     'En un rectángulo, las dos bases tienen la misma medida.'),
    ('Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?',
     'Piensa en el lado que está frente a la base: debe medir lo mismo.'),

    ('Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?',
     'En un cuadrado, todos los lados son iguales.'),
    ('Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?',
     'Si un lado mide 6 cm, los demás también miden 6 cm.'),

    ('El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?',
     'El perímetro de un cuadrado es la suma de sus cuatro lados iguales.'),
    ('El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?',
     'Divide 20 entre 4 para encontrar la medida de cada lado.'),

    ('Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?',
     'El perímetro es la suma de todos los lados del rectángulo.'),
    ('Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?',
     'Suma 4 + 2 + 4 + 2 o usa 2 x (4 + 2).'),

    ('¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?',
     'El perímetro del rectángulo se puede calcular con 2 x (largo + ancho).'),
    ('¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?',
     'Primero suma 7 y 3, luego multiplica el resultado por 2.'),

    ('En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?',
     'En un rectángulo hay dos lados largos y dos lados cortos.'),
    ('En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?',
     'Piensa en el par de lados que tienen la misma medida de 4 cm.'),

    ('Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?',
     'En un rectángulo, todos los ángulos son iguales.'),
    ('Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?',
     'Si uno mide 90 grados y la figura es un rectángulo, los demás también miden 90 grados.')
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
-- SOLUTION_STEPS C.6 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?',1,
     'Identifica la figura que tiene todos sus lados del mismo tamaño y cuatro ángulos de 90 grados.'),
    ('¿Cuál de estas figuras tiene cuatro lados iguales y cuatro ángulos rectos?',2,
     'Esa descripción corresponde a un cuadrado, por eso la respuesta correcta es "Un cuadrado".'),

    ('¿Cuál afirmación es verdadera para todo rectángulo?',1,
     'Recuerda que en un rectángulo los lados opuestos son paralelos y los ángulos son rectos.'),
    ('¿Cuál afirmación es verdadera para todo rectángulo?',2,
     'La afirmación que menciona dos pares de lados opuestos paralelos y cuatro ángulos rectos es la opción B.'),

    ('¿Qué tienen en común un cuadrado y un rectángulo?',1,
     'Piensa en la medida de los ángulos: en ambas figuras cada ángulo mide 90 grados.'),
    ('¿Qué tienen en común un cuadrado y un rectángulo?',2,
     'Ambas figuras tienen cuatro ángulos rectos, por eso la opción correcta es la B.'),

    ('Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?',1,
     'Compara la descripción con las propiedades del cuadrado y del rectángulo.'),
    ('Un cuadrilátero tiene lados de 4 cm, 4 cm, 4 cm y 4 cm y todos sus ángulos son rectos. ¿Cómo se llama esta figura?',2,
     'Como tiene cuatro lados iguales y ángulos rectos, es un cuadrado; la respuesta es la opción B.'),

    ('Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?',1,
     'En un rectángulo, los lados opuestos tienen la misma medida.'),
    ('Un rectángulo tiene lados de 6 cm y 3 cm. ¿Cuántos lados miden 6 cm?',2,
     'Hay dos lados de 6 cm (los más largos), así que la respuesta correcta es "Dos".'),

    ('En un cuadrado, ¿cómo son sus lados?',1,
     'Recuerda que el cuadrado es un rectángulo especial con todos sus lados iguales.'),
    ('En un cuadrado, ¿cómo son sus lados?',2,
     'Los cuatro lados miden lo mismo, por eso la opción correcta es "Los cuatro lados son iguales".'),

    ('En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?',1,
     'Un ángulo de 90 grados se llama ángulo recto.'),
    ('En un rectángulo, los ángulos miden 90 grados. ¿Cómo se llaman estos ángulos?',2,
     'Como los ángulos del rectángulo miden 90 grados, se llaman ángulos rectos; la respuesta es la B.'),

    -- LO.6.2.1 – Construcción y problemas con figuras rectangulares
    ('Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?',1,
     'En un rectángulo, las dos bases son lados opuestos y tienen la misma medida.'),
    ('Un rectángulo tiene base de 5 cm y altura de 3 cm. ¿Cuánto mide la otra base?',2,
     'Si una base mide 5 cm, la otra base también mide 5 cm, así que la respuesta es la opción B.'),

    ('Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?',1,
     'Todos los lados del cuadrado son iguales entre sí.'),
    ('Un cuadrado tiene un lado que mide 6 cm. ¿Cuánto mide cada uno de sus otros lados?',2,
     'Si un lado mide 6 cm, cada uno de los otros lados también mide 6 cm; la respuesta es 6 cm.'),

    ('El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?',1,
     'El perímetro es la suma de los cuatro lados iguales del cuadrado.'),
    ('El perímetro de un cuadrado es 20 cm. ¿Cuánto mide cada lado?',2,
     'Divide 20 entre 4: 20 ÷ 4 = 5, así que cada lado mide 5 cm.'),

    ('Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?',1,
     'Suma todos los lados: 4 + 2 + 4 + 2 o usa la fórmula 2 x (4 + 2).'),
    ('Un rectángulo tiene lados de 4 cm y 2 cm. ¿Cuál es su perímetro?',2,
     '4 + 2 + 4 + 2 = 12, por eso el perímetro es 12 cm y la respuesta correcta es la opción C.'),

    ('¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?',1,
     'Recuerda que el perímetro del rectángulo se calcula con 2 x (largo + ancho).'),
    ('¿Cuál de las siguientes expresiones permite calcular el perímetro de un rectángulo de 7 cm de largo y 3 cm de ancho?',2,
     'Sustituye: 2 x (7 + 3) = 2 x 10, por eso la expresión correcta es la opción C.'),

    ('En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?',1,
     'Los lados opuestos que no miden 9 cm son los lados más cortos de 4 cm.'),
    ('En un rectángulo, un lado mide 9 cm y su lado opuesto también. El otro par de lados mide 4 cm cada uno. ¿Cuántos lados miden 4 cm?',2,
     'Hay dos lados de 4 cm (el otro par de lados opuestos), por eso la respuesta es "Dos".'),

    ('Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?',1,
     'En cualquier rectángulo, todos los ángulos son iguales.'),
    ('Un rectángulo tiene un ángulo recto. ¿Qué podemos decir de los otros tres ángulos?',2,
     'Si uno es recto y la figura es un rectángulo, los otros también son rectos; la respuesta correcta es la opción A.')
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
-- RESUMEN LOG C.6 BASIC (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'BASIC') AS exercises_c6_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'BASIC') AS hints_c6_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'BASIC') AS steps_c6_basic;
