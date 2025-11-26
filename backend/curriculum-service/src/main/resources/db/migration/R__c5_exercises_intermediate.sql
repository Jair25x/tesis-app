-- ============================================================
-- R__c5_exercises_intermediate.sql
-- C.5 – ÁNGULOS (4.º)
--
-- Nivel: INTERMEDIATE
-- LOs cubiertos:
--   LO.5.1.1 – Identificación de ángulos
--   LO.5.2.1 – Medición y construcción de ángulos
--   LO.5.3.1 – Giros y direcciones
--
-- 5 ejercicios INTERMEDIATE por LO (total: 15).
-- Plantillas usadas:
--   - EQUATION_SINGLE_CHOICE (MCQ)
--   - NUMBER_SEQUENCE_QA (secuencias de giros en grados)
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.5.1.1 – Identificación de ángulos
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I1 — Clasificar 45°, 90° y 135°
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
       'Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?',
       'INTERMEDIATE','EQUATION',
       'A) 45° agudo, 90° recto, 135° obtuso',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 45° agudo, 90° recto, 135° obtuso",
            "B) 45° obtuso, 90° recto, 135° agudo",
            "C) 45° recto, 90° obtuso, 135° agudo"
          ],
          "answer": "A) 45° agudo, 90° recto, 135° obtuso"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?'
  );

-- I2 — Clasificar 110°
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
       'Un ángulo mide 110°. ¿Cómo se clasifica?',
       'INTERMEDIATE','EQUATION',
       'C) Ángulo obtuso',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulo agudo",
            "B) Ángulo recto",
            "C) Ángulo obtuso"
          ],
          "answer": "C) Ángulo obtuso"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo mide 110°. ¿Cómo se clasifica?'
  );

-- I3 — Lista de solo ángulos agudos
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
       '¿Cuál de las siguientes listas contiene solo ángulos agudos?',
       'INTERMEDIATE','EQUATION',
       'A) 30°, 50°, 70°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30°, 50°, 70°",
            "B) 30°, 90°, 100°",
            "C) 45°, 120°, 60°"
          ],
          "answer": "A) 30°, 50°, 70°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes listas contiene solo ángulos agudos?'
  );

-- I4 — Comparar ángulos de 80° y 160°
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
       'En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?',
       'INTERMEDIATE','EQUATION',
       'B) A es agudo y B es obtuso.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) A es obtuso y B es agudo.",
            "B) A es agudo y B es obtuso.",
            "C) Ambos son ángulos agudos."
          ],
          "answer": "B) A es agudo y B es obtuso."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?'
  );

-- I5 — Ángulo más abierto y obtuso
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
       '¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?',
       'INTERMEDIATE','EQUATION',
       'B) 95°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 60°",
            "B) 95°",
            "C) 180°"
          ],
          "answer": "B) 95°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?'
  );

------------------------------------------------------------
-- LO.5.2.1 – Medición y construcción de ángulos
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I6 — Faltante para llegar a ángulo recto
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
       'Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?',
       'INTERMEDIATE','EQUATION',
       'B) 55°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 45°",
            "B) 55°",
            "C) 60°"
          ],
          "answer": "B) 55°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?'
  );

-- I7 — Suma de dos ángulos: 40° y 50°
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
       'Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?',
       'INTERMEDIATE','EQUATION',
       'B) 90°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 80°",
            "B) 90°",
            "C) 100°"
          ],
          "answer": "B) 90°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?'
  );

-- I8 — Faltante para llegar a 180° desde 130°
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
       'Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?',
       'INTERMEDIATE','EQUATION',
       'C) 50°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 40°",
            "B) 45°",
            "C) 50°"
          ],
          "answer": "C) 50°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?'
  );

-- I9 — Dividir 180° en 4 partes
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
       'Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?',
       'INTERMEDIATE','EQUATION',
       'B) 45°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30°",
            "B) 45°",
            "C) 60°"
          ],
          "answer": "B) 45°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?'
  );

-- I10 — Complementario de 70° para sumar 180°
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
       'La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?',
       'INTERMEDIATE','EQUATION',
       'C) 110°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 90°",
            "B) 100°",
            "C) 110°"
          ],
          "answer": "C) 110°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?'
  );

------------------------------------------------------------
-- LO.5.3.1 – Giros y direcciones
-- 5 ejercicios INTERMEDIATE
------------------------------------------------------------

-- I11 — Medio giro desde el norte
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
       'Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?',
       'INTERMEDIATE','EQUATION',
       'C) Sur',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Este",
            "B) Oeste",
            "C) Sur"
          ],
          "answer": "C) Sur"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?'
  );

-- I12 — Un cuarto de vuelta desde el sur
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
       'Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
       'INTERMEDIATE','EQUATION',
       'B) Oeste',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Este",
            "B) Oeste",
            "C) Norte"
          ],
          "answer": "B) Oeste"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?'
  );

-- I13 — Dos cuartos de vuelta desde el este
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
       'Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?',
       'INTERMEDIATE','EQUATION',
       'B) Oeste',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Norte",
            "B) Oeste",
            "C) Sur"
          ],
          "answer": "B) Oeste"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?'
  );

