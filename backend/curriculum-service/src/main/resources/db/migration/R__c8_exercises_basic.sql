-- ============================================================
-- R__c8_exercises_basic.sql
-- C.8 – SIMETRÍA Y TRANSFORMACIONES (4.º)
--
-- Nivel: BASIC
-- LOs cubiertos:
--   LO.8.1.1 – Figuras simétricas y líneas de simetría
--   LO.8.1.2 – Completar figuras simétricas
--   LO.8.2.1 – Traslaciones en el plano
--
-- 6 ejercicios BASIC por LO (18 en total).
-- Plantilla usada:
--   - EQUATION_SINGLE_CHOICE
-- Idempotente: usa NOT EXISTS.
-- ============================================================

------------------------------------------------------------
-- LO.8.1.1 – Figuras simétricas y líneas de simetría
-- 6 ejercicios BASIC
------------------------------------------------------------

-- B1 — Figura con línea de simetría vertical
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes figuras tiene una línea de simetría vertical?',
       'BASIC','EQUATION',
       'B) un corazón dibujado igual a la izquierda y a la derecha',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) un triángulo rectángulo cualquiera",
            "B) un corazón dibujado igual a la izquierda y a la derecha",
            "C) una flecha que señala hacia la derecha"
          ],
          "answer": "B) un corazón dibujado igual a la izquierda y a la derecha"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes figuras tiene una línea de simetría vertical?'
  );

-- B2 — Número de líneas de simetría de un cuadrado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuántas líneas de simetría tiene un cuadrado?',
       'BASIC','EQUATION',
       'C) cuatro',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) una",
            "B) dos",
            "C) cuatro"
          ],
          "answer": "C) cuatro"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuántas líneas de simetría tiene un cuadrado?'
  );

-- B3 — Línea de simetría en un rectángulo parado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?',
       'BASIC','EQUATION',
       'B) una línea que pasa por el centro y divide el rectángulo en parte izquierda y derecha iguales',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) una línea inclinada que pasa por una esquina",
            "B) una línea que pasa por el centro y divide el rectángulo en parte izquierda y derecha iguales",
            "C) una línea que pasa por un lado y sale fuera de la figura"
          ],
          "answer": "B) una línea que pasa por el centro y divide el rectángulo en parte izquierda y derecha iguales"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?'
  );

-- B4 — Letra con simetría vertical
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?',
       'BASIC','EQUATION',
       'A) H',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) H",
            "B) L",
            "C) F"
          ],
          "answer": "A) H"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?'
  );

-- B5 — Figura con más líneas de simetría
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué figura tiene más líneas de simetría?',
       'BASIC','EQUATION',
       'B) un triángulo equilátero',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) un rectángulo",
            "B) un triángulo equilátero",
            "C) un trapecio isósceles"
          ],
          "answer": "B) un triángulo equilátero"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué figura tiene más líneas de simetría?'
  );

-- B6 — Definición de línea de simetría
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué afirmación describe mejor una línea de simetría en una figura?',
       'BASIC','EQUATION',
       'B) es una línea que divide la figura en dos partes que coinciden si se doblan',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) es una línea que recorre el borde de la figura",
            "B) es una línea que divide la figura en dos partes que coinciden si se doblan",
            "C) es una línea que solo sirve para medir la figura"
          ],
          "answer": "B) es una línea que divide la figura en dos partes que coinciden si se doblan"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué afirmación describe mejor una línea de simetría en una figura?'
  );

------------------------------------------------------------
-- LO.8.1.2 – Completar figuras simétricas
-- 6 ejercicios BASIC
------------------------------------------------------------

-- B7 — Completar un corazón simétrico
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?',
       'BASIC','EQUATION',
       'B) dibujar la misma mitad al otro lado de la línea, como si fuera un espejo',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) dibujar una forma diferente al otro lado de la línea",
            "B) dibujar la misma mitad al otro lado de la línea, como si fuera un espejo",
            "C) borrar la mitad que ya está dibujada"
          ],
          "answer": "B) dibujar la misma mitad al otro lado de la línea, como si fuera un espejo"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?'
  );

