-- ============================================================
-- R__c6_exercises_advanced.sql
-- C.6 – CUADRADOS Y RECTÁNGULOS (4.º)
--
-- Nivel: ADVANCED
-- LOs cubiertos:
--   LO.6.1.1 – Propiedades de cuadrados y rectángulos
--   LO.6.2.1 – Construcción y resolución de problemas con figuras rectangulares
--
-- 7 ejercicios ADVANCED por LO (total: 14).
-- Plantilla:
--   - EQUATION_SINGLE_CHOICE (MCQ conceptual / con cálculo)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.6.1.1 – Propiedades de cuadrados y rectángulos
-- 7 ejercicios ADVANCED
------------------------------------------------------------

-- A1 — Relación cuadrado-rectángulo
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
       'Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?',
       'ADVANCED','EQUATION',
       'A) Es también un rectángulo, porque tiene cuatro lados y cuatro ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Es también un rectángulo, porque tiene cuatro lados y cuatro ángulos rectos.",
            "B) Es un triángulo, porque tiene tres lados iguales.",
            "C) No puede ser un rectángulo, porque todos sus lados son iguales."
          ],
          "answer": "A) Es también un rectángulo, porque tiene cuatro lados y cuatro ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?'
  );

-- A2 — Cuadrado clasificado también como rectángulo
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
       'Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?',
       'ADVANCED','EQUATION',
       'B) Como cuadrado y también como rectángulo.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Solo como cuadrado.",
            "B) Como cuadrado y también como rectángulo.",
            "C) Solo como rectángulo, pero no cuadrado."
          ],
          "answer": "B) Como cuadrado y también como rectángulo."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?'
  );

-- A3 — Figura que NO puede ser rectángulo
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
       '¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?',
       'ADVANCED','EQUATION',
       'C) Un ángulo recto, dos ángulos agudos y un ángulo obtuso.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Cuatro ángulos rectos y lados opuestos iguales.",
            "B) Cuatro ángulos rectos y cuatro lados iguales.",
            "C) Un ángulo recto, dos ángulos agudos y un ángulo obtuso."
          ],
          "answer": "C) Un ángulo recto, dos ángulos agudos y un ángulo obtuso."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?'
  );

-- A4 — Análisis de lados en rectángulo 4,9,4,9
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
       'En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?',
       'ADVANCED','EQUATION',
       'B) Es un rectángulo porque tiene dos pares de lados iguales y ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Es un cuadrado porque tiene cuatro ángulos rectos.",
            "B) Es un rectángulo porque tiene dos pares de lados iguales y ángulos rectos.",
            "C) No es cuadrilátero porque solo tiene tres lados."
          ],
          "answer": "B) Es un rectángulo porque tiene dos pares de lados iguales y ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?'
  );

-- A5 — Cuatro lados iguales pero sin todos los ángulos rectos
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
       'Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?',
       'ADVANCED','EQUATION',
       'C) No es ni cuadrado ni rectángulo.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Es un rectángulo.",
            "B) Es un cuadrado.",
            "C) No es ni cuadrado ni rectángulo."
          ],
          "answer": "C) No es ni cuadrado ni rectángulo."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?'
  );

-- A6 — Qué pasa con el otro par de lados en un rectángulo
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
       'En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?',
       'ADVANCED','EQUATION',
       'B) Los otros dos lados pueden tener otra medida, pero son iguales entre sí.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Los otros dos lados también deben medir 5 cm.",
            "B) Los otros dos lados pueden tener otra medida, pero son iguales entre sí.",
            "C) Los otros dos lados deben ser más cortos que 5 cm."
          ],
          "answer": "B) Los otros dos lados pueden tener otra medida, pero son iguales entre sí."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?'
  );

-- A7 — Propiedad común a todos los cuadrados y rectángulos
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
       '¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?',
       'ADVANCED','EQUATION',
       'A) Siempre tienen cuatro ángulos rectos.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Siempre tienen cuatro ángulos rectos.",
            "B) Siempre tienen todos los lados iguales.",
            "C) Siempre tienen al menos un ángulo agudo."
          ],
          "answer": "A) Siempre tienen cuatro ángulos rectos."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?'
  );

------------------------------------------------------------
-- LO.6.2.1 – Construcción y problemas con cuadrados/rectángulos
-- 7 ejercicios ADVANCED
------------------------------------------------------------

-- A8 — Perímetro de rectángulo 5 x 8
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
       'Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?',
       'ADVANCED','EQUATION',
       'A) 26 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 26 cm",
            "B) 40 cm",
            "C) 13 cm"
          ],
          "answer": "A) 26 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?'
  );

-- A9 — Área conocida, lado conocido (rectángulo)
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
       'El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?',
       'ADVANCED','EQUATION',
       'B) 8 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 cm",
            "B) 8 cm",
            "C) 12 cm"
          ],
          "answer": "B) 8 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?'
  );

-- A10 — Área de cuadrado → lado
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
       'Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?',
       'ADVANCED','EQUATION',
       'B) 7 cm',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 6 cm",
            "B) 7 cm",
            "C) 9 cm"
          ],
          "answer": "B) 7 cm"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?'
  );

