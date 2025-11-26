-- ============================================================
-- R__c5_exercises_basic.sql
-- C.5 – ÁNGULOS (4.º)
--
-- Nivel: BASIC
-- LOs cubiertos:
--   LO.5.1.1 – Identificación de ángulos
--   LO.5.2.1 – Medición y construcción de ángulos
--   LO.5.3.1 – Giros y direcciones
--
-- 5 ejercicios BASIC por LO (total: 15).
-- Plantilla usada: EQUATION_SINGLE_CHOICE (MCQ sencilla).
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.5.1.1 – Identificación de ángulos
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B1 — Tipo de ángulo 90°
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué tipo de ángulo es uno que mide exactamente 90°?',
       'BASIC','EQUATION',
       'B) Ángulo recto',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulo agudo",
            "B) Ángulo recto",
            "C) Ángulo obtuso"
          ],
          "answer": "B) Ángulo recto"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué tipo de ángulo es uno que mide exactamente 90°?'
  );

-- B2 — Ejemplo de ángulo agudo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes es un ejemplo de ángulo agudo?',
       'BASIC','EQUATION',
       'A) 30°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30°",
            "B) 90°",
            "C) 150°"
          ],
          "answer": "A) 30°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes es un ejemplo de ángulo agudo?'
  );

-- B3 — Ejemplo de ángulo obtuso
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de los siguientes es un ángulo obtuso?',
       'BASIC','EQUATION',
       'C) 120°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 40°",
            "B) 90°",
            "C) 120°"
          ],
          "answer": "C) 120°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes es un ángulo obtuso?'
  );

-- B4 — Ángulo llano en contexto
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?',
       'BASIC','EQUATION',
       'A) Ángulo llano (180°)',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulo llano (180°)",
            "B) Ángulo recto (90°)",
            "C) Ángulo completo (360°)"
          ],
          "answer": "A) Ángulo llano (180°)"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?'
  );

-- B5 — Ángulo en el reloj a las 3 en punto
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?',
       'BASIC','EQUATION',
       'B) Ángulo recto',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulo agudo",
            "B) Ángulo recto",
            "C) Ángulo obtuso"
          ],
          "answer": "B) Ángulo recto"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?'
  );

------------------------------------------------------------
-- LO.5.2.1 – Medición y construcción de ángulos
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B6 — Medida de un ángulo recto
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?',
       'BASIC','EQUATION',
       'C) 90°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 45°",
            "B) 60°",
            "C) 90°"
          ],
          "answer": "C) 90°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?'
  );

-- B7 — Suma de 60° y 30°
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?',
       'BASIC','EQUATION',
       'C) 90°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 70°",
            "B) 80°",
            "C) 90°"
          ],
          "answer": "C) 90°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?'
  );

-- B8 — Tres giros de 30°
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?',
       'BASIC','EQUATION',
       'B) 90°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 60°",
            "B) 90°",
            "C) 120°"
          ],
          "answer": "B) 90°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?'
  );

-- B9 — Interpretar 45° con el transportador
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?',
       'BASIC','EQUATION',
       'B) Es menor que un ángulo recto.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Es mayor que un ángulo recto.",
            "B) Es menor que un ángulo recto.",
            "C) Es igual a un ángulo recto."
          ],
          "answer": "B) Es menor que un ángulo recto."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?'
  );

-- B10 — Dividir un ángulo recto en 3 partes
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?',
       'BASIC','EQUATION',
       'B) 30°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 20°",
            "B) 30°",
            "C) 60°"
          ],
          "answer": "B) 30°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?'
  );

------------------------------------------------------------
-- LO.5.3.1 – Giros y direcciones
-- 5 ejercicios BASIC
------------------------------------------------------------

-- B11 — Un cuarto de vuelta desde el norte
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
       'BASIC','EQUATION',
       'A) Este',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Este",
            "B) Oeste",
            "C) Sur"
          ],
          "answer": "A) Este"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?'
  );

-- B12 — Medio giro en grados
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un medio giro equivale a...',
       'BASIC','EQUATION',
       'B) 180°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 90°",
            "B) 180°",
            "C) 360°"
          ],
          "answer": "B) 180°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un medio giro equivale a...'
  );

-- B13 — Tres cuartos de vuelta desde el este
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?',
       'BASIC','EQUATION',
       'C) Norte',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Sur",
            "B) Oeste",
            "C) Norte"
          ],
          "answer": "C) Norte"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?'
  );

