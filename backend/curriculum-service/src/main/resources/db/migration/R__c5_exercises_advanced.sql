-- ============================================================
-- R__c5_exercises_advanced.sql
-- C.5 – ÁNGULOS (4.º)
--
-- Nivel: ADVANCED
-- LOs cubiertos:
--   LO.5.1.1 – Identificación de ángulos
--   LO.5.2.1 – Medición y construcción de ángulos
--   LO.5.3.1 – Giros y direcciones
--
-- 5 ejercicios ADVANCED por LO (total: 15).
-- Plantilla principal:
--   - EQUATION_SINGLE_CHOICE
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.5.1.1 – Identificación de ángulos
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A1 — Clasificar 30°, 90° y 150°
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
       'Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?',
       'ADVANCED','EQUATION',
       'A) 30° agudo, 90° recto, 150° obtuso',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30° agudo, 90° recto, 150° obtuso",
            "B) 30° recto, 90° obtuso, 150° agudo",
            "C) 30° agudo, 90° obtuso, 150° llano"
          ],
          "answer": "A) 30° agudo, 90° recto, 150° obtuso"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?'
  );

-- A2 — Ángulo entre 45° y 90°
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
       'Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?',
       'ADVANCED','EQUATION',
       'B) 60°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30°",
            "B) 60°",
            "C) 120°"
          ],
          "answer": "B) 60°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?'
  );

-- A3 — Ángulo “un poco más abierto que un recto”
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
       'Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?',
       'ADVANCED','EQUATION',
       'B) 100°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 80°",
            "B) 100°",
            "C) 45°"
          ],
          "answer": "B) 100°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?'
  );

-- A4 — Clasificar 180°
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
       'Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?',
       'ADVANCED','EQUATION',
       'C) Ángulo llano',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Ángulo recto",
            "B) Ángulo completo",
            "C) Ángulo llano"
          ],
          "answer": "C) Ángulo llano"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?'
  );

-- A5 — Afirmación correcta sobre tipos de ángulo
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
       '¿Cuál de las siguientes afirmaciones es correcta?',
       'ADVANCED','EQUATION',
       'B) Un ángulo recto mide exactamente 90°.',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Todo ángulo obtuso mide menos de 90°.",
            "B) Un ángulo recto mide exactamente 90°.",
            "C) Un ángulo agudo mide más de 180°."
          ],
          "answer": "B) Un ángulo recto mide exactamente 90°."
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes afirmaciones es correcta?'
  );

------------------------------------------------------------
-- LO.5.2.1 – Medición y construcción de ángulos
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A6 — Suma de 40°, 50° y 60°
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
       'Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?',
       'ADVANCED','EQUATION',
       'C) 150°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 130°",
            "B) 140°",
            "C) 150°"
          ],
          "answer": "C) 150°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?'
  );

-- A7 — Duplicar un ángulo de 65°
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
       'Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?',
       'ADVANCED','EQUATION',
       'B) 130°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 100°",
            "B) 130°",
            "C) 165°"
          ],
          "answer": "B) 130°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?'
  );

-- A8 — Ángulo llano más un ángulo agudo (210°)
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
       'Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?',
       'ADVANCED','EQUATION',
       'A) 30°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 30°",
            "B) 40°",
            "C) 60°"
          ],
          "answer": "A) 30°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?'
  );

-- A9 — Faltante desde 135° hasta giro completo
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
       'Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?',
       'ADVANCED','EQUATION',
       'C) 225°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 200°",
            "B) 215°",
            "C) 225°"
          ],
          "answer": "C) 225°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?'
  );

-- A10 — Dividir 360° en 8 partes
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
       'Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?',
       'ADVANCED','EQUATION',
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
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?'
  );

------------------------------------------------------------
-- LO.5.3.1 – Giros y direcciones
-- 5 ejercicios ADVANCED
------------------------------------------------------------

-- A11 — Norte → 1/4 vuelta derecha + 1/2 vuelta derecha
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
       'Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?',
       'ADVANCED','EQUATION',
       'B) Oeste',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Sur",
            "B) Oeste",
            "C) Este"
          ],
          "answer": "B) Oeste"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?'
  );

-- A12 — Oeste → 3/4 de vuelta a la izquierda
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
       'Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?',
       'ADVANCED','EQUATION',
       'C) Norte',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Sur",
            "B) Este",
            "C) Norte"
          ],
          "answer": "C) Norte"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?'
  );

-- A13 — Este → 1/2 vuelta a la izquierda
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
       'Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?',
       'ADVANCED','EQUATION',
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
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?'
  );

-- A14 — Tres cuartos de vuelta en grados
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
       'Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?',
       'ADVANCED','EQUATION',
       'B) 270°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) 180°",
            "B) 270°",
            "C) 360°"
          ],
          "answer": "B) 270°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?'
  );

-- A15 — Cuatro cuartos de vuelta seguidos
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
       'Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?',
       'ADVANCED','EQUATION',
       'C) Un giro completo de 360°',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) Medio giro",
            "B) Tres cuartos de giro",
            "C) Un giro completo de 360°"
          ],
          "answer": "C) Un giro completo de 360°"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?'
  );

