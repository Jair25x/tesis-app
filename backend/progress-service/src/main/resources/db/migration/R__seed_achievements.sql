-- Catálogo de logros. Idempotente vía UNIQUE(code).

INSERT INTO achievements (id, code, name, description, condition_type, threshold, active, points, created_at, updated_at)
VALUES
  -- Existentes (tu DataInit)
  (gen_random_uuid(), 'FIRST_TRY', '¡A la primera!', 'Responde un ejercicio correctamente en el primer intento', 'ATTEMPT_FIRST_CORRECT', 1, TRUE, 10, now(), now()),
  (gen_random_uuid(), 'FIVE_IN_ROW', 'Racha de aciertos x5', 'Obtén 5 aciertos consecutivos', 'STREAK_CORRECT', 5, TRUE, 25, now(), now()),
  (gen_random_uuid(), 'DAILY_STARTER', 'Comenzó el día', 'Completa tu primer intento del día', 'FIRST_ATTEMPT_OF_DAY', 1, TRUE, 5, now(), now()),
  -- Duelos (nuevos)
  (gen_random_uuid(), 'DUEL_FIRST_WIN', '¡Primera victoria en duelo!', 'Gana tu primer duelo', 'DUEL_WINS_TOTAL', 1, TRUE, 50, now(), now()),
  (gen_random_uuid(), 'DUEL_FAST_ANSWER', 'Rápido como un rayo', 'Responde bien en ≤ 5s en un duelo', 'DUEL_FAST_CORRECT', 1, TRUE, 30, now(), now()),
  (gen_random_uuid(), 'DUEL_BEST_OF_THREE_WINNER', 'Rey del BO3', 'Gana un duelo al mejor de 3', 'DUEL_BO3_WIN', 1, TRUE, 80, now(), now())
ON CONFLICT DO NOTHING;