-- I14 — Secuencia de giros de 90°
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
       'Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [0, 90, 180, null, 360],
          "rule": "giros de 90 grados",
          "missingIndex": 3,
          "answer": 270
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.'
  );

-- I15 — Secuencia de ángulos cada 45°
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
       'Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.',
       'INTERMEDIATE','QA',
       NULL,
       'NUMBER_SEQUENCE_QA',
       '{
          "sequence": [45, 90, 135, null, 225],
          "rule": "aumenta de 45 en 45 grados",
          "missingIndex": 3,
          "answer": 180
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1 FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.'
  );

------------------------------------------------------------
-- HINTS C.5 INTERMEDIATE (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'INTERMEDIATE'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?',
     'Recuerda: menor que 90° es agudo, igual a 90° es recto y mayor que 90° pero menor que 180° es obtuso.'),
    ('Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?',
     'Clasifica cada medida por separado y luego busca la opción que coincide con las tres.'),

    ('Un ángulo mide 110°. ¿Cómo se clasifica?',
     'Compara 110° con 90° y con 180° para decidir si es agudo, recto u obtuso.'),
    ('Un ángulo mide 110°. ¿Cómo se clasifica?',
     'Un ángulo obtuso es más abierto que un ángulo recto, pero no llega a 180°.'),

    ('¿Cuál de las siguientes listas contiene solo ángulos agudos?',
     'Los ángulos agudos son todos los que miden menos de 90°.'),    
    ('¿Cuál de las siguientes listas contiene solo ángulos agudos?',
     'Revisa cada lista y descarta la que tenga un ángulo de 90° o más.'),

    ('En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?',
     'Primero clasifica 80° y luego 160° usando la idea de agudo, recto, obtuso o llano.'),    
    ('En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?',
     '80° es menor que 90°, y 160° es mayor que 90° pero menor que 180°.'),

    ('¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?',
     'Busca una medida mayor que 90° pero menor que 180°.'),    
    ('¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?',
     'Compara 60°, 95° y 180° con las definiciones de agudo, obtuso y llano.'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?',
     'Un ángulo recto mide 90°. Piensa cuánto debes sumar a 35° para llegar a 90°.'),    
    ('Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?',
     'Resta 35 de 90 para encontrar los grados que faltan.'),

    ('Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?',
     'Cuando dos ángulos se colocan uno tras otro, sus medidas se suman.'),    
    ('Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?',
     'Suma 40° y 50° y compara con la medida de un ángulo recto.'),

    ('Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?',
     'Un ángulo llano mide 180°. Debes ver cuánto falta desde 130° hasta 180°.'),    
    ('Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?',
     'Resta 130 a 180 para encontrar la diferencia.'),

    ('Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?',
     'Un ángulo llano mide 180°. Si se divide en 4 partes iguales, debes repartir los 180° en 4.'),    
    ('Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?',
     'Calcula 180 ÷ 4 para conocer la medida de cada parte.'),

    ('La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?',
     'Si los dos ángulos suman 180°, el segundo se obtiene restando 70° a 180°.'),    
    ('La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?',
     'Haz la resta 180° − 70° y luego busca ese resultado en las opciones.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Medio giro equivale a 180°, es decir, mirar al lado contrario.'),    
    ('Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Desde el norte, el lado contrario en la brújula es el sur.'),

    ('Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Un cuarto de vuelta corresponde a 90° y te mueve a la siguiente dirección en la brújula.'),    
    ('Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',
     'Desde el sur, al girar a la derecha pasas a mirar hacia el oeste.'),

    ('Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?',
     'Cada cuarto de vuelta a la derecha equivale a 90° en el mismo sentido del reloj.'),    
    ('Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?',
     'Desde el este, un cuarto de vuelta a la derecha lleva al sur, y otro más lleva al oeste.'),

    ('Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.',
     'Observa cuánto aumenta cada vez la secuencia de ángulos.'),    
    ('Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.',
     'Cada paso suma 90°. Después de 180° viene 270° y luego 360°.'),

    ('Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.',
     'Fíjate en la diferencia entre cada par de medidas consecutivas.'),    
    ('Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.',
     'Cada vez se suman 45°. Suma 45 a 135 para encontrar el número que falta.')
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
-- SOLUTION_STEPS C.5 INTERMEDIATE (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'INTERMEDIATE'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?',1,
     'Se compara cada medida con 90°: 45° es menor que 90° (agudo), 90° es igual a 90° (recto) y 135° es mayor que 90° pero menor que 180° (obtuso).'),
    ('Se tienen estos ángulos: 45°, 90° y 135°. ¿Cuál opción clasifica correctamente cada uno?',2,
     'Se elige la opción que dice 45° agudo, 90° recto y 135° obtuso, que corresponde a la alternativa A.'),

    ('Un ángulo mide 110°. ¿Cómo se clasifica?',1,
     'Se compara 110° con 90° y 180°: 110° es mayor que 90° y menor que 180°.'),    
    ('Un ángulo mide 110°. ¿Cómo se clasifica?',2,
     'Como es mayor que 90° pero no llega a 180°, se trata de un ángulo obtuso, que es la alternativa C.'),

    ('¿Cuál de las siguientes listas contiene solo ángulos agudos?',1,
     'Se revisa cada lista y se verifica que todas las medidas sean menores que 90°.'),    
    ('¿Cuál de las siguientes listas contiene solo ángulos agudos?',2,
     'En la lista A todos los ángulos (30°, 50°, 70°) son menores que 90°, por eso es la respuesta correcta.'),

    ('En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?',1,
     'Se clasifica 80°: es menor que 90°, entonces es un ángulo agudo.'),    
    ('En un dibujo, el ángulo A mide 80° y el ángulo B mide 160°. ¿Qué afirmación es correcta?',2,
     'Se clasifica 160°: es mayor que 90° y menor que 180°, por lo que es obtuso; por eso la opción correcta es que A es agudo y B es obtuso.'),

    ('¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?',1,
     'Se comparan 60°, 95° y 180°: 60° es agudo, 95° es mayor que 90° y 180° es un ángulo llano.'),    
    ('¿Cuál de los siguientes ángulos es más abierto y también es un ángulo obtuso?',2,
     'El único que cumple ser obtuso es 95°, por eso la opción correcta es la B.'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?',1,
     'Se recuerda que un ángulo recto mide 90° y se calcula la diferencia 90° − 35°.'),    
    ('Un ángulo mide 35°. ¿Cuántos grados le faltan para convertirse en un ángulo recto?',2,
     'La diferencia es 55°, así que faltan 55° para llegar a 90°, correspondiente a la opción B.'),

    ('Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?',1,
     'Se suman las medidas de los dos ángulos: 40° + 50°.'),    
    ('Dos ángulos miden 40° y 50°. Si se colocan uno a continuación del otro, ¿cuál es la medida del ángulo que forman juntos?',2,
     'La suma es 90°, por lo que el ángulo resultante mide 90° y corresponde a la opción B.'),

    ('Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?',1,
     'Se calcula la diferencia 180° − 130°.'),    
    ('Un ángulo mide 130°. ¿Cuántos grados le faltan para llegar a un ángulo llano de 180°?',2,
     'La diferencia es 50°, por eso faltan 50° y la alternativa correcta es la C.'),

    ('Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?',1,
     'Se divide 180° entre 4 para repartir la medida en partes iguales.'),    
    ('Un ángulo llano de 180° se divide en 4 partes iguales. ¿Cuántos grados mide cada parte?',2,
     '180° ÷ 4 = 45°, así que cada parte mide 45°, que es la opción B.'),

    ('La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?',1,
     'Se resta 70° a 180° para encontrar la medida del segundo ángulo.'),    
    ('La suma de dos ángulos es 180°. Si uno mide 70°, ¿cuánto mide el otro ángulo?',2,
     '180° − 70° = 110°, así que el otro ángulo mide 110°, que corresponde a la opción C.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?',1,
     'Medio giro equivale a girar 180°, es decir, mirar en la dirección contraria.'),    
    ('Si estás mirando hacia el norte y giras medio giro a la derecha, ¿hacia qué punto cardinal quedas mirando?',2,
     'La dirección contraria al norte es el sur, por eso la respuesta correcta es sur.'),

    ('Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',1,
     'Un cuarto de vuelta equivale a 90°. Se avanza a la siguiente dirección en el sentido del giro.'),    
    ('Si estás mirando hacia el sur y giras un cuarto de vuelta a la derecha, ¿hacia qué punto cardinal quedas mirando?',2,
     'Desde el sur, al girar a la derecha se pasa a mirar hacia el oeste, por eso la opción correcta es oeste.'),

    ('Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?',1,
     'Cada cuarto de vuelta a la derecha equivale a 90° en el mismo sentido, así que se avanza de este a sur y luego a oeste.'),    
    ('Estás mirando hacia el este. Giras un cuarto de vuelta a la derecha y luego otro cuarto de vuelta a la derecha. ¿Hacia dónde quedas mirando?',2,
     'Después de dos cuartos de vuelta a la derecha, se termina mirando hacia el oeste, por eso la respuesta es la opción B.'),

    ('Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.',1,
     'Se observa la secuencia: de 0° a 90° aumenta 90°, y de 90° a 180° también aumenta 90°.'),    
    ('Secuencia de giros: 0°, 90°, 180°, __, 360°. Escribe la medida que falta.',2,
     'Si se sigue sumando 90°, después de 180° viene 270° y luego 360°, así que la medida que falta es 270°.'),

    ('Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.',1,
     'Se calcula la diferencia entre cada término: de 45° a 90° y de 90° a 135° siempre se suman 45°.'),    
    ('Secuencia de ángulos: 45°, 90°, 135°, __, 225°. Escribe la medida que falta.',2,
     'Se suma 45° a 135° y se obtiene 180°, así que la medida faltante es 180°.')
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
-- RESUMEN LOG C.5 INTERMEDIATE (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'INTERMEDIATE') AS exercises_c5_intermediate,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'INTERMEDIATE') AS hints_c5_intermediate,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'INTERMEDIATE') AS steps_c5_intermediate;
