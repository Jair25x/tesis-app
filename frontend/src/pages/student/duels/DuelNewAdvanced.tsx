import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/useAuth";
import {
  ensureActiveCurriculum,
  getActiveCurricula,
  getCurriculumFull,
  setCurrentCurriculumId,
} from "../../../services/curriculumService";
import { createMatch } from "../../../services/duelsService";
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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Boot: currículo por defecto + lista de activos
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
        /* empty */
      }
    };
    void boot();

    return () => {
      canceled = true;
      ctrl.abort();
    };
  }, []);

  // Cargar estructura completa al cambiar de currículo
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

  // Cuando hay OA, sincroniza lista local
  useEffect(() => {
    setExercises(allExercises);
    // limpiar picks si cambia el OA
    setRounds((prev) =>
      prev.map((r) => ({ ...r, exerciseIds: r.exerciseIds?.length ? [] : [] }))
    );
  }, [allExercises]);

  // Ajustar longitud del array de rondas cuando cambie roundsCount
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

  const canSubmit = useMemo(() => {
    if (!curriculumId || !objectiveId) return false;
    if (rounds.length === 0) return false;
    // cada ronda debe tener al menos 1 pregunta; si hay picks manuales, no exceder questions
    for (const r of rounds) {
      if (!Number.isFinite(r.questions) || (r.questions as number) < 1)
        return false;
      if ((r.exerciseIds?.length || 0) > (r.questions as number)) return false;
    }
    return true;
  }, [curriculumId, objectiveId, rounds]);

  // Toggle un ejercicio para una ronda concreta
  const toggleExerciseForRound = (roundIdx: number, exId: string) => {
    setRounds((prev) => {
      const next = [...prev];
      const r = { ...next[roundIdx] };
      const set = new Set(r.exerciseIds || []);
      if (set.has(exId)) set.delete(exId);
      else set.add(exId);
      r.exerciseIds = Array.from(set);
      next[roundIdx] = r;
      return next;
    });
  };

  const token = getAccessToken() || "";

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
        bestOf: rounds.length,
        objectiveId,
        rounds: rounds.map((r) => ({
          questions: Math.max(1, Math.min(10, r.questions || 1)),
          difficulty: r.difficulty,
          exerciseIds:
            r.exerciseIds && r.exerciseIds.length > 0
              ? r.exerciseIds
              : undefined,
        })),
        maxPlayers: Math.min(8, Math.max(2, maxPlayers)),
        isPublic: true,
      };
      const resp = await createMatch(req, token);
      // redirige a sala por código corto
      nav(`/student/duels/room?code=${encodeURIComponent(resp.shortCode)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear el duelo.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Duelo avanzado (por rondas)</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Define cuántas rondas habrá y configura preguntas y dificultad por
        ronda. Opcional: escoge los ejercicios exactos que irán en cada ronda.
      </p>

      {/* Currículo */}
      <section className="mb-4 rounded-2xl border p-4 dark:border-gray-700">
        <label className="mb-1 block text-sm font-medium">Currículo</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={curriculumId}
            onChange={(e) => setCurriculumId(e.target.value)}
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
        <div className="rounded-2xl border p-4 dark:border-gray-700">
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
            disabled={!full}
          >
            <option value="">Selecciona…</option>
            {competencies.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.code} — ${n.name}` : n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="mb-1 text-sm font-medium">Estándar</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={standardId}
            onChange={(e) => {
              setStandardId(e.target.value);
              setObjectiveId("");
              setExercises([]);
            }}
            disabled={!competencyId}
          >
            <option value="">Selecciona…</option>
            {standards.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.code} — ${n.name}` : n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="mb-1 text-sm font-medium">Objetivo</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            disabled={!standardId}
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
      <section className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="mb-2 text-sm font-medium">Número de rondas</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={MAX_ROUNDS}
              value={roundsCount}
              onChange={(e) => {
                const v = Number(e.target.value) || 1;
                setRoundsCount(Math.max(1, Math.min(MAX_ROUNDS, v)));
              }}
              className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
            />
            <span className="text-xs opacity-70">1–{MAX_ROUNDS}</span>
          </div>
        </div>

        <div className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="mb-2 text-sm font-medium">Jugadores máximos</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={2}
              max={8}
              value={maxPlayers}
              onChange={(e) => {
                const v = Number(e.target.value) || 2;
                setMaxPlayers(Math.max(2, Math.min(8, v)));
              }}
              className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
            />
            <span className="text-xs opacity-70">2–8</span>
          </div>
        </div>
      </section>

      {/* Config por ronda */}
      <section className="mb-4 rounded-2xl border p-4 dark:border-gray-700">
        <h2 className="mb-3 text-lg font-semibold">Rondas</h2>
        <div className="grid gap-3">
          {rounds.map((r, idx) => (
            <div
              key={idx}
              className="rounded-xl border p-3 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-medium">Ronda {idx + 1}</div>
                <div className="text-xs opacity-70">
                  (elige dificultad, preguntas y —opcional— ejercicios)
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="mb-1 text-sm">Dificultad</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRounds((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], difficulty: undefined };
                          return next;
                        })
                      }
                      className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                        !r.difficulty
                          ? "bg-emerald-600 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Cualquiera
                    </button>
                    {difficultyOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setRounds((prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], difficulty: opt.value };
                            return next;
                          })
                        }
                        className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                          r.difficulty === opt.value
                            ? "bg-emerald-600 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm">Preguntas</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={r.questions}
                      onChange={(e) => {
                        const v = Number(e.target.value) || 1;
                        setRounds((prev) => {
                          const next = [...prev];
                          next[idx] = {
                            ...next[idx],
                            questions: Math.max(1, Math.min(10, v)),
                          };
                          // si hay más picks que preguntas, recorta
                          if (
                            (next[idx].exerciseIds?.length || 0) >
                            next[idx].questions
                          ) {
                            next[idx].exerciseIds = next[
                              idx
                            ].exerciseIds?.slice(0, next[idx].questions);
                          }
                          return next;
                        });
                      }}
                      className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm">Picks (opcional)</div>
                  <div className="text-xs opacity-70">
                    Puedes elegir hasta {r.questions} ejercicios.
                  </div>
                </div>
              </div>

              {/* Lista de ejercicios para esta ronda */}
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {objectiveId && exercises.length > 0 ? (
                  exercises.map((ex) => {
                    const checked = (r.exerciseIds || []).includes(ex.id);
                    const disabled =
                      !checked &&
                      (r.exerciseIds?.length || 0) >= (r.questions || 1);
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
                        />
                        <div>
                          <div className="font-medium">
                            {ex.templateType ?? ex.type ?? "Ejercicio"}{" "}
                            <span className="uppercase opacity-80">
                              · {ex.difficulty}
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
          ))}
        </div>
      </section>

      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={submit}
          disabled={!canSubmit || busy}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {busy ? "Creando…" : "Crear duelo avanzado"}
        </button>
        <button
          onClick={() => nav("/student/duels/hub")}
          className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Volver al Hub
        </button>
      </div>
    </div>
  );
};

export default DuelNewAdvanced;
