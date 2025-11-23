// src/pages/student/duels/DuelNewAdvanced.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {
  ensureActiveCurriculum,
  getActiveCurricula,
  getCurriculumFull,
  setCurrentCurriculumId,
} from "../../../services/curriculumService";
import { createMatch, ApiError } from "../../../services/duelsService";
import type {
  CurriculumFullResponse,
  CompetencyNode,
  StandardNode,
  LearningObjectiveNode,
  ExerciseLeaf,
} from "../../../types/curriculum/CurriculumFullResponse";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import type {
  Difficulty,
  CreateMatchReq,
  RoundPlan,
  DuelMode,
} from "../../../types/duels/duels";

function getAccessToken(): string | null {
  try {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  } catch {
    return null;
  }
}

const difficultyOptions: { label: string; value: Difficulty }[] = [
  { label: "Fácil", value: "EASY" },
  { label: "Medio", value: "MEDIUM" },
  { label: "Difícil", value: "HARD" },
];

const MAX_ROUNDS = 9;
const MIN_ROUNDS = 1;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const MIN_Q_PER_ROUND = 1;
const MAX_Q_PER_ROUND = 10;

// === Helpers de ejercicios ===

type MaybeActiveFlags = {
  active?: boolean;
  isActive?: boolean;
};

function hasActiveFlags(
  ex: ExerciseLeaf
): ex is ExerciseLeaf & MaybeActiveFlags {
  return "active" in ex || "isActive" in ex;
}

function isActiveExercise(ex: ExerciseLeaf): boolean {
  if (hasActiveFlags(ex)) {
    if (typeof ex.active === "boolean") return ex.active;
    if (typeof ex.isActive === "boolean") return ex.isActive;
  }
  return true;
}

function fmtExerciseDifficulty(ex: ExerciseLeaf): string {
  const raw = String(ex.difficulty ?? "").toUpperCase();
  if (raw === "BASIC") return "Fácil";
  if (raw === "INTERMEDIATE") return "Medio";
  if (raw === "ADVANCED") return "Difícil";
  return raw || "—";
}

