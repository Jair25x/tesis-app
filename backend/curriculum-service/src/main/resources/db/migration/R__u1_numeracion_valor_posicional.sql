-- R__u1_numeracion_valor_posicional.sql
-- U1 (4.º): Lectura/escritura, valor posicional, base diez, secuencias.
-- Crea CURR/C.1/S.1.1 + LOs + ~30 ejercicios y añade hints/steps idempotentes.
-- Compatible con UNIQUE DEFERRABLE (sin ON CONFLICT; usa NOT EXISTS).

-- =========================================
-- 1) GARANTIZA CURR / COMP / STD / LOs U1
-- =========================================
INSERT INTO curricula (id, code, name, description, grade, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'CURR-MATH-4', 'Currículo de Matemática - Cuarto grado',
       'Numeración y valor posicional (U1) + ejercicios base', '4', TRUE, 'seed', 'seed', now(), now()
ON CONFLICT (code) DO NOTHING;

WITH curr AS (SELECT id FROM curricula WHERE code = 'CURR-MATH-4' LIMIT 1)
INSERT INTO competencies (id, code, name, description, active, curriculum_id,
                          created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'C.1', 'NÚMEROS NATURALES',
       'Lectura y escritura de números, valor posicional, representación base diez y patrones.',
       TRUE, id, 'seed','seed', now(), now()
FROM curr
ON CONFLICT (code) DO NOTHING;

WITH c AS (SELECT id FROM competencies WHERE code = 'C.1' LIMIT 1)
INSERT INTO standards (id, code, name, description, active, competency_id,
                       created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), 'S.1.1', 'Unidad 1: Números y valor posicional',
       'Lectura/escritura de números naturales hasta 6 cifras, valor posicional y patrones.',
       TRUE, id, 'seed','seed', now(), now()
FROM c
ON CONFLICT (code) DO NOTHING;

-- LOs base U1
WITH s AS (SELECT id FROM standards WHERE code = 'S.1.1' LIMIT 1)
INSERT INTO learning_objectives (id, code, name, description, active, standard_id,
                                 created_by, updated_by, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'LO.1.1.1', 'Leer y escribir números en cifras y palabras',
   'Conversión bidireccional es-PE.', TRUE, (SELECT id FROM s), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'LO.1.1.2', 'Identificar valor posicional y descomposición',
   'Centenas, decenas, unidades; forma desarrollada.', TRUE, (SELECT id FROM s), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'LO.1.1.3', 'Representar con bloques base diez',
   'Mapeo de centenas/decenas/unidades a número.', TRUE, (SELECT id FROM s), 'seed','seed', now(), now()),
  (gen_random_uuid(), 'LO.1.1.4', 'Completar patrones numéricos y secuencias',
   'Reglas con incrementos/decrementos y posición fija.', TRUE, (SELECT id FROM s), 'seed','seed', now(), now())
ON CONFLICT (code) DO NOTHING;

-- =========================================
-- 2) EJERCICIOS U1 (tu set base)
-- =========================================

-- === LO.1.1.1 — NUMBER_WORDS_BIDIR (10) ===
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises (id, statement, difficulty, type, correct_answer, template_type, parameters,
                       active, is_diagnostic, learning_objective_id, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(),
       'Escribe en cifras: "dos mil treinta y cinco".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"dos mil treinta y cinco","answer":2035}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en cifras: "dos mil treinta y cinco".'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"cincuenta y ocho mil cuatrocientos doce","answer":58412}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en cifras: "trescientos seis mil doscientos uno".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"trescientos seis mil doscientos uno","answer":306201}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en cifras: "trescientos seis mil doscientos uno".'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en cifras: "noventa mil siete".',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"noventa mil siete","answer":90007}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en cifras: "noventa mil siete".'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en palabras: 47 305.',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":47305,"answer":"cuarenta y siete mil trescientos cinco"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en palabras: 47 305.'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en palabras: 203 008.',
       'BASIC','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":203008,"answer":"doscientos tres mil ocho"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en palabras: 203 008.'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en cifras: "cuarenta y dos mil".',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"cuarenta y dos mil","answer":42000}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en cifras: "cuarenta y dos mil".'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en palabras: 600 015.',
       'INTERMEDIATE','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":600015,"answer":"seiscientos mil quince"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Escribe en palabras: 600 015.'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Completa: "trescientos mil ____" corresponde a 300 700.',
       'ADVANCED','QA',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"WORDS_TO_DIGITS","value":"trescientos mil setecientos","answer":300700}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Completa: "trescientos mil ____" corresponde a 300 700.'
);

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.1')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Selecciona la escritura correcta de 155 040.',
       'ADVANCED','CHOICE',NULL,'NUMBER_WORDS_BIDIR',
       '{"direction":"DIGITS_TO_WORDS","value":155040,
         "choices":["ciento cincuenta y cinco mil cuarenta","ciento cincuenta y cinco mil cuatrocientos","ciento cincuenta mil cincuenta y cuatro"],
         "answer":"ciento cincuenta y cinco mil cuarenta"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e
  WHERE e.learning_objective_id=(SELECT id FROM lo)
    AND e.statement='Selecciona la escritura correcta de 155 040.'
);