-- A11 — Perímetro de rectángulo con lados largos conocidos
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
       'Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?',
       'ADVANCED','EQUATION',
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
      AND e.statement = 'Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?'
  );

-- A12 — Área en cuadritos 4 x 6
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
       'En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?',
       'ADVANCED','EQUATION',
       'B) 24 cuadritos',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 10 cuadritos",
            "B) 24 cuadritos",
            "C) 20 cuadritos"
          ],
          "answer": "B) 24 cuadritos"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?'
  );

-- A13 — Dos cuadrados pegados forman rectángulo
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
       'Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?',
       'ADVANCED','EQUATION',
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
      AND e.statement = 'Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?'
  );

-- A14 — Cerca alrededor de jardín rectangular
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
       'Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?',
       'ADVANCED','EQUATION',
       'B) 26 m',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 13 m",
            "B) 26 m",
            "C) 36 m"
          ],
          "answer": "B) 26 m"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?'
  );

------------------------------------------------------------
-- HINTS C.6 ADVANCED (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?',
     'Recuerda que un cuadrado tiene cuatro lados iguales y cuatro ángulos rectos.'),
    ('Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?',
     'Todo cuadrado cumple también las propiedades de un rectángulo.'),

    ('Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?',
     'Piensa primero en la definición de cuadrado y luego en la de rectángulo.'),
    ('Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?',
     'Si tiene cuatro lados iguales y cuatro ángulos rectos, es un cuadrado; y todo cuadrado es también rectángulo.'),

    ('¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?',
     'En un rectángulo, todos los ángulos deben ser rectos.'),
    ('¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?',
     'Busca la opción donde no aparecen cuatro ángulos rectos.'),

    ('En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?',
     'Observa que hay dos lados de 4 cm y dos lados de 9 cm.'),
    ('En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?',
     'Un rectángulo se caracteriza por tener lados opuestos de la misma medida y ángulos rectos.'),

    ('Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?',
     'Para ser cuadrado o rectángulo se necesitan cuatro ángulos rectos.'),
    ('Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?',
     'Aunque los lados sean iguales, si los ángulos no son rectos no es cuadrado ni rectángulo.'),

    ('En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?',
     'En un rectángulo, cada lado tiene otro lado enfrente de la misma medida.'),
    ('En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?',
     'El otro par de lados puede tener otra medida, pero también forma un par de lados opuestos iguales.'),

    ('¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?',
     'Piensa en qué tipo de ángulos tienen estas dos figuras.'),
    ('¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?',
     'Tanto el cuadrado como el rectángulo tienen cuatro ángulos rectos.'),

    -- LO.6.2.1 – Construcción y problemas con cuadrados/rectángulos
    ('Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?',
     'El perímetro es la suma de las medidas de todos los lados.'),
    ('Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?',
     'Suma 5 + 8 + 5 + 8 para obtener el perímetro.'),

    ('El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?',
     'El área del rectángulo se calcula multiplicando largo por ancho.'),
    ('El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?',
     'Piensa qué número multiplicado por 4 da 32.'),

    ('Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?',
     'El área del cuadrado es lado por lado.'),
    ('Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?',
     'Busca un número que multiplicado por sí mismo dé 49.'),

    ('Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?',
     'Escribe el perímetro como suma de todos los lados del rectángulo.'),
    ('Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?',
     'Resta del perímetro los dos lados largos y reparte lo que queda entre los dos lados cortos.'),

    ('En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?',
     'El área en cuadritos se obtiene multiplicando ancho por alto.'),
    ('En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?',
     'Multiplica 4 por 6 para obtener la cantidad de cuadritos.'),

    ('Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?',
     'Cada cuadrado tiene un lado de 3 cm; al pegarlos, ese lado se suma.'),
    ('Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?',
     'Suma 3 cm más 3 cm para hallar la medida del lado más largo.'),

    ('Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?',
     'La cerca debe rodear todo el jardín, es decir, cubrir el perímetro.'),
    ('Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?',
     'Suma 9 + 4 + 9 + 4 para obtener el perímetro del jardín.')
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
-- SOLUTION_STEPS C.6 ADVANCED (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.6.1.1 – Propiedades de cuadrados y rectángulos
    ('Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?',1,
     'Recuerda que el cuadrado tiene cuatro lados iguales y cuatro ángulos rectos, igual que un rectángulo.'),
    ('Si una figura es un cuadrado, ¿qué podemos decir con seguridad sobre ella?',2,
     'Como cumple todas las propiedades de un rectángulo, podemos decir que también es un rectángulo.'),

    ('Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?',1,
     'Tiene cuatro lados iguales, lo que coincide con un cuadrado. Además, tiene cuatro ángulos rectos.'),
    ('Un cuadrilátero tiene lados de 6 cm, 6 cm, 6 cm y 6 cm y todos sus ángulos son rectos. ¿Cómo se clasifica mejor esta figura?',2,
     'Es un cuadrado y, como todo cuadrado es también un rectángulo, la mejor clasificación es la opción B.'),

    ('¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?',1,
     'Un rectángulo debe tener cuatro ángulos rectos, es decir, todos de 90 grados.'),
    ('¿Cuál de las siguientes opciones describe una figura que NO puede ser un rectángulo?',2,
     'La opción C tiene ángulos agudos y obtusos, por eso no puede ser un rectángulo.'),

    ('En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?',1,
     'Observa que hay dos lados de 4 cm y dos lados de 9 cm; eso forma dos pares de lados opuestos iguales.'),
    ('En un rectángulo, los lados miden 4 cm, 9 cm, 4 cm y 9 cm. ¿Cuál afirmación es correcta?',2,
     'Una figura con dos pares de lados opuestos iguales y ángulos rectos es un rectángulo, por eso la opción correcta es la B.'),

    ('Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?',1,
     'Para ser cuadrado o rectángulo se necesitan cuatro ángulos rectos.'),
    ('Un cuadrilátero tiene cuatro lados iguales, pero sus ángulos no son todos rectos. ¿Qué podemos concluir?',2,
     'Aunque los lados sean iguales, sin ángulos rectos no es cuadrado ni rectángulo; por eso la respuesta es la C.'),

    ('En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?',1,
     'En un rectángulo, los lados opuestos son iguales en cada par.'),
    ('En un rectángulo, si un lado mide 5 cm y el lado que está enfrente también mide 5 cm, ¿qué podemos decir del otro par de lados?',2,
     'El otro par de lados también forma una pareja de lados opuestos iguales, aunque pueden medir distinto a 5 cm.'),

    ('¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?',1,
     'Tanto en el cuadrado como en el rectángulo todos los ángulos son de 90 grados.'),
    ('¿Cuál de estas afirmaciones es verdadera para todos los cuadrados y todos los rectángulos?',2,
     'Por eso, la afirmación correcta es que siempre tienen cuatro ángulos rectos.'),

    -- LO.6.2.1 – Construcción y problemas con cuadrados/rectángulos
    ('Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?',1,
     'Escribe el perímetro como suma de todos los lados: P = 5 + 8 + 5 + 8.'),
    ('Un rectángulo tiene lados de 5 cm y 8 cm. ¿Cuál es su perímetro?',2,
     'Calcula: 5 + 8 + 5 + 8 = 26 cm, así que el perímetro es 26 cm.'),

    ('El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?',1,
     'Usa la fórmula del área: A = lado1 x lado2. Aquí 32 = 4 x lado2.'),
    ('El área de un rectángulo es 32 cm2 y uno de sus lados mide 4 cm. ¿Cuánto mide el otro lado?',2,
     'Resuelve 32 ÷ 4 = 8, por eso el otro lado mide 8 cm.'),

    ('Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?',1,
     'En un cuadrado, el área se obtiene multiplicando lado por lado: A = lado x lado.'),
    ('Un cuadrado tiene área 49 cm2. ¿Cuánto mide cada lado?',2,
     'Busca un número que multiplicado por sí mismo sea 49: 7 x 7 = 49, por eso cada lado mide 7 cm.'),

    ('Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?',1,
     'Escribe el perímetro como suma: 30 = 10 + 10 + lado corto + lado corto.'),
    ('Un rectángulo tiene perímetro 30 cm. Sus lados largos miden 10 cm cada uno. ¿Cuánto mide cada lado corto?',2,
     'Suma los lados largos: 10 + 10 = 20. Resta 30 − 20 = 10 y reparte entre dos lados cortos: 10 ÷ 2 = 5 cm.'),

    ('En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?',1,
     'El área del rectángulo se calcula multiplicando ancho por alto.'),
    ('En una cuadrícula, Laura dibuja un rectángulo de 4 cuadritos de ancho y 6 cuadritos de alto. ¿Cuántos cuadritos ocupa el área del rectángulo?',2,
     'Multiplica 4 x 6 = 24, así que el rectángulo ocupa 24 cuadritos.'),

    ('Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?',1,
     'Al pegar dos cuadrados por un lado, las longitudes de ese lado se suman.'),
    ('Un rectángulo se forma uniendo dos cuadrados iguales de lado 3 cm, pegados uno al lado del otro. ¿Cuánto mide el lado más largo del rectángulo?',2,
     'Suma 3 cm + 3 cm = 6 cm, por eso el lado más largo mide 6 cm.'),

    ('Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?',1,
     'La cerca debe cubrir el perímetro: suma todos los lados del jardín.'),
    ('Un jardín rectangular mide 9 m de largo y 4 m de ancho. Se quiere poner una cerca alrededor. ¿Cuántos metros de cerca se necesitan?',2,
     'Calcula 9 + 4 + 9 + 4 = 26, así que se necesitan 26 metros de cerca.')
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
-- RESUMEN LOG C.6 ADVANCED (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'ADVANCED') AS exercises_c6_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'ADVANCED') AS hints_c6_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.6.1.1','LO.6.2.1')
     AND e.difficulty = 'ADVANCED') AS steps_c6_advanced;