-- B8 — Completar figura en cuadrícula con línea vertical
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?',
       'BASIC','EQUATION',
       'A) copiar los cuadritos ocupados a la izquierda de la línea a la misma distancia',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) copiar los cuadritos ocupados a la izquierda de la línea a la misma distancia",
            "B) colorear todos los cuadritos de la hoja",
            "C) dibujar cualquier figura nueva a la izquierda"
          ],
          "answer": "A) copiar los cuadritos ocupados a la izquierda de la línea a la misma distancia"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?'
  );

-- B9 — Completar figura con línea horizontal de simetría
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Si la línea de simetría es horizontal, ¿cómo se completa la figura?',
       'BASIC','EQUATION',
       'A) copiar la figura hacia arriba o hacia abajo, a la misma distancia de la línea',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) copiar la figura hacia arriba o hacia abajo, a la misma distancia de la línea",
            "B) girar la figura noventa grados",
            "C) mover la figura solo hacia la derecha"
          ],
          "answer": "A) copiar la figura hacia arriba o hacia abajo, a la misma distancia de la línea"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Si la línea de simetría es horizontal, ¿cómo se completa la figura?'
  );

-- B10 — Distancia de puntos simétricos a la línea
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?',
       'BASIC','EQUATION',
       'B) siempre están a la misma distancia de la línea, uno a cada lado',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) siempre están a distinta distancia de la línea",
            "B) siempre están a la misma distancia de la línea, uno a cada lado",
            "C) pueden estar los dos en el mismo lado de la línea"
          ],
          "answer": "B) siempre están a la misma distancia de la línea, uno a cada lado"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?'
  );

-- B11 — Completar la otra mitad de un rectángulo
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?',
       'BASIC','EQUATION',
       'A) debajo de la línea, repitiendo la misma forma',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) debajo de la línea, repitiendo la misma forma",
            "B) a la derecha de la línea, cambiando de forma",
            "C) encima de la línea, pero más grande"
          ],
          "answer": "A) debajo de la línea, repitiendo la misma forma"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?'
  );

-- B12 — Idea clave para completar figuras simétricas
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.1.2'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?',
       'BASIC','EQUATION',
       'A) imaginar que pones un espejo sobre la línea de simetría',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) imaginar que pones un espejo sobre la línea de simetría",
            "B) contar los cuadritos sin mirar la figura",
            "C) cerrar los ojos y adivinar la forma"
          ],
          "answer": "A) imaginar que pones un espejo sobre la línea de simetría"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?'
  );

------------------------------------------------------------
-- LO.8.2.1 – Traslaciones en el plano
-- 6 ejercicios BASIC
------------------------------------------------------------

-- B13 — Trasladar un punto tres cuadritos a la derecha
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?',
       'BASIC','EQUATION',
       'B) el punto se mueve tres cuadritos a la derecha sin girar ni cambiar',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) el punto cambia de tamaño",
            "B) el punto se mueve tres cuadritos a la derecha sin girar ni cambiar",
            "C) el punto gira alrededor del origen"
          ],
          "answer": "B) el punto se mueve tres cuadritos a la derecha sin girar ni cambiar"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?'
  );

-- B14 — Traslación de una figura hacia arriba
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?',
       'BASIC','EQUATION',
       'B) la figura se mueve dos cuadritos hacia arriba y sigue con el mismo tamaño y orientación',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) la figura cambia de forma",
            "B) la figura se mueve dos cuadritos hacia arriba y sigue con el mismo tamaño y orientación",
            "C) la figura se hace más grande"
          ],
          "answer": "B) la figura se mueve dos cuadritos hacia arriba y sigue con el mismo tamaño y orientación"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?'
  );