-- === LO.1.1.2 — PLACE_VALUE_QA (10) ===
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       '¿Cuál es la cifra de las centenas en 4 827?',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":4827,"ask":"hundreds","answer":8}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='¿Cuál es la cifra de las centenas en 4 827?');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Escribe en forma desarrollada: 6 305.',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"number":6305,"ask":"expanded","answer":"6000 + 300 + 5"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Escribe en forma desarrollada: 6 305.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Selecciona el valor posicional de la cifra 7 en 47 315.',
       'BASIC','CHOICE',NULL,'PLACE_VALUE_QA',
       '{"number":47315,"ask":"positional_of_digit","digit":7,
         "choices":["decenas de mil","millares","centenas"],"answer":"millares"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Selecciona el valor posicional de la cifra 7 en 47 315.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Completa: 80 000 + 400 + 9 = ____.',
       'BASIC','QA',NULL,'PLACE_VALUE_QA',
       '{"ask":"compose","answer":80409}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Completa: 80 000 + 400 + 9 = ____.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       '¿Cuántas decenas hay en 3 560?',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":3560,"ask":"tens_count","answer":356}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='¿Cuántas decenas hay en 3 560?');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Marca la correcta: 500 + 70 + 2 = ____.',
       'INTERMEDIATE','CHOICE',NULL,'PLACE_VALUE_QA',
       '{"ask":"compose","choices":["572","527","752"],"answer":"572"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Marca la correcta: 500 + 70 + 2 = ____.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Descompón 90 804 en forma desarrollada.',
       'INTERMEDIATE','QA',NULL,'PLACE_VALUE_QA',
       '{"number":90804,"ask":"expanded","answer":"90 000 + 800 + 4"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Descompón 90 804 en forma desarrollada.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'La cifra 3 en 731 250 vale ____.',
       'ADVANCED','QA',NULL,'PLACE_VALUE_QA',
       '{"number":731250,"ask":"value_of_digit","digit":3,"answer":300000}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='La cifra 3 en 731 250 vale ____.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Equivalencias: 12 centenas = ____ unidades.',
       'ADVANCED','QA',NULL,'PLACE_VALUE_QA',
       '{"ask":"hundreds_to_units","hundreds":12,"answer":1200}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Equivalencias: 12 centenas = ____ unidades.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.2')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Selecciona la forma desarrollada de 406 030.',
       'ADVANCED','CHOICE',NULL,'PLACE_VALUE_QA',
       '{"number":406030,"ask":"expanded_choice",
         "choices":["400 000 + 6 000 + 30","406 000 + 30","400 000 + 60 + 30"],"answer":"400 000 + 6 000 + 30"}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Selecciona la forma desarrollada de 406 030.');

-- === LO.1.1.3 — BASE_TEN_BLOCKS_QA (6) ===
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.',
       'BASIC','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":3,"tens":5,"ones":7,"answer":357}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 12 decenas y 4 unidades → escribe el número.',
       'BASIC','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":0,"tens":12,"ones":4,"answer":124}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 12 decenas y 4 unidades → escribe el número.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 8 centenas y 3 unidades → escribe el número.',
       'INTERMEDIATE','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":8,"tens":0,"ones":3,"answer":803}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 8 centenas y 3 unidades → escribe el número.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.',
       'INTERMEDIATE','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":4,"tens":0,"ones":9,"answer":409}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 2 centenas y 15 decenas → escribe el número.',
       'ADVANCED','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":2,"tens":15,"ones":0,"answer":350}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 2 centenas y 15 decenas → escribe el número.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.3')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.',
       'ADVANCED','QA',NULL,'BASE_TEN_BLOCKS_QA',
       '{"hundreds":1,"tens":20,"ones":7,"answer":307}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.');