------------------------------------------------------------
-- HINTS C.5 ADVANCED (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'ADVANCED'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?',
     'Recuerda: menor que 90° es agudo, igual a 90° es recto y mayor que 90° pero menor que 180° es obtuso.'),
    ('Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?',
     'Clasifica primero cada ángulo por separado y luego busca la opción que coincide con los tres.'),

    ('Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?',
     'Piensa en qué medidas son menores que 90° y cuáles son mayores que 45°.'),    
    ('Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?',
     'Descarta las medidas menores o iguales a 45° y también las que son de 90° o más.'),

    ('Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?',
     'Un ángulo recto mide 90°. “Un poco más abierto” significa un poco mayor que 90°.'),    
    ('Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?',
     'Compara 80°, 100° y 45° con 90° para decidir cuál es apenas mayor.'),

    ('Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?',
     'Recuerda el nombre de los ángulos según su medida: 90° recto, 180° llano y 360° completo.'),    
    ('Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?',
     'Piensa en un ángulo que parece una línea recta y el nombre que recibe.'),

    ('¿Cuál de las siguientes afirmaciones es correcta?',
     'Lee cada afirmación y compárala con las definiciones de ángulo agudo, recto, obtuso y llano.'),    
    ('¿Cuál de las siguientes afirmaciones es correcta?',
     'Recuerda que el ángulo recto es el que usamos para representar la esquina perfecta de 90°.'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?',
     'Cuando se unen ángulos uno a continuación del otro, sus medidas se suman.'),    
    ('Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?',
     'Suma 40°, 50° y 60° con cuidado y luego busca el resultado en las opciones.'),

    ('Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?',
     'Es como repetir el mismo ángulo dos veces; debes sumar la misma medida dos veces.'),    
    ('Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?',
     'Calcula 65° + 65° y revisa cuál opción coincide con el resultado.'),

    ('Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?',
     'Si el ángulo total es la suma del llano (180°) y el agudo, piensa cuánto debes agregar a 180° para llegar a 210°.'),    
    ('Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?',
     'Resta 180° a 210° para hallar la medida del ángulo agudo.'),

    ('Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?',
     'El giro completo es 360°. Calcula cuánto falta desde 135° hasta 360°.'),    
    ('Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?',
     'Resta 135° de 360° para encontrar la diferencia.'),

    ('Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?',
     'Si las partes son iguales, debes repartir los 360° en 8 partes.'),    
    ('Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?',
     'Calcula 360° ÷ 8 y verifica cuál opción coincide con el resultado.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?',
     'Un cuarto de vuelta son 90° y medio giro son 180°. Juntos suman 270°.'),    
    ('Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?',
     'Desde el norte, un giro de 270° a la derecha te deja mirando hacia el oeste.'),

    ('Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?',
     'Tres cuartos de vuelta equivalen a 270° en el sentido indicado.'),    
    ('Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?',
     'Avanza por la brújula en sentido contrario a las agujas del reloj: oeste → sur → este → norte.'),

    ('Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?',
     'Medio giro equivale a 180°, es decir, mirar en la dirección contraria.'),    
    ('Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?',
     'La dirección contraria al este en la brújula es el oeste.'),

    ('Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?',
     'Una vuelta completa son 360°. Tres cuartos de vuelta es 3/4 de 360°.'),    
    ('Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?',
     'Calcula 360° ÷ 4 para obtener un cuarto de vuelta y luego multiplícalo por 3.'),

    ('Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?',
     'Cada cuarto de vuelta son 90°. Cuatro cuartos de vuelta suman 4 × 90°.'),    
    ('Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?',
     '4 × 90° = 360°, que corresponde a un giro completo.')
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
-- SOLUTION_STEPS C.5 ADVANCED (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
    AND e.difficulty = 'ADVANCED'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.5.1.1 – Identificación de ángulos
    ('Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?',1,
     'Compara cada ángulo con 90°: 30° es menor que 90° (agudo), 90° es igual a 90° (recto) y 150° es mayor que 90° pero menor que 180° (obtuso).'),
    ('Se tienen tres ángulos: 30°, 90° y 150°. ¿Cuál opción indica correctamente la clasificación de cada uno?',2,
     'La opción que indica 30° agudo, 90° recto y 150° obtuso es la alternativa A.'),

    ('Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?',1,
     'Entre las opciones, 30° es menor que 45°, 60° está entre 45° y 90°, y 120° es mayor que 90°.'),    
    ('Un ángulo es mayor que 45° pero menor que 90°. ¿Cuál de estas medidas podría tener?',2,
     'Solo 60° cumple ser mayor que 45° y menor que 90°, por eso la respuesta correcta es la opción B.'),

    ('Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?',1,
     'Un ángulo recto mide 90°. Se busca una medida apenas mayor que 90°.'),    
    ('Un ángulo es un poco más abierto que un ángulo recto. ¿Cuál de las siguientes medidas podría tener?',2,
     '80° es menor que 90° y 45° es mucho menor. 100° es un poco mayor que 90°, así que la opción correcta es la B.'),

    ('Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?',1,
     'Se recuerda la clasificación: 90° recto, 180° llano y 360° completo.'),    
    ('Un ángulo formado por dos rayos que quedan en línea recta mide 180°. ¿Cómo se llama ese ángulo?',2,
     'Al medir 180°, el ángulo es llano; por eso la opción correcta es “Ángulo llano”.'),

    ('¿Cuál de las siguientes afirmaciones es correcta?',1,
     'Revisa cada afirmación: los ángulos obtusos son mayores de 90°, los agudos menores de 90° y el recto mide exactamente 90°.'),    
    ('¿Cuál de las siguientes afirmaciones es correcta?',2,
     'La única afirmación verdadera es que un ángulo recto mide exactamente 90°, por eso la opción correcta es la B.'),

    -- LO.5.2.1 – Medición y construcción de ángulos
    ('Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?',1,
     'Se suman las tres medidas: 40° + 50° + 60°.'),    
    ('Tres ángulos se colocan uno a continuación del otro y miden 40°, 50° y 60°. ¿Cuánto mide el ángulo total que forman?',2,
     'La suma es 150°, así que el ángulo total mide 150° y corresponde a la opción C.'),

    ('Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?',1,
     'Al repetir el mismo ángulo se suma 65° + 65°.'),    
    ('Un ángulo mide 65°. Si lo dibujas dos veces seguidas, uno a continuación del otro, ¿qué medida obtienes en total?',2,
     '65° + 65° = 130°, por eso la respuesta correcta es la opción B.'),

    ('Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?',1,
     'La relación es 180° + ángulo agudo = 210°.'),    
    ('Un ángulo grande mide 210°. Se ha formado uniendo un ángulo llano de 180° y un ángulo agudo. ¿Cuántos grados mide el ángulo agudo?',2,
     '210° − 180° = 30°, así que el ángulo agudo mide 30° y la opción correcta es la A.'),

    ('Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?',1,
     'Se calcula 360° − 135° para saber cuánto falta.'),    
    ('Un giro completo mide 360°. Si se han girado 135°, ¿cuántos grados faltan para completar el giro?',2,
     '360° − 135° = 225°, por eso faltan 225° y la alternativa correcta es la C.'),

    ('Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?',1,
     'Se divide 360° entre 8 porque las partes son iguales.'),    
    ('Se quiere dividir un giro completo de 360° en 8 ángulos iguales. ¿Cuántos grados mide cada ángulo?',2,
     '360° ÷ 8 = 45°, por eso cada ángulo mide 45° y la opción correcta es la B.'),

    -- LO.5.3.1 – Giros y direcciones
    ('Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?',1,
     'Un cuarto de vuelta son 90° y medio giro son 180°. En total giras 270° a la derecha.'),    
    ('Estás mirando hacia el norte. Giras un cuarto de vuelta a la derecha y luego medio giro más en el mismo sentido. ¿Hacia qué punto cardinal quedas mirando?',2,
     'Desde el norte, un giro de 270° a la derecha te lleva a mirar hacia el oeste, así que la respuesta correcta es oeste.'),

    ('Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?',1,
     'Tres cuartos de vuelta equivalen a 270° en sentido contrario a las agujas del reloj.'),    
    ('Estás mirando hacia el oeste. Giras tres cuartos de vuelta hacia la izquierda. ¿Hacia qué punto cardinal quedas mirando?',2,
     'Al girar 270° hacia la izquierda desde el oeste pasas por sur, este y terminas en norte, por eso la respuesta es norte.'),

    ('Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?',1,
     'Medio giro son 180°, lo que significa mirar en la dirección contraria.'),    
    ('Estás mirando hacia el este. Realizas medio giro hacia la izquierda. ¿Hacia dónde quedas mirando?',2,
     'La dirección contraria al este es el oeste, así que quedas mirando hacia el oeste.'),

    ('Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?',1,
     'Una vuelta completa son 360°. Un cuarto de vuelta es 360° ÷ 4.'),    
    ('Un giro de tres cuartos de vuelta corresponde a ¿cuántos grados?',2,
     'Un cuarto de vuelta son 90°. Tres cuartos de vuelta son 3 × 90° = 270°, así que la respuesta correcta es 270°.'),

    ('Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?',1,
     'Cada cuarto de vuelta son 90°. Cuatro cuartos de vuelta suman 4 × 90°.'),    
    ('Si giras un cuarto de vuelta cuatro veces seguidas en el mismo sentido, ¿qué tipo de giro realizaste en total?',2,
     '4 × 90° = 360°, que es un giro completo; por eso la opción correcta es “Un giro completo de 360°”.')
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
-- RESUMEN LOG C.5 ADVANCED (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'ADVANCED') AS exercises_c5_advanced,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'ADVANCED') AS hints_c5_advanced,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.5.1.1','LO.5.2.1','LO.5.3.1')
     AND e.difficulty = 'ADVANCED') AS steps_c5_advanced;