const DuelNewAdvanced: React.FC = () => {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  // Picks de currículo → OA
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [curriculumId, setCurriculumId] = useState<string>("");
  const [full, setFull] = useState<CurriculumFullResponse | null>(null);

  const [competencyId, setCompetencyId] = useState<string>("");
  const [standardId, setStandardId] = useState<string>("");
  const [objectiveId, setObjectiveId] = useState<string>("");

  const [loadingFull, setLoadingFull] = useState(false);

  // Ejercicios del OA (para seleccionar por ronda)
  const [exercises, setExercises] = useState<ExerciseLeaf[]>([]);

  // Parámetros avanzados
  const [roundsCount, setRoundsCount] = useState<number>(3);
  const [rounds, setRounds] = useState<RoundPlan[]>([
    { questions: 2, difficulty: "EASY", exerciseIds: [] },
    { questions: 3, difficulty: "MEDIUM", exerciseIds: [] },
    { questions: 4, difficulty: "EASY", exerciseIds: [] },
  ]);

  const [maxPlayers, setMaxPlayers] = useState<number>(2);

  // Modos/timers globales
  const [mode, setMode] = useState<DuelMode>("bestOf");
  const [questionTimeSec, setQuestionTimeSec] = useState<number>(30);
  const [winTarget, setWinTarget] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* ========== Bootstrap ========== */
  useEffect(() => {
    let canceled = false;
    const ctrl = new AbortController();

    const boot = async () => {
      try {
        const ensured = await ensureActiveCurriculum(ctrl.signal);
        if (!canceled && ensured) setCurriculumId(ensured);

        const list = await getActiveCurricula();
        if (!canceled) setCurricula(list);
      } catch {
        /* noop */
      }
    };
    void boot();

    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, []);

  /* ========== Cargar estructura completa ========== */
  useEffect(() => {
    if (!curriculumId) {
      setFull(null);
      return;
    }
    setCurrentCurriculumId(curriculumId);

    let canceled = false;
    const ctrl = new AbortController();
    setLoadingFull(true);
    setCompetencyId("");
    setStandardId("");
    setObjectiveId("");
    setExercises([]);

    getCurriculumFull(curriculumId, ctrl.signal)
      .then((tree) => {
        if (!canceled) setFull(tree);
      })
      .catch(() => {
        if (!canceled) setFull(null);
      })
      .finally(() => {
        if (!canceled) setLoadingFull(false);
      });

    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, [curriculumId]);

  /* ========== Derivados ========== */
  const competencies = useMemo<CompetencyNode[]>(
    () => full?.competencies ?? [],
    [full]
  );

  const standards = useMemo<StandardNode[]>(() => {
    const c = competencies.find((x) => x.id === competencyId);
    return c?.standards ?? [];
  }, [competencies, competencyId]);

  const objectives = useMemo<LearningObjectiveNode[]>(() => {
    const s = standards.find((x) => x.id === standardId);
    return s?.learningObjectives ?? [];
  }, [standards, standardId]);

  const allExercises = useMemo<ExerciseLeaf[]>(() => {
    const o = objectives.find((x) => x.id === objectiveId);
    return o?.exercises ?? [];
  }, [objectives, objectiveId]);

  const activeExercises = useMemo<ExerciseLeaf[]>(
    () => allExercises.filter(isActiveExercise),
    [allExercises]
  );

  // Cuando hay OA, sincroniza lista local y limpia picks
  useEffect(() => {
    setExercises(activeExercises);
    setRounds((prev) =>
      prev.map((r) => ({
        ...r,
        exerciseIds: [],
      }))
    );
  }, [activeExercises]);

  /* ========== Ajustar longitud del array de rondas ========== */
  useEffect(() => {
    setRounds((prev) => {
      const next = [...prev];
      if (roundsCount > next.length) {
        while (next.length < roundsCount && next.length < MAX_ROUNDS) {
          next.push({ questions: 2, difficulty: "EASY", exerciseIds: [] });
        }
      } else if (roundsCount < next.length) {
        next.length = roundsCount;
      }
      return next;
    });
  }, [roundsCount]);

  /* ========== Reglas de validación ========== */
  const canSubmit = useMemo(() => {
    if (!curriculumId || !objectiveId) return false;
    if (rounds.length === 0) return false;

    for (const r of rounds) {
      const q = Number(r.questions) || 0;
      if (!Number.isFinite(q) || q < MIN_Q_PER_ROUND || q > MAX_Q_PER_ROUND) {
        return false;
      }

      const picks = r.exerciseIds?.length ?? 0;
      if (picks > q) return false;
    }

    if (maxPlayers < MIN_PLAYERS || maxPlayers > MAX_PLAYERS) return false;

    if (
      mode === "timePerQuestion" &&
      (!Number.isFinite(questionTimeSec) || questionTimeSec <= 0)
    ) {
      return false;
    }
    if (
      mode === "firstToAll" &&
      (!Number.isFinite(winTarget) || winTarget <= 0)
    ) {
      return false;
    }

    return true;
  }, [
    curriculumId,
    objectiveId,
    rounds,
    maxPlayers,
    mode,
    questionTimeSec,
    winTarget,
  ]);

  /* ========== Toggle picks ========== */
  const toggleExerciseForRound = (roundIdx: number, exId: string) => {
    setRounds((prev) => {
      const next = [...prev];
      const r = { ...next[roundIdx] };
      const current = new Set(r.exerciseIds ?? []);
      if (current.has(exId)) {
        current.delete(exId);
      } else {
        current.add(exId);
      }

      const picksCount = current.size;

      r.exerciseIds = Array.from(current);
      if (picksCount > 0) {
        r.questions = Math.min(
          MAX_Q_PER_ROUND,
          Math.max(MIN_Q_PER_ROUND, picksCount)
        );
        r.difficulty = undefined;
      } else {
        r.questions = Math.min(
          MAX_Q_PER_ROUND,
          Math.max(MIN_Q_PER_ROUND, Number(r.questions) || MIN_Q_PER_ROUND)
        );
      }

      next[roundIdx] = r;
      return next;
    });
  };

  /* ========== Cambio preguntas ========== */
  const onChangeQuestions = (roundIdx: number, value: number) => {
    setRounds((prev) => {
      const next = [...prev];
      const r = { ...next[roundIdx] };
      const q = Math.min(
        MAX_Q_PER_ROUND,
        Math.max(MIN_Q_PER_ROUND, value || MIN_Q_PER_ROUND)
      );

      const picks = r.exerciseIds?.length ?? 0;
      if (picks > q) {
        r.exerciseIds = (r.exerciseIds ?? []).slice(0, q);
      }
      r.questions = q;
      next[roundIdx] = r;
      return next;
    });
  };

  /* ========== Cambio dificultad (ignora si hay picks) ========== */
  const setRoundDifficulty = (roundIdx: number, d?: Difficulty) => {
    setRounds((prev) => {
      const next = [...prev];
      const r = { ...next[roundIdx] };
      const hasPicks = (r.exerciseIds?.length ?? 0) > 0;
      if (!hasPicks) {
        r.difficulty = d;
      }
      next[roundIdx] = r;
      return next;
    });
  };

  const token = getAccessToken() || "";

  // Payload normalizado que realmente enviaremos
  const normalizedRounds: RoundPlan[] = useMemo(() => {
    return rounds.map((r) => {
      const picks = r.exerciseIds?.length ?? 0;
      if (picks > 0) {
        return {
          questions: Math.min(
            MAX_Q_PER_ROUND,
            Math.max(MIN_Q_PER_ROUND, picks)
          ),
          exerciseIds: r.exerciseIds,
        };
      }
      return {
        questions: Math.min(
          MAX_Q_PER_ROUND,
          Math.max(MIN_Q_PER_ROUND, Number(r.questions) || MIN_Q_PER_ROUND)
        ),
        difficulty: r.difficulty,
      };
    });
  }, [rounds]);

  /* ========== Submit ========== */
  const submit = async () => {
    setError(null);
    if (!isAuthenticated) {
      setError("No hay sesión activa. Inicia sesión.");
      return;
    }
    if (!token) {
      setError("No se encontró el token de acceso.");
      return;
    }

    try {
      setBusy(true);
      const req: CreateMatchReq = {
        curriculumId,
        bestOf: Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, rounds.length)),
        objectiveId,
        rounds: normalizedRounds,
        maxPlayers: Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, maxPlayers)),
        isPublic: true,
        mode,
        questionTimeSec:
          mode === "timePerQuestion"
            ? Math.max(5, Math.min(300, questionTimeSec || 30))
            : undefined,
        winTarget:
          mode === "firstToAll"
            ? Math.max(1, Math.min(50, winTarget || 1))
            : undefined,
      };

      const resp = await createMatch(req, token, { timeoutMs: 25_000 });
      nav(`/student/duels/room?code=${encodeURIComponent(resp.shortCode)}`);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422) {
          setError(
            e.message ||
              "La configuración del duelo no es válida (422). Revisa picks, pertenencia y estado de ejercicios."
          );
          return;
        }
        if (e.status === 400) {
          setError(e.message || "Solicitud inválida (400).");
          return;
        }
      }
      setError(e instanceof Error ? e.message : "No se pudo crear el duelo.");
    } finally {
      setBusy(false);
    }
  };

  /* ========== UI ========== */
  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Duelo avanzado (por rondas)</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Define cuántas rondas habrá y configura preguntas y dificultad por
        ronda.
        <br className="hidden sm:block" />
        <span className="opacity-80">
          Si eliges ejercicios exactos en una ronda,{" "}
          <b>ignoraremos la dificultad</b> y usaremos exactamente esos
          ejercicios.
        </span>
      </p>

      {/* Currículo */}
      <section className="mb-4 rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="mb-1 block text-sm font-medium">Currículo</label>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={curriculumId}
            onChange={(e) => setCurriculumId(e.target.value)}
            aria-label="Selecciona un currículo"
            disabled={busy}
          >
            <option value="">Selecciona…</option>
            {curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.grade})
              </option>
            ))}
          </select>
          <div className="text-xs opacity-70">
            {loadingFull
              ? "Cargando estructura…"
              : full
              ? "Estructura lista"
              : curriculumId
              ? "No se pudo cargar"
              : ""}
          </div>
        </div>
      </section>

      {/* Cascada Comp → Std → OA */}
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-1 text-sm font-medium">Competencia</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={competencyId}
            onChange={(e) => {
              setCompetencyId(e.target.value);
              setStandardId("");
              setObjectiveId("");
              setExercises([]);
            }}
            disabled={!full || busy}
            aria-label="Selecciona una competencia"
          >
            <option value="">Selecciona…</option>
            {competencies.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.code} — ${n.name}` : n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-1 text-sm font-medium">Estándar</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={standardId}
            onChange={(e) => {
              setStandardId(e.target.value);
              setObjectiveId("");
              setExercises([]);
            }}
            disabled={!competencyId || busy}
            aria-label="Selecciona un estándar"
          >
            <option value="">Selecciona…</option>
            {standards.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.code} — ${n.name}` : n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-1 text-sm font-medium">Objetivo</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            disabled={!standardId || busy}
            aria-label="Selecciona un objetivo de aprendizaje"
          >
            <option value="">Selecciona…</option>
            {objectives.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.code} — ${n.name}` : n.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Config global simple */}
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-sm font-medium">Número de rondas</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_ROUNDS}
              max={MAX_ROUNDS}
              value={roundsCount}
              onChange={(e) => {
                const v = Number(e.target.value) || MIN_ROUNDS;
                setRoundsCount(Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, v)));
              }}
              disabled={busy}
              className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
              aria-label="Número de rondas"
            />
            <span className="text-xs opacity-70">
              {MIN_ROUNDS}–{MAX_ROUNDS}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-sm font-medium">Jugadores máximos</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_PLAYERS}
              max={MAX_PLAYERS}
              value={maxPlayers}
              onChange={(e) => {
                const v = Number(e.target.value) || MIN_PLAYERS;
                setMaxPlayers(Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, v)));
              }}
              disabled={busy}
              className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
              aria-label="Jugadores máximos"
            />
            <span className="text-xs opacity-70">
              {MIN_PLAYERS}–{MAX_PLAYERS}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-2 text-sm font-medium">Modo del duelo</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm dark:border-gray-700 ${
                mode === "bestOf"
                  ? "ring-2 ring-emerald-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === "bestOf"}
                onChange={() => setMode("bestOf")}
                disabled={busy}
              />
              Mejor de N (por rondas)
            </label>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm dark:border-gray-700 ${
                mode === "timePerQuestion"
                  ? "ring-2 ring-emerald-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === "timePerQuestion"}
                onChange={() => setMode("timePerQuestion")}
                disabled={busy}
              />
              Tiempo por pregunta
            </label>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm dark:border-gray-700 ${
                mode === "firstToAll"
                  ? "ring-2 ring-emerald-500"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
              }`}
            >
              <input
                type="radio"
                name="mode"
                checked={mode === "firstToAll"}
                onChange={() => setMode("firstToAll")}
                disabled={busy}
              />
              Primero en llegar a meta
            </label>
          </div>

          {mode === "timePerQuestion" && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Segundos por pregunta</label>
              <input
                type="number"
                min={5}
                max={300}
                value={questionTimeSec}
                onChange={(e) => {
                  const v = Number(e.target.value) || 30;
                  setQuestionTimeSec(Math.max(5, Math.min(300, v)));
                }}
                disabled={busy}
                className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
                aria-label="Segundos por pregunta"
              />
              <span className="text-xs opacity-70">5–300</span>
            </div>
          )}

          {mode === "firstToAll" && (
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Meta de aciertos</label>
              <input
                type="number"
                min={1}
                max={50}
                value={winTarget || 1}
                onChange={(e) => {
                  const v = Number(e.target.value) || 1;
                  setWinTarget(Math.max(1, Math.min(50, v)));
                }}
                disabled={busy}
                className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
                aria-label="Meta de aciertos"
              />
              <span className="text-xs opacity-70">1–50</span>
            </div>
          )}
        </div>
      </section>

      {/* Config por ronda */}
      <section className="mb-4 rounded-2xl border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-lg font-semibold">Rondas</h2>

        <div className="grid gap-3">
          {rounds.map((r, idx) => {
            const picksCount = r.exerciseIds?.length ?? 0;
            const difficultyDisabled = picksCount > 0;

            return (
              <div
                key={idx}
                className="rounded-xl border p-3 dark:border-gray-700"
              >
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-medium">Ronda {idx + 1}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs opacity-70">
                    {picksCount > 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                        {picksCount} picks seleccionados · dificultad ignorada
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                        Sin picks · usa dificultad
                      </span>
                    )}
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      Preguntas: {r.questions}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {/* Dificultad */}
                  <div>
                    <div className="mb-1 text-sm">Dificultad</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setRoundDifficulty(idx, undefined)}
                        disabled={difficultyDisabled || busy}
                        className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                          !r.difficulty
                            ? "bg-emerald-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        } ${difficultyDisabled || busy ? "opacity-50" : ""}`}
                        title={
                          difficultyDisabled
                            ? "Hay picks: se ignora dificultad"
                            : undefined
                        }
                      >
                        Cualquiera
                      </button>
                      {difficultyOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRoundDifficulty(idx, opt.value)}
                          disabled={difficultyDisabled || busy}
                          className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                            r.difficulty === opt.value
                              ? "bg-emerald-600 text-white"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          } ${difficultyDisabled || busy ? "opacity-50" : ""}`}
                          title={
                            difficultyDisabled
                              ? "Hay picks: se ignora dificultad"
                              : undefined
                          }
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preguntas */}
                  <div>
                    <div className="mb-1 text-sm">Preguntas</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={MIN_Q_PER_ROUND}
                        max={MAX_Q_PER_ROUND}
                        value={r.questions}
                        onChange={(e) =>
                          onChangeQuestions(
                            idx,
                            Number(e.target.value) || MIN_Q_PER_ROUND
                          )
                        }
                        disabled={busy}
                        className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
                        aria-label={`Preguntas en la ronda ${idx + 1}`}
                      />
                      <span className="text-xs opacity-70">
                        {MIN_Q_PER_ROUND}–{MAX_Q_PER_ROUND}
                      </span>
                    </div>
                    {picksCount > 0 && (
                      <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                        Ajustado automáticamente a {picksCount} por tus picks.
                      </div>
                    )}
                  </div>

                  {/* Ayuda picks */}
                  <div>
                    <div className="mb-1 text-sm">Picks (opcional)</div>
                    <div className="text-xs opacity-70">
                      Puedes elegir ejercicios concretos. Máximo: {r.questions}.
                    </div>
                  </div>
                </div>

                {/* Lista de ejercicios para esta ronda */}
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {objectiveId && exercises.length > 0 ? (
                    exercises.map((ex) => {
                      const checked = (r.exerciseIds ?? []).includes(ex.id);
                      const disabled =
                        busy ||
                        (!checked &&
                          (r.exerciseIds?.length ?? 0) >=
                            (r.questions || MIN_Q_PER_ROUND));

                      return (
                        <label
                          key={ex.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm dark:border-gray-700 ${
                            checked
                              ? "ring-2 ring-emerald-500"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          } ${disabled ? "opacity-50" : ""}`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleExerciseForRound(idx, ex.id)}
                            aria-label={`Elegir ejercicio ${
                              ex.id
                            } para la ronda ${idx + 1}`}
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="truncate font-medium">
                                {ex.templateType ?? ex.type ?? "Ejercicio"}
                              </div>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] uppercase text-gray-700">
                                {fmtExerciseDifficulty(ex)}
                              </span>
                            </div>
                            <div className="line-clamp-2 opacity-80">
                              {ex.statement}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-sm opacity-70">
                      Selecciona un objetivo para ver ejercicios.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumen de normalización */}
      {objectiveId && (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200">
          <div className="mb-1 font-semibold">Resumen antes de crear</div>
          <ul className="list-inside list-disc space-y-1">
            {normalizedRounds.map((r, i) => (
              <li key={i}>
                Ronda {i + 1}:{" "}
                {r.exerciseIds?.length
                  ? `usará ${r.exerciseIds.length} picks exactos (dificultad ignorada)`
                  : `preguntas = ${r.questions}${
                      r.difficulty
                        ? ` · dificultad = ${r.difficulty}`
                        : " · dificultad cualquiera"
                    }`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div
          className="mb-3 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-100"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={!canSubmit || busy}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Creando…" : "Crear duelo avanzado"}
        </button>
        <button
          onClick={() => nav("/student/duels/hub")}
          disabled={busy}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 disabled:opacity-50"
        >
          Volver al Hub
        </button>
      </div>
    </div>
  );
};

export default DuelNewAdvanced;