-- === LO.1.1.4 — NUMBER_SEQUENCE_QA (6) ===
WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[9005,8905,8805,8705,null,8505],"rule":"-100 cada paso","missingIndex":4,"answer":8605}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.',
       'BASIC','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[2400,2450,2500,null,2600],"rule":"+50 cada paso","missingIndex":3,"answer":2550}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[600,540,480,null,360],"rule":"-60 cada paso","missingIndex":3,"answer":420}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.',
       'INTERMEDIATE','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[1005,1015,1025,null,1045],"rule":"+10 cada paso","missingIndex":3,"answer":1035}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.',
       'ADVANCED','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[75000,74500,null,73500,73000],"rule":"-500 cada paso","missingIndex":2,"answer":74000}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.');

WITH lo AS (SELECT id FROM learning_objectives WHERE code = 'LO.1.1.4')
INSERT INTO exercises SELECT gen_random_uuid(),
       'Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.',
       'ADVANCED','QA',NULL,'NUMBER_SEQUENCE_QA',
       '{"sequence":[3005,null,3025,3035,3045],"rule":"+10 cada paso","missingIndex":1,"answer":3015}'::jsonb,
       TRUE,FALSE,(SELECT id FROM lo),'seed','seed',now(),now()
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE learning_objective_id=(SELECT id FROM lo) AND statement='Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.');