-- B15 — Efecto de una traslación en los lados de un cuadrado
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?',
       'BASIC','EQUATION',
       'C) los lados mantienen su longitud y siguen paralelos, solo cambian de lugar',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) los lados se vuelven más cortos",
            "B) los lados cambian de dirección",
            "C) los lados mantienen su longitud y siguen paralelos, solo cambian de lugar"
          ],
          "answer": "C) los lados mantienen su longitud y siguen paralelos, solo cambian de lugar"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?'
  );

-- B16 — Identificar una traslación entre otras transformaciones
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       '¿Cuál de las siguientes acciones corresponde a una traslación?',
       'BASIC','EQUATION',
       'A) mover una figura tres cuadritos a la derecha sin girarla',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) mover una figura tres cuadritos a la derecha sin girarla",
            "B) girar una figura noventa grados alrededor de un punto",
            "C) reflejar una figura respecto a una línea"
          ],
          "answer": "A) mover una figura tres cuadritos a la derecha sin girarla"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = '¿Cuál de las siguientes acciones corresponde a una traslación?'
  );

-- B17 — Clasificar el movimiento de un punto como traslación
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?',
       'BASIC','EQUATION',
       'A) una traslación',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) una traslación",
            "B) una rotación",
            "C) una reflexión"
          ],
          "answer": "A) una traslación"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?'
  );

-- B18 — Traslación repetida en un juego de tablero
WITH lo AS (
  SELECT id FROM learning_objectives
  WHERE code = 'LO.8.2.1'
  LIMIT 1
)
INSERT INTO exercises (
  id, statement, difficulty, type, correct_answer, template_type, parameters,
  active, is_diagnostic, learning_objective_id,
  created_by, updated_by, created_at, updated_at
)
SELECT gen_random_uuid(),
       'En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?',
       'BASIC','EQUATION',
       'B) una traslación horizontal repetida',
       'EQUATION_SINGLE_CHOICE',
       '{
          "choices": [
            "A) una rotación alrededor del centro del tablero",
            "B) una traslación horizontal repetida",
            "C) una figura simétrica estacionaria"
          ],
          "answer": "B) una traslación horizontal repetida"
        }'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),
       'seed','seed',now(),now()
WHERE EXISTS (SELECT 1 FROM lo)
  AND NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = (SELECT id FROM lo)
      AND e.statement = 'En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?'
  );