-- B14 — Giro completo en grados
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuántos grados tiene un giro completo?',
       'BASIC','EQUATION',
       'C) 360°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 90°",
            "B) 180°",
            "C) 360°"
          ],
          "answer": "C) 360°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuántos grados tiene un giro completo?'
  );

-- B15 — Dos cuartos de vuelta
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.5.3.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?',
       'BASIC','EQUATION',
       'B) Media vuelta',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Un cuarto de vuelta",
            "B) Media vuelta",
            "C) Tres cuartos de vuelta"
          ],
          "answer": "B) Media vuelta"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?'
  );

------------------------------------------------------------
-- HINTS C.5 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('¿Qué tipo de ángulo es uno que mide exactamente 90°?',
     'Recuerda que el ángulo recto se parece a la esquina de una hoja de papel.'),
    ('¿Qué tipo de ángulo es uno que mide exactamente 90°?',
     'Un ángulo recto forma una “L” y su medida es 90°.'),

    ('¿Cuál de los siguientes es un ejemplo de ángulo agudo?',
     'Un ángulo agudo mide menos de 90°.'),
    ('¿Cuál de los siguientes es un ejemplo de ángulo agudo?',
     'Compara cada medida con 90° y elige la que sea menor.'),

    ('¿Cuál de los siguientes es un ángulo obtuso?',
     'Los ángulos obtusos son más abiertos que un ángulo recto.'),
    ('¿Cuál de los siguientes es un ángulo obtuso?',
     'Busca la medida que sea mayor que 90° pero menor que 180°.'),

    ('Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?',
     'Cuando el camino queda como una línea recta, se forma un ángulo llano.'),
    ('Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?',
     'Un ángulo llano mide 180°.'),

    ('Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?',
     'Piensa en la posición de las manecillas: forman una especie de “L”.'),
    ('Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?',
     'Esa “L” es un ejemplo de ángulo recto.'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?',
     'El ángulo recto es la referencia más conocida del transportador.'),
    ('Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?',
     'Busca la medida que coincide con la marca especial de 90°.'),

    ('Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?',
     'Suma los 60° con los 30° para encontrar la medida total.'),
    ('Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?',
     'Piensa si el resultado se parece a la medida de un ángulo recto.'),

    ('Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?',
     'Si repites 30° tres veces, estás sumando 30° + 30° + 30°.'),    
    ('Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?',
     'Compara el resultado con las opciones dadas.'),

    ('Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?',
     'Un ángulo recto mide 90°; compáralo con los 45° que observas.'),
    ('Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?',
     '45° es la mitad de 90°, por eso es más pequeño que un ángulo recto.'),

    ('Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?',
     'Recuerda que un ángulo recto mide 90°.'),
    ('Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?',
     'Divide 90 entre 3 para saber cuántos grados tiene cada parte.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Piensa en la brújula: norte, este, sur y oeste en orden.'),
    ('Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Un cuarto de vuelta a la derecha desde el norte te lleva al este.'),

    ('Un medio giro equivale a...',
     'Un giro completo tiene 360°.'),    
    ('Un medio giro equivale a...',
     'La mitad de 360° es 180°.'),

    ('Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?',
     'Desde el este, un cuarto de vuelta a la derecha te lleva al sur.'),
    ('Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?',
     'Sigue girando mentalmente hasta completar los tres cuartos de vuelta.'),

    ('¿Cuántos grados tiene un giro completo?',
     'Es el giro que te deja mirando en la misma dirección de inicio.'),
    ('¿Cuántos grados tiene un giro completo?',
     'En el transportador, un giro completo se representa con 360°.'),

    ('Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?',
     'Cada cuarto de vuelta equivale a 90°.'),    
    ('Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?',
     'Dos cuartos de vuelta son 90° + 90°, es decir, una media vuelta.')
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
-- SOLUTION_STEPS C.5 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('¿Qué tipo de ángulo es uno que mide exactamente 90°?',1,
     'Se recuerda que un ángulo que mide exactamente 90° se llama ángulo recto.'),
    ('¿Qué tipo de ángulo es uno que mide exactamente 90°?',2,
     'Se elige la opción que nombra al ángulo recto, es decir, "Ángulo recto".'),

    ('¿Cuál de los siguientes es un ejemplo de ángulo agudo?',1,
     'Un ángulo agudo mide menos de 90°, por lo que hay que buscar la medida más pequeña.'),
    ('¿Cuál de los siguientes es un ejemplo de ángulo agudo?',2,
     '30° es menor que 90°, por eso 30° es un ángulo agudo y es la respuesta correcta.'),

    ('¿Cuál de los siguientes es un ángulo obtuso?',1,
     'Un ángulo obtuso es mayor que 90° y menor que 180°.'),    
    ('¿Cuál de los siguientes es un ángulo obtuso?',2,
     'Entre 40°, 90° y 120°, el que cumple esa condición es 120°, por eso es la respuesta.'),

    ('Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?',1,
     'Cuando el camino queda como una línea recta se ha formado un ángulo llano.'),
    ('Un camino gira hasta quedar en línea recta, apuntando en sentido contrario. ¿Qué tipo de ángulo se forma?',2,
     'El ángulo llano mide 180°, por eso se elige "Ángulo llano (180°)".'),

    ('Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?',1,
     'La posición de las manecillas a las 3 forma una figura parecida a una "L".'),
    ('Cuando las manecillas de un reloj marcan las 3 en punto, ¿qué tipo de ángulo se forma entre ellas?',2,
     'Esa forma corresponde a un ángulo recto, por eso se elige "Ángulo recto".'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?',1,
     'Se recuerda que el ángulo recto siempre mide 90°.'),    
    ('Un ángulo recto mide 90°. ¿Cuál de las siguientes medidas corresponde a un ángulo recto?',2,
     'Entre 45°, 60° y 90°, la medida correcta es 90°, por eso esa es la respuesta.'),

    ('Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?',1,
     'Se suman los 60° con los 30°: 60° + 30°.'),    
    ('Si un ángulo mide 60° y lo aumentamos 30°, ¿cuál es su nueva medida?',2,
     'El resultado es 90°, que es la nueva medida del ángulo.'),

    ('Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?',1,
     'Se suman tres veces 30°: 30° + 30° + 30°.'),    
    ('Se trazan tres giros seguidos de 30° en el mismo sentido. ¿Cuántos grados suma el ángulo total?',2,
     'La suma es 90°, por eso la respuesta correcta es 90°.'),

    ('Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?',1,
     'Se compara 45° con 90°, que es la medida de un ángulo recto.'),    
    ('Al medir con el transportador, un ángulo marca 45°. ¿Qué afirmación es correcta?',2,
     'Como 45° es menor que 90°, el ángulo es menor que un ángulo recto, por eso esa afirmación es verdadera.'),

    ('Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?',1,
     'Primero se recuerda que un ángulo recto mide 90°.'),    
    ('Un ángulo recto se divide en 3 partes iguales. ¿Cuántos grados mide cada parte?',2,
     'Se calcula 90° ÷ 3 = 30°, así que cada parte mide 30°.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',1,
     'Un cuarto de vuelta corresponde a 90°, es decir, cambiar a la siguiente dirección en la brújula.'),    
    ('Si estás mirando hacia el norte y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',2,
     'Desde el norte, un cuarto de vuelta a la derecha lleva al este, por eso la respuesta es "Este".'),

    ('Un medio giro equivale a...',1,
     'Se sabe que un giro completo es de 360°.'),    
    ('Un medio giro equivale a...',2,
     'La mitad de 360° es 180°, por eso un medio giro equivale a 180°.'),

    ('Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?',1,
     'Se avanza un cuarto de vuelta a la derecha desde el este hacia el sur, luego al oeste y finalmente al norte.'),    
    ('Si estás mirando hacia el este y giras tres cuartos de vuelta a la derecha, ¿hacia dónde quedas mirando?',2,
     'Después de tres cuartos de vuelta a la derecha desde el este se llega al norte, por eso la respuesta es "Norte".'),

    ('¿Cuántos grados tiene un giro completo?',1,
     'Un giro completo es dar toda la vuelta y regresar a la misma dirección.'),    
    ('¿Cuántos grados tiene un giro completo?',2,
     'Esa vuelta completa corresponde a 360°, por eso esa es la respuesta correcta.'),

    ('Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?',1,
     'Cada cuarto de vuelta equivale a 90°, así que dos cuartos de vuelta suman 90° + 90°.'),    
    ('Si giras dos cuartos de vuelta en el mismo sentido, ¿qué tipo de giro realizas?',2,
     '90° + 90° = 180°, que corresponde a una media vuelta, por eso la respuesta es "Media vuelta".')
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
-- RESUMEN LOG C.5 BASIC (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'BASIC') AS exercises_c5_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'BASIC') AS hints_c5_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'BASIC') AS steps_c5_basic;