-- =========================================
-- 3) HINTS (2 por ejercicio) — CTE locales + NOT EXISTS
-- =========================================
WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.1.3','LO.1.1.4')
    AND e.active = TRUE
), hint_src AS (
  SELECT * FROM (VALUES
    -- LO.1.1.1 — NUMBER_WORDS_BIDIR (10x2)
    ('Escribe en cifras: "dos mil treinta y cinco".','Identifica miles (2000) y unidades/decenas (35).'),
    ('Escribe en cifras: "dos mil treinta y cinco".','“Treinta y cinco” = 35 → 2000 + 35 = 2035.'),
    ('Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".','“Cincuenta y ocho mil” = 58 000; “cuatrocientos doce” = 412.'),
    ('Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".','Suma: 58 000 + 412 = 58 412.'),
    ('Escribe en cifras: "trescientos seis mil doscientos uno".','“Trescientos seis mil” = 306 000.'),
    ('Escribe en cifras: "trescientos seis mil doscientos uno".','Agrega 201 → 306 201.'),
    ('Escribe en cifras: "noventa mil siete".','“Noventa mil” = 90 000; “siete” = 7.'),
    ('Escribe en cifras: "noventa mil siete".','90 000 + 7 = 90 007.'),
    ('Escribe en palabras: 47 305.','Separa por clases: 47 mil y 305.'),
    ('Escribe en palabras: 47 305.','“Cuarenta y siete mil trescientos cinco”.'),
    ('Escribe en palabras: 203 008.','Separa por clases: 203 mil y 8.'),
    ('Escribe en palabras: 203 008.','“Doscientos tres mil ocho”.'),
    ('Escribe en cifras: "cuarenta y dos mil".','No hay centenas/decenas/unidades adicionales.'),
    ('Escribe en cifras: "cuarenta y dos mil".','Resultado directo: 42 000.'),
    ('Escribe en palabras: 600 015.','Identifica 600 mil y 15.'),
    ('Escribe en palabras: 600 015.','“Seiscientos mil quince”.'),
    ('Completa: "trescientos mil ____" corresponde a 300 700.','300 700 = 300 mil + 700.'),
    ('Completa: "trescientos mil ____" corresponde a 300 700.','Falta “setecientos”.'),
    ('Selecciona la escritura correcta de 155 040.','155 040 = 155 mil + 40.'),
    ('Selecciona la escritura correcta de 155 040.','Opción correcta: “ciento cincuenta y cinco mil cuarenta”.'),

    -- LO.1.1.2 — PLACE_VALUE_QA (10x2)
    ('¿Cuál es la cifra de las centenas en 4 827?','Ubica posiciones: millares(4) centenas(8) decenas(2) unidades(7).'),
    ('¿Cuál es la cifra de las centenas en 4 827?','La cifra en centenas es 8.'),
    ('Escribe en forma desarrollada: 6 305.','Descompón en miles, centenas, decenas y unidades.'),
    ('Escribe en forma desarrollada: 6 305.','6 000 + 300 + 5.'),
    ('Selecciona el valor posicional de la cifra 7 en 47 315.','47 315 → 4(10^4), 7(10^3), 3(10^2), 1(10^1), 5(10^0).'),
    ('Selecciona el valor posicional de la cifra 7 en 47 315.','El 7 está en millares.'),
    ('Completa: 80 000 + 400 + 9 = ____.','Suma por grupos: decenas de mil, centenas, unidades.'),
    ('Completa: 80 000 + 400 + 9 = ____.','Resultado: 80 409.'),
    ('¿Cuántas decenas hay en 3 560?','Cada decena son 10 unidades: divide entre 10.'),
    ('¿Cuántas decenas hay en 3 560?','3 560 / 10 = 356.'),
    ('Marca la correcta: 500 + 70 + 2 = ____.','Compón el número desde su forma desarrollada.'),
    ('Marca la correcta: 500 + 70 + 2 = ____.','Resultado: 572.'),
    ('Descompón 90 804 en forma desarrollada.','Observa: 90 000 + 800 + 4.'),
    ('Descompón 90 804 en forma desarrollada.','No hay decenas: 0.'),
    ('La cifra 3 en 731 250 vale ____.','El 3 está en centena de millar (10^5).'),
    ('La cifra 3 en 731 250 vale ____.','Valor: 300 000.'),
    ('Equivalencias: 12 centenas = ____ unidades.','1 centena = 100 unidades.'),
    ('Equivalencias: 12 centenas = ____ unidades.','12 × 100 = 1 200.'),
    ('Selecciona la forma desarrollada de 406 030.','Cientos de mil (400 000), miles (0), centenas (0), decenas (30).'),
    ('Selecciona la forma desarrollada de 406 030.','Correcta: 400 000 + 6 000 + 30.'),

    -- LO.1.1.3 — BASE_TEN_BLOCKS_QA (6x2)
    ('Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.','Cada centena = 100; decena = 10; unidad = 1.'),
    ('Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.','300 + 50 + 7 = 357.'),
    ('Bloques: 12 decenas y 4 unidades → escribe el número.','10 decenas = 1 centena; 12 decenas = 120.'),
    ('Bloques: 12 decenas y 4 unidades → escribe el número.','120 + 4 = 124.'),
    ('Bloques: 8 centenas y 3 unidades → escribe el número.','8 centenas = 800.'),
    ('Bloques: 8 centenas y 3 unidades → escribe el número.','800 + 3 = 803.'),
    ('Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.','4 centenas = 400; 0 decenas = 0.'),
    ('Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.','400 + 0 + 9 = 409.'),
    ('Bloques: 2 centenas y 15 decenas → escribe el número.','15 decenas = 150; 2 centenas = 200.'),
    ('Bloques: 2 centenas y 15 decenas → escribe el número.','200 + 150 = 350.'),
    ('Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.','20 decenas = 200; 1 centena = 100.'),
    ('Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.','100 + 200 + 7 = 307.'),

    -- LO.1.1.4 — NUMBER_SEQUENCE_QA (6x2)
    ('Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.','Observa diferencias: -100 cada paso.'),
    ('Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.','8 705 - 100 = 8 605.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.','Diferencia constante: +50.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.','2 500 + 50 = 2 550.'),
    ('Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.','Diferencia constante: -60.'),
    ('Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.','480 - 60 = 420.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.','Diferencia constante: +10.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.','1 025 + 10 = 1 035.'),
    ('Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.','Diferencia constante: -500.'),
    ('Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.','74 500 - 500 = 74 000.'),
    ('Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.','Diferencia constante: +10.'),
    ('Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.','3 005 + 10 = 3 015.')
  ) AS t(statement, hint_text)
)
INSERT INTO hints (id, hint_text, cost, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), h.hint_text, 1, e.id, TRUE, 'seed','seed', now(), now()
FROM hint_src h
JOIN ex_all e ON e.statement = h.statement
WHERE NOT EXISTS (
  SELECT 1 FROM hints hx
  WHERE hx.exercise_id = e.id
    AND hx.hint_text   = h.hint_text
);