------------------------------------------------------------
-- HINTS C.8 BASIC (2 por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.8.1.1','LO.8.1.2','LO.8.2.1')
    AND e.difficulty = 'BASIC'
),
hint_src AS (
  SELECT * FROM (VALUES
    -- LO.8.1.1 – Figuras simétricas y líneas de simetría
    ('¿Cuál de las siguientes figuras tiene una línea de simetría vertical?',
     'Piensa en una figura que al doblarla por una línea vertical quede igual en ambos lados.'),
    ('¿Cuál de las siguientes figuras tiene una línea de simetría vertical?',
     'Elige la figura que parece verse igual a la izquierda y a la derecha.'),

    ('¿Cuántas líneas de simetría tiene un cuadrado?',
     'Un cuadrado tiene todos sus lados iguales.'),
    ('¿Cuántas líneas de simetría tiene un cuadrado?',
     'Imagina doblar el cuadrado por el centro de diferentes maneras y cuenta cuántas veces coinciden las partes.'),

    ('Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?',
     'La línea de simetría debe pasar por el centro de la figura.'),
    ('Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?',
     'Busca la opción donde el rectángulo se divide en dos partes iguales, izquierda y derecha.'),

    ('¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?',
     'Piensa qué letra se ve igual si la miras en un espejo vertical.'),
    ('¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?',
     'Entre H, L y F, solo una tiene forma igual a ambos lados de una línea vertical imaginaria.'),

    ('¿Qué figura tiene más líneas de simetría?',
     'Compara cuántas veces puedes doblar cada figura para que coincidan sus partes.'),
    ('¿Qué figura tiene más líneas de simetría?',
     'Recuerda que un triángulo equilátero tiene todos sus lados y ángulos iguales.'),

    ('¿Qué afirmación describe mejor una línea de simetría en una figura?',
     'La línea de simetría divide la figura en dos partes iguales.'),
    ('¿Qué afirmación describe mejor una línea de simetría en una figura?',
     'Si doblas la figura sobre la línea de simetría, las dos mitades deben coincidir exactamente.'),

    -- LO.8.1.2 – Completar figuras simétricas
    ('Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?',
     'La otra mitad debe ser igual pero al otro lado de la línea central.'),
    ('Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?',
     'Imagina que la línea central es un espejo y dibuja lo que verías.'),

    ('En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?',
     'Cuenta cuántos cuadritos se aleja cada parte de la figura respecto a la línea.'),
    ('En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?',
     'Debes repetir los mismos cuadritos ocupados al otro lado de la línea, a la misma distancia.'),

    ('Si la línea de simetría es horizontal, ¿cómo se completa la figura?',
     'Una línea de simetría horizontal divide la figura en parte de arriba y parte de abajo.'),
    ('Si la línea de simetría es horizontal, ¿cómo se completa la figura?',
     'La figura se refleja hacia arriba o hacia abajo, no hacia los lados.'),

    ('En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?',
     'En una figura simétrica, la línea de simetría está justo en medio de los pares de puntos.'),
    ('En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?',
     'Los puntos simétricos están siempre a la misma distancia de la línea, uno a cada lado.'),

    ('La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?',
     'Si la mitad está arriba de la línea, la otra mitad debe ir abajo.'),
    ('La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?',
     'La forma debe repetirse debajo de la línea, manteniendo la misma distancia.'),

    ('¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?',
     'La línea de simetría funciona como un espejo.'),
    ('¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?',
     'Imagina que la figura se refleja en la línea y completa lo que falta.'),

    -- LO.8.2.1 – Traslaciones en el plano
    ('En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?',
     'Trasladar un punto significa moverlo sin cambiar su forma ni tamaño.'),
    ('En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?',
     'Solo cambia su posición: en este caso tres cuadritos hacia la derecha.'),

    ('Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?',
     'En una traslación la figura no gira ni cambia de tamaño.'),
    ('Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?',
     'La figura se desplaza completa hacia arriba manteniendo su forma.'),

    ('Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?',
     'Una traslación solo cambia la posición, no el tamaño ni la forma.'),
    ('Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?',
     'Los lados siguen teniendo la misma longitud y la misma dirección.'),

    ('¿Cuál de las siguientes acciones corresponde a una traslación?',
     'En una traslación la figura se mueve recto, sin girarse.'),
    ('¿Cuál de las siguientes acciones corresponde a una traslación?',
     'Busca la opción donde la figura solo se desplaza en el plano.'),

    ('El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?',
     'Mover un punto hacia arriba y hacia la derecha sin girarlo es una traslación.'),
    ('El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?',
     'No estás dando vueltas al punto ni reflejándolo, solo cambiando su lugar.'),

    ('En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?',
     'Cada turno repite el mismo movimiento en la misma dirección.'),
    ('En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?',
     'Cuando se repite un mismo desplazamiento en el plano, es una traslación.')
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
-- SOLUTION_STEPS C.8 BASIC (2 pasos por ejercicio)
------------------------------------------------------------

WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.8.1.1','LO.8.1.2','LO.8.2.1')
    AND e.difficulty = 'BASIC'
),
step_src AS (
  SELECT * FROM (VALUES
    -- LO.8.1.1 – Figuras simétricas y líneas de simetría
    ('¿Cuál de las siguientes figuras tiene una línea de simetría vertical?',1,
     'Una figura con línea de simetría vertical se ve igual a la izquierda y a la derecha al doblarla por el centro.'),
    ('¿Cuál de las siguientes figuras tiene una línea de simetría vertical?',2,
     'El corazón está dibujado igual a ambos lados de la línea vertical, por eso es la figura simétrica correcta.'),

    ('¿Cuántas líneas de simetría tiene un cuadrado?',1,
     'Un cuadrado puede doblarse por la mitad de izquierda a derecha y de arriba hacia abajo.'),
    ('¿Cuántas líneas de simetría tiene un cuadrado?',2,
     'Además tiene dos diagonales que también lo dividen en partes iguales, en total tiene cuatro líneas de simetría.'),

    ('Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?',1,
     'En un rectángulo parado, una línea que pasa por el centro y lo divide en dos partes iguales es línea de simetría.'),
    ('Un rectángulo está dibujado parado, es decir, más alto que ancho. ¿Cuál de las siguientes opciones describe una línea de simetría de ese rectángulo?',2,
     'La opción correcta es la que divide el rectángulo en parte izquierda y derecha iguales.'),

    ('¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?',1,
     'La letra H tiene dos palitos verticales iguales unidos por una barra central.'),
    ('¿Cuál de estas letras tiene una línea de simetría vertical si se escribe con una forma sencilla de imprenta?',2,
     'Si dibujas una línea vertical por el centro, las dos mitades de la H coinciden, por eso tiene simetría vertical.'),

    ('¿Qué figura tiene más líneas de simetría?',1,
     'Un rectángulo tiene dos líneas de simetría y un trapecio isósceles suele tener solo una.'),
    ('¿Qué figura tiene más líneas de simetría?',2,
     'Un triángulo equilátero tiene tres líneas de simetría, por eso es la figura con más líneas de simetría.'),

    ('¿Qué afirmación describe mejor una línea de simetría en una figura?',1,
     'La línea de simetría divide la figura en dos mitades que se superponen al doblar la hoja.'),
    ('¿Qué afirmación describe mejor una línea de simetría en una figura?',2,
     'Por eso la afirmación correcta es que divide la figura en dos partes que coinciden si se doblan.'),

    -- LO.8.1.2 – Completar figuras simétricas
    ('Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?',1,
     'En una figura simétrica respecto a una línea vertical, cada parte de un lado se repite al otro lado a la misma distancia.'),
    ('Para completar un corazón simétrico respecto a una línea vertical en el centro, ¿qué debes hacer?',2,
     'Para completar el corazón, debes dibujar la misma mitad al otro lado de la línea, como si fuera un espejo.'),

    ('En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?',1,
     'Cada cuadrito ocupado a la derecha de la línea debe tener un cuadrito igual a la misma distancia a la izquierda.'),
    ('En un papel cuadriculado hay una figura dibujada a la derecha de una línea de simetría vertical. ¿Cómo se completa la figura para que sea simétrica?',2,
     'Por eso se completa copiando los cuadritos a la izquierda de la línea a la misma distancia.'),

    ('Si la línea de simetría es horizontal, ¿cómo se completa la figura?',1,
     'Una línea de simetría horizontal divide la figura en parte superior e inferior.'),
    ('Si la línea de simetría es horizontal, ¿cómo se completa la figura?',2,
     'La figura se completa copiando la forma hacia arriba o hacia abajo, a la misma distancia de la línea.'),

    ('En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?',1,
     'Si un punto está a tres cuadritos por encima y su par simétrico a tres por debajo, la línea está justo en medio.'),
    ('En una figura simétrica, un punto P está a tres cuadritos por encima de la línea de simetría y su punto simétrico P2 está a tres cuadritos por debajo. ¿Qué ocurre con otros pares de puntos simétricos?',2,
     'Todos los pares de puntos simétricos están a la misma distancia de la línea, uno arriba y otro abajo o a cada lado.'),

    ('La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?',1,
     'Si la mitad superior está dibujada, la otra mitad debe ir debajo de la línea para quedar como un espejo.'),
    ('La mitad superior de un rectángulo está dibujada sobre una línea horizontal de simetría. ¿Dónde debe dibujarse la otra mitad para que la figura sea simétrica?',2,
     'Por eso la otra mitad del rectángulo se dibuja debajo de la línea, repitiendo la misma forma.'),

    ('¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?',1,
     'Completar una figura simétrica es como mirar su reflejo en un espejo sobre la línea de simetría.'),
    ('¿Qué idea te ayuda más a completar una figura simétrica en un papel cuadriculado?',2,
     'La mejor idea es imaginar ese espejo para dibujar lo que falta al otro lado.'),

    -- LO.8.2.1 – Traslaciones en el plano
    ('En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?',1,
     'Trasladar un punto tres cuadritos a la derecha significa moverlo tres casillas sin girarlo ni cambiarlo.'),
    ('En un plano cuadriculado se traslada un punto tres cuadritos hacia la derecha. ¿Qué sucede con el punto?',2,
     'El punto solo cambia de posición, quedando tres cuadritos más a la derecha.'),

    ('Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?',1,
     'En una traslación la figura se desplaza completa en una dirección manteniendo su forma.'),
    ('Una figura se traslada dos cuadritos hacia arriba en un plano cuadriculado. ¿Cuál de estas afirmaciones es verdadera?',2,
     'Al trasladarla dos cuadritos hacia arriba, la figura solo sube dos cuadritos y conserva su tamaño y orientación.'),

    ('Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?',1,
     'La traslación mueve todo el cuadrado a una nueva posición sin deformarlo.'),
    ('Al trasladar un cuadrado cuatro cuadritos hacia la izquierda, ¿qué ocurre con sus lados?',2,
     'Los lados mantienen su longitud y siguen paralelos, solo cambian de lugar en el plano.'),

    ('¿Cuál de las siguientes acciones corresponde a una traslación?',1,
     'La traslación es un movimiento en el que la figura se desplaza en línea recta sin girar ni reflejarse.'),
    ('¿Cuál de las siguientes acciones corresponde a una traslación?',2,
     'Mover una figura tres cuadritos a la derecha sin girarla es un ejemplo de traslación.'),

    ('El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?',1,
     'El punto pasa de una posición a otra sumando un desplazamiento hacia arriba y hacia la derecha.'),
    ('El punto P se mueve un cuadrito hacia arriba y dos hacia la derecha en un solo movimiento. ¿Cómo se llama este tipo de transformación?',2,
     'Ese movimiento es una traslación, porque solo cambia su lugar sin girar ni reflejarse.'),

    ('En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?',1,
     'En cada turno la ficha hace el mismo desplazamiento: dos casillas hacia la derecha.'),
    ('En un juego de tablero, una ficha avanza siempre dos casillas hacia la derecha en cada turno. ¿Qué tipo de movimiento repite la ficha en el tablero?',2,
     'Repetir siempre el mismo desplazamiento es una traslación horizontal repetida en el tablero.')
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
-- RESUMEN LOG C.8 BASIC (conteos globales)
------------------------------------------------------------

SELECT
  (SELECT COUNT(*)
   FROM exercises e
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.8.1.1','LO.8.1.2','LO.8.2.1')
     AND e.difficulty = 'BASIC') AS exercises_c8_basic,
  (SELECT COUNT(*)
   FROM hints h
   JOIN exercises e ON e.id = h.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.8.1.1','LO.8.1.2','LO.8.2.1')
     AND e.difficulty = 'BASIC') AS hints_c8_basic,
  (SELECT COUNT(*)
   FROM solution_steps s
   JOIN exercises e ON e.id = s.exercise_id
   JOIN learning_objectives lo ON lo.id = e.learning_objective_id
   WHERE lo.code IN ('LO.8.1.1','LO.8.1.2','LO.8.2.1')
     AND e.difficulty = 'BASIC') AS steps_c8_basic;
