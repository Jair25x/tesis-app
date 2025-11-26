-- ============================================================
-- R__c1_exercises_advanced.sql
-- Ejercicios AVANZADOS para C.1 — NÚMEROS NATURALES (4.º)
-- 5 ejercicios por estándar (S.1.1 a S.1.4)
-- difficulty = 'ADVANCED'
-- ============================================================

DO $$
DECLARE
  exercise_id UUID;
BEGIN
  -- ============================================
  -- S.1.1 – Valor posicional y escritura de números
  -- LO.1.1.1 y LO.1.1.2
  -- ============================================

  -- A1) LO.1.1.1 — Valor posicional (centenas en número grande)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.1.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'En el número **79 684**, ¿qué cifra ocupa el lugar de las **centenas**?',
    'ADVANCED',
    'QA',
    'PLACE_VALUE_QA',
    '{
      "number": 79684,
      "ask": "hundreds",
      "answer": 6
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'En el número **79 684**, ¿qué cifra ocupa el lugar de las **centenas**?'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    -- Hints
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Ubica la cifra que está **tres lugares** a la derecha de la cifra de las decenas de millar.',
        1,
        exercise_id,
        TRUE,
        'seed', 'seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Recuerda que el orden es: decenas de millar, millares, **centenas**, decenas, unidades.',
        1,
        exercise_id,
        TRUE,
        'seed', 'seed', now(), now()
      );

    -- Steps
    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Escribe el número separando cada cifra según su posición: 7 (decenas de millar), 9 (millares), 6 (**centenas**), 8 (decenas), 4 (unidades).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'La cifra que ocupa el lugar de las **centenas** es **6**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A2) LO.1.1.1 — Forma desarrollada con todas las posiciones
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.1.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Escribe en forma desarrollada el número **67 209**.',
    'ADVANCED',
    'QA',
    'PLACE_VALUE_QA',
    '{
      "number": 67209,
      "ask": "expanded",
      "answer": "60 000 + 7 000 + 200 + 9"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Escribe en forma desarrollada el número **67 209**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Identifica cuántas decenas de millar, millares, centenas, decenas y unidades tiene el número.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Piensa en cuánto vale cada cifra según su posición. Por ejemplo, 6 decenas de millar equivalen a **60 000**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Descompón el número: 67 209 = 60 000 (decenas de millar) + 7 000 (millares) + 200 (centenas) + 0 (decenas) + 9 (unidades).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Escribe solo los valores distintos de cero: **60 000 + 7 000 + 200 + 9**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A3) LO.1.1.1 — Forma desarrollada con ceros intermedios
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.1.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Escribe en forma desarrollada el número **40 506**.',
    'ADVANCED',
    'QA',
    'PLACE_VALUE_QA',
    '{
      "number": 40506,
      "ask": "expanded",
      "answer": "40 000 + 500 + 6"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Escribe en forma desarrollada el número **40 506**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Observa que el número tiene ceros en los **millares** y en las **decenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'En la forma desarrollada no es necesario escribir los términos cuyo valor es **0**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Descompón: 40 506 = 40 000 (decenas de millar) + 0 (millares) + 500 (centenas) + 0 (decenas) + 6 (unidades).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Quita los términos con valor 0 y escribe: **40 000 + 500 + 6**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A4) LO.1.1.2 — De palabras a cifras (número grande)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.1.2'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Escribe en cifras: **"setenta y dos mil ciento cuarenta y tres"**.',
    'ADVANCED',
    'QA',
    'NUMBER_WORDS_BIDIR',
    '{
      "direction": "words_to_number",
      "value": "setenta y dos mil ciento cuarenta y tres",
      "answer": 72143
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Escribe en cifras: **"setenta y dos mil ciento cuarenta y tres"**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Identifica primero la parte **"setenta y dos mil"** y luego la parte **"ciento cuarenta y tres"**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Recuerda que **"setenta y dos mil"** equivale a 72 000.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Convierte: "setenta y dos mil" = 72 000; "ciento cuarenta y tres" = 143.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Suma las dos partes: 72 000 + 143 = **72 143**. Entonces se escribe **72 143**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A5) LO.1.1.2 — De cifras a palabras con cero en las decenas
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.1.2'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Escribe en palabras el número **58 090**.',
    'ADVANCED',
    'QA',
    'NUMBER_WORDS_BIDIR',
    '{
      "direction": "number_to_words",
      "value": 58090,
      "answer": "cincuenta y ocho mil noventa"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Escribe en palabras el número **58 090**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Primero piensa en **"cincuenta y ocho mil"** y luego en lo que representan las últimas dos cifras.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Observa que "090" representa **noventa**, no "nueve".',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '58 090 = 58 000 + 90, que se lee como "cincuenta y ocho mil" + "noventa".',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Por tanto, el número se escribe: **"cincuenta y ocho mil noventa"**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- ============================================
  -- S.1.2 – Comparación y orden de números (LO.1.2.1)
  -- ============================================

  -- A6) Comparación con <, > o = (caso cercano)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.2.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa con el signo adecuado (**<, > o =**): **84 095 __ 84 509**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["<", ">", "="],
      "answer": "<"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa con el signo adecuado (**<, > o =**): **84 095 __ 84 509**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Compara primero las decenas de millar y los millares de ambos números.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Si esas posiciones son iguales, observa la cifra de las **centenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Ambos números tienen 8 decenas de millar y 4 millares (84 ___).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Compara las centenas: 0 < 5, por lo que **84 095 < 84 509**. El signo correcto es **<**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A7) ¿Cuál es el mayor? (tres números muy cercanos)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.2.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    '¿Cuál de los siguientes números es el **mayor**? (marca la opción correcta)',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["59 870", "59 708", "58 970"],
      "answer": "59 870"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = '¿Cuál de los siguientes números es el **mayor**? (marca la opción correcta)'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Todos los números están alrededor de 59 000. Compara primero las **centenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Si las centenas son iguales, compara después las **decenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Compara 59 870, 59 708 y 58 970. El número 58 970 es menor porque tiene 58 mil.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Entre 59 870 y 59 708, la cifra de las centenas es la misma (8 y 7 en las decenas). El mayor es **59 870**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A8) Orden de menor a mayor (tres números cercanos)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.2.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Ordena de **menor a mayor** los números: 73 092, 72 930 y 73 209.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": [
        "72 930 < 73 092 < 73 209",
        "73 092 < 72 930 < 73 209",
        "73 209 < 73 092 < 72 930"
      ],
      "answer": "72 930 < 73 092 < 73 209"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Ordena de **menor a mayor** los números: 73 092, 72 930 y 73 209.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Primero identifica cuál tiene menos **decenas de millar**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Luego, entre los que tienen la misma cantidad de millares, compara las **centenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '72 930 tiene 72 mil, mientras que 73 092 y 73 209 tienen 73 mil. Por eso 72 930 es el menor.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Entre 73 092 y 73 209, el mayor es 73 209. El orden de menor a mayor es: **72 930 < 73 092 < 73 209**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A9) Orden de mayor a menor (tres números cercanos)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.2.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Ordena de **mayor a menor** los números: 46 805, 46 580 y 46 958.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": [
        "46 958 > 46 805 > 46 580",
        "46 805 > 46 958 > 46 580",
        "46 580 > 46 805 > 46 958"
      ],
      "answer": "46 958 > 46 805 > 46 580"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Ordena de **mayor a menor** los números: 46 805, 46 580 y 46 958.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Todos tienen 46 mil. Compara las **centenas** y luego las **decenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Recuerda: si las centenas son iguales, la decisión depende de las decenas y unidades.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Compara: 46 958 (9 centenas), 46 805 (8 centenas) y 46 580 (5 centenas).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'De mayor a menor queda: **46 958 > 46 805 > 46 580**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A10) Contexto: ordenar cantidades de estudiantes
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.2.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'En tres escuelas hay **34 750**, **34 507** y **34 705** estudiantes. ¿En qué orden, de mayor a menor, están las cantidades de estudiantes?',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": [
        "34 750 > 34 705 > 34 507",
        "34 705 > 34 750 > 34 507",
        "34 507 > 34 705 > 34 750"
      ],
      "answer": "34 750 > 34 705 > 34 507"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'En tres escuelas hay **34 750**, **34 507** y **34 705** estudiantes. ¿En qué orden, de mayor a menor, están las cantidades de estudiantes?'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Todos los números tienen 34 mil estudiantes. Compara las **centenas**.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Si es necesario, luego observa las **decenas** y unidades.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'Compara: 34 750 (7 centenas), 34 705 (7 centenas) y 34 507 (5 centenas). El menor es 34 507.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Entre 34 750 y 34 705, la cifra de las decenas es mayor en 34 750. Por tanto: **34 750 > 34 705 > 34 507**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- ============================================
  -- S.1.3 – Patrones y sucesiones numéricas (LO.1.3.1)
  -- ============================================

  -- A11) Sucesión creciente (salto de 650)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.3.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa la sucesión: **14 350, __, 15 650, 16 300, 16 950**.',
    'ADVANCED',
    'QA',
    'NUMBER_SEQUENCE_QA',
    '{
      "sequence": [14350, null, 15650, 16300, 16950],
      "missingIndex": 1,
      "answer": 15000,
      "rule": "sumar 650 en cada paso"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa la sucesión: **14 350, __, 15 650, 16 300, 16 950**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Calcula de 15 650 a 16 300 y de 16 300 a 16 950. Observa cuánto se suma cada vez.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Cuando sepas el salto, réstalo desde 15 650 para encontrar el término que falta.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'De 15 650 a 16 300 se suman 650; de 16 300 a 16 950 también se suman 650. La regla es "sumar 650".',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Restando 650 a 15 650 obtenemos 15 000. La sucesión queda: 14 350, **15 000**, 15 650, 16 300, 16 950.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A12) Sucesión decreciente (salto de 1 250)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.3.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa la sucesión: **32 000, 30 750, __, 28 250, 27 000**.',
    'ADVANCED',
    'QA',
    'NUMBER_SEQUENCE_QA',
    '{
      "sequence": [32000, 30750, null, 28250, 27000],
      "missingIndex": 2,
      "answer": 29500,
      "rule": "restar 1 250 en cada paso"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa la sucesión: **32 000, 30 750, __, 28 250, 27 000**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Fíjate cuánto se resta de 32 000 a 30 750 y de 28 250 a 27 000.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Aplica el mismo salto entre 30 750 y el término que falta.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'De 32 000 a 30 750 se restan 1 250. De 28 250 a 27 000 también se restan 1 250.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Entonces, 30 750 - 1 250 = **29 500**. La sucesión queda: 32 000, 30 750, **29 500**, 28 250, 27 000.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A13) Sucesión creciente (salto de 2 500)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.3.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa la sucesión: **7 800, 10 300, __, 15 300, 17 800**.',
    'ADVANCED',
    'QA',
    'NUMBER_SEQUENCE_QA',
    '{
      "sequence": [7800, 10300, null, 15300, 17800],
      "missingIndex": 2,
      "answer": 12800,
      "rule": "sumar 2 500 en cada paso"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa la sucesión: **7 800, 10 300, __, 15 300, 17 800**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Calcula cuánto se suma de 7 800 a 10 300.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Aplica el mismo salto para encontrar el número que falta entre 10 300 y 15 300.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'De 7 800 a 10 300 se suman 2 500. Si seguimos la regla, de 10 300 al siguiente término también sumamos 2 500.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        '10 300 + 2 500 = **12 800**. La sucesión es: 7 800, 10 300, **12 800**, 15 300, 17 800.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A14) Sucesión creciente (salto de 90, con números no redondos)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.3.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa la sucesión: **10 025, 10 115, __, 10 295, 10 385**.',
    'ADVANCED',
    'QA',
    'NUMBER_SEQUENCE_QA',
    '{
      "sequence": [10025, 10115, null, 10295, 10385],
      "missingIndex": 2,
      "answer": 10205,
      "rule": "sumar 90 en cada paso"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa la sucesión: **10 025, 10 115, __, 10 295, 10 385**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Calcula la diferencia entre 10 295 y 10 385.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Cuando tengas claro el salto, súmalo a 10 115 para hallar el término faltante.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'De 10 295 a 10 385 se suman 90. La regla es "sumar 90".',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        '10 115 + 90 = **10 205**. La sucesión es: 10 025, 10 115, **10 205**, 10 295, 10 385.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A15) Sucesión decreciente (salto de 75)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.3.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Completa la sucesión: **4 500, 4 425, __, 4 275, 4 200**.',
    'ADVANCED',
    'QA',
    'NUMBER_SEQUENCE_QA',
    '{
      "sequence": [4500, 4425, null, 4275, 4200],
      "missingIndex": 2,
      "answer": 4350,
      "rule": "restar 75 en cada paso"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Completa la sucesión: **4 500, 4 425, __, 4 275, 4 200**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'De 4 500 a 4 425, ¿cuánto se resta?',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Aplica la misma resta para pasar de 4 425 al número que falta.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        'De 4 500 a 4 425 se restan 75. Por lo tanto cada paso resta 75.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        '4 425 - 75 = **4 350**. La sucesión queda: 4 500, 4 425, **4 350**, 4 275, 4 200.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- ============================================
  -- S.1.4 – Redondeo y estimación (LO.1.4.1)
  -- ============================================

  -- A16) Redondeo a la centena más cercana (caso límite)
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.4.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Redondea **9 995** a la **centena más cercana**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["9 900", "10 000", "9 800"],
      "answer": "10 000"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Redondea **9 995** a la **centena más cercana**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Piensa entre qué centenas está el número 9 995.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Compara qué tan cerca está de 9 900 y de 10 000.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '9 995 está entre 9 900 y 10 000.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Está a 95 de 9 900 y solo a 5 de 10 000, por lo que se redondea a **10 000**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A17) Redondeo a la unidad de millar
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.4.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Redondea **47 481** a la **unidad de millar más cercana**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["47 000", "48 000", "46 000"],
      "answer": "47 000"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Redondea **47 481** a la **unidad de millar más cercana**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Ubica las dos unidades de millar entre las que se encuentra 47 481.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Fíjate en las **centenas** para decidir hacia qué millar se redondea.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '47 481 está entre 47 000 y 48 000. Tiene 4 centenas (481).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Como 481 < 500, se redondea hacia abajo: **47 000**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A18) Estimación de suma redondeando al millar más cercano
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.4.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Aproxima la suma **12 378 + 8 642** al **millar más cercano**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["20 000", "21 000", "22 000"],
      "answer": "21 000"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Aproxima la suma **12 378 + 8 642** al **millar más cercano**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Primero redondea **12 378** al millar más cercano.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Luego redondea **8 642** al millar más cercano y suma las aproximaciones.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '12 378 ≈ 12 000 (se aproxima hacia abajo) y 8 642 ≈ 9 000 (se aproxima hacia arriba).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'La suma aproximada es 12 000 + 9 000 = **21 000**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A19) Estimación de suma redondeando a la decena más cercana
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.4.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'En una tienda se venden 249, 351 y 199 caramelos en tres cajas. Aproxima el total de caramelos **redondeando cada cantidad a la decena más cercana**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["780", "800", "900"],
      "answer": "800"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'En una tienda se venden 249, 351 y 199 caramelos en tres cajas. Aproxima el total de caramelos **redondeando cada cantidad a la decena más cercana**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Redondea primero 249 a la decena más cercana.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Haz lo mismo con 351 y 199, y luego suma las cantidades aproximadas.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '249 ≈ 250; 351 ≈ 350; 199 ≈ 200 (todas al redondear a la decena más cercana).',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'Suma las aproximaciones: 250 + 350 + 200 = **800** caramelos aproximadamente.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

  -- A20) Estimación de suma redondeando a la decena de millar más cercana
  exercise_id := NULL;
  WITH lo AS (
    SELECT id
    FROM learning_objectives
    WHERE code = 'LO.1.4.1'
    LIMIT 1
  )
  INSERT INTO exercises (
    id,
    learning_objective_id,
    statement,
    difficulty,
    type,
    template_type,
    parameters,
    active,
    is_diagnostic,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  SELECT
    gen_random_uuid(),
    lo.id,
    'Aproxima la suma **36 540 + 23 980** a la **decena de millar más cercana**.',
    'ADVANCED',
    'MULTIPLE_CHOICE',
    'EQUATION_SINGLE_CHOICE',
    '{
      "choices": ["50 000", "60 000", "70 000"],
      "answer": "60 000"
    }',
    TRUE,
    FALSE,
    'seed',
    'seed',
    now(),
    now()
  FROM lo
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.learning_objective_id = lo.id
      AND e.statement = 'Aproxima la suma **36 540 + 23 980** a la **decena de millar más cercana**.'
      AND e.difficulty = 'ADVANCED'
  )
  RETURNING id INTO exercise_id;

  IF exercise_id IS NOT NULL THEN
    INSERT INTO hints (
      id,
      hint_text,
      cost,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        'Redondea **36 540** a la decena de millar más cercana.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        'Haz lo mismo con **23 980** y suma las aproximaciones.',
        1,
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );

    INSERT INTO solution_steps (
      id,
      step_number,
      explanation,
      exercise_id,
      active,
      created_by,
      updated_by,
      created_at,
      updated_at
    ) VALUES
      (
        gen_random_uuid(),
        1,
        '36 540 está más cerca de 40 000 que de 30 000, por eso 36 540 ≈ 40 000. 23 980 está más cerca de 20 000 que de 30 000, por eso 23 980 ≈ 20 000.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      ),
      (
        gen_random_uuid(),
        2,
        'La suma aproximada es 40 000 + 20 000 = **60 000**.',
        exercise_id,
        TRUE,
        'seed','seed', now(), now()
      );
  END IF;

END
$$ LANGUAGE plpgsql;