-- =========================================
-- 4) STEPS (2 por ejercicio) — CTE locales + NOT EXISTS
-- =========================================
WITH ex_all AS (
  SELECT e.id, e.statement
  FROM exercises e
  JOIN learning_objectives lo ON lo.id = e.learning_objective_id
  WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.1.3','LO.1.1.4')
    AND e.active = TRUE
), step_src AS (
  SELECT * FROM (VALUES
    -- LO.1.1.1
    ('Escribe en cifras: "dos mil treinta y cinco".', 1, 'Reconoce “dos mil”=2000 y “treinta y cinco”=35.'),
    ('Escribe en cifras: "dos mil treinta y cinco".', 2, 'Suma: 2000 + 35 = 2035.'),
    ('Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".', 1, '58 mil = 58 000; cuatrocientos doce = 412.'),
    ('Escribe en cifras: "cincuenta y ocho mil cuatrocientos doce".', 2, 'Resultado: 58 412.'),
    ('Escribe en cifras: "trescientos seis mil doscientos uno".', 1, '306 mil = 306 000; doscientos uno = 201.'),
    ('Escribe en cifras: "trescientos seis mil doscientos uno".', 2, '306 000 + 201 = 306 201.'),
    ('Escribe en cifras: "noventa mil siete".', 1, 'Noventa mil = 90 000; siete = 7.'),
    ('Escribe en cifras: "noventa mil siete".', 2, 'Total: 90 007.'),
    ('Escribe en palabras: 47 305.', 1, 'Separa: 47 mil y 305.'),
    ('Escribe en palabras: 47 305.', 2, '“Cuarenta y siete mil trescientos cinco”.'),
    ('Escribe en palabras: 203 008.', 1, 'Separa: 203 mil y 8.'),
    ('Escribe en palabras: 203 008.', 2, '“Doscientos tres mil ocho”.'),
    ('Escribe en cifras: "cuarenta y dos mil".', 1, 'Solo miles: 42 000.'),
    ('Escribe en cifras: "cuarenta y dos mil".', 2, 'Resultado: 42 000.'),
    ('Escribe en palabras: 600 015.', 1, 'Descompón: 600 mil y 15.'),
    ('Escribe en palabras: 600 015.', 2, '“Seiscientos mil quince”.'),
    ('Completa: "trescientos mil ____" corresponde a 300 700.', 1, '300 700 = 300 000 + 700.'),
    ('Completa: "trescientos mil ____" corresponde a 300 700.', 2, 'La palabra que falta es “setecientos”.'),
    ('Selecciona la escritura correcta de 155 040.', 1, 'Divide: 155 mil y 40.'),
    ('Selecciona la escritura correcta de 155 040.', 2, '“Ciento cincuenta y cinco mil cuarenta”.'),

    -- LO.1.1.2
    ('¿Cuál es la cifra de las centenas en 4 827?', 1, '4|8|2|7: (millares|centenas|decenas|unidades).'),
    ('¿Cuál es la cifra de las centenas en 4 827?', 2, 'Respuesta: 8.'),
    ('Escribe en forma desarrollada: 6 305.', 1, '6 000 + 300 + 0 + 5.'),
    ('Escribe en forma desarrollada: 6 305.', 2, 'Forma: 6 000 + 300 + 5.'),
    ('Selecciona el valor posicional de la cifra 7 en 47 315.', 1, 'El 7 ocupa millares (10^3).'),
    ('Selecciona el valor posicional de la cifra 7 en 47 315.', 2, 'Respuesta: millares.'),
    ('Completa: 80 000 + 400 + 9 = ____.', 1, 'Suma: 80 000 + 400 + 9.'),
    ('Completa: 80 000 + 400 + 9 = ____.', 2, 'Resultado: 80 409.'),
    ('¿Cuántas decenas hay en 3 560?', 1, 'Decenas = número ÷ 10.'),
    ('¿Cuántas decenas hay en 3 560?', 2, '3 560 / 10 = 356.'),
    ('Marca la correcta: 500 + 70 + 2 = ____.', 1, 'Compón el número.'),
    ('Marca la correcta: 500 + 70 + 2 = ____.', 2, 'Resultado: 572.'),
    ('Descompón 90 804 en forma desarrollada.', 1, '90 000 + 800 + 4 + (0 decenas).'),
    ('Descompón 90 804 en forma desarrollada.', 2, 'Resultado: 90 000 + 800 + 4.'),
    ('La cifra 3 en 731 250 vale ____.', 1, 'Posición: centena de millar.'),
    ('La cifra 3 en 731 250 vale ____.', 2, 'Valor: 300 000.'),
    ('Equivalencias: 12 centenas = ____ unidades.', 1, '1 centena = 100 unidades.'),
    ('Equivalencias: 12 centenas = ____ unidades.', 2, '12 × 100 = 1 200.'),
    ('Selecciona la forma desarrollada de 406 030.', 1, '400 000 + 6 000 + 30.'),
    ('Selecciona la forma desarrollada de 406 030.', 2, 'Esa es la forma correcta.'),

    -- LO.1.1.3
    ('Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.', 1, '3×100 + 5×10 + 7.'),
    ('Bloques: 3 centenas, 5 decenas y 7 unidades → escribe el número.', 2, 'Resultado: 357.'),
    ('Bloques: 12 decenas y 4 unidades → escribe el número.', 1, '12×10 + 4.'),
    ('Bloques: 12 decenas y 4 unidades → escribe el número.', 2, 'Resultado: 124.'),
    ('Bloques: 8 centenas y 3 unidades → escribe el número.', 1, '8×100 + 3.'),
    ('Bloques: 8 centenas y 3 unidades → escribe el número.', 2, 'Resultado: 803.'),
    ('Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.', 1, '4×100 + 0×10 + 9.'),
    ('Bloques: 4 centenas, 0 decenas y 9 unidades → escribe el número.', 2, 'Resultado: 409.'),
    ('Bloques: 2 centenas y 15 decenas → escribe el número.', 1, '2×100 + 15×10.'),
    ('Bloques: 2 centenas y 15 decenas → escribe el número.', 2, '200 + 150 = 350.'),
    ('Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.', 1, '1×100 + 20×10 + 7.'),
    ('Bloques: 1 centena, 20 decenas y 7 unidades → escribe el número.', 2, '100 + 200 + 7 = 307.'),

    -- LO.1.1.4
    ('Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.', 1, 'Identifica la variación: -100.'),
    ('Secuencia: 9 005, 8 905, 8 805, 8 705, ____, 8 505. Escribe el número que falta.', 2, '8 705 - 100 = 8 605.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.', 1, 'Identifica la variación: +50.'),
    ('Secuencia: 2 400, 2 450, 2 500, ____, 2 600. Escribe el número que falta.', 2, '2 500 + 50 = 2 550.'),
    ('Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.', 1, 'Identifica la variación: -60.'),
    ('Secuencia: 600, 540, 480, ____, 360. Escribe el número que falta.', 2, '480 - 60 = 420.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.', 1, 'Identifica la variación: +10.'),
    ('Secuencia: 1 005, 1 015, 1 025, ____, 1 045. Escribe el número que falta.', 2, '1 025 + 10 = 1 035.'),
    ('Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.', 1, 'Identifica la variación: -500.'),
    ('Secuencia: 75 000, 74 500, ____, 73 500, 73 000. Escribe el número que falta.', 2, '74 500 - 500 = 74 000.'),
    ('Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.', 1, 'Identifica la variación: +10.'),
    ('Secuencia: 3 005, ____, 3 025, 3 035, 3 045. Escribe el número que falta.', 2, '3 005 + 10 = 3 015.')
  ) AS t(statement, step_number, explanation)
)
INSERT INTO solution_steps (id, step_number, explanation, exercise_id, active, created_by, updated_by, created_at, updated_at)
SELECT gen_random_uuid(), s.step_number, s.explanation, e.id, TRUE, 'seed','seed', now(), now()
FROM step_src s
JOIN ex_all e ON e.statement = s.statement
WHERE NOT EXISTS (
  SELECT 1 FROM solution_steps sx
  WHERE sx.exercise_id = e.id
    AND sx.step_number = s.step_number
);

-- =========================================
-- 5) RESUMEN (logs)
-- =========================================
SELECT
  (SELECT COUNT(*) FROM exercises e
     JOIN learning_objectives lo ON lo.id=e.learning_objective_id
     WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.1.3','LO.1.1.4')) AS exercises_u1,
  (SELECT COUNT(*) FROM hints h
     JOIN exercises e ON e.id=h.exercise_id
     JOIN learning_objectives lo ON lo.id=e.learning_objective_id
     WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.1.3','LO.1.1.4')) AS hints_u1,
  (SELECT COUNT(*) FROM solution_steps s
     JOIN exercises e ON e.id=s.exercise_id
     JOIN learning_objectives lo ON lo.id=e.learning_objective_id
     WHERE lo.code IN ('LO.1.1.1','LO.1.1.2','LO.1.1.3','LO.1.1.4')) AS steps_u1;
