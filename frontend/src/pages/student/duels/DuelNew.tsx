// src/pages/student/duels/DuelNew.tsx  (o tu ruta actual)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateMatchReq, Difficulty } from "../../../types/duels/duels";
import { createMatch } from "../../../services/duelsService";
import { useAuth } from "../../../context/useAuth";
import {
  ensureActiveCurriculum,
  getActiveCurricula,
  getCurriculumFull,
  setCurrentCurriculumId,
} from "../../../services/curriculumService";
import type {
  CurriculumFullResponse,
  CompetencyNode,
  StandardNode,
  LearningObjectiveNode,
  ExerciseLeaf,
} from "../../../types/curriculum/CurriculumFullResponse";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";

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

type IdName = { id: string; name: string; code?: string };

const difficultyOptions: { label: string; value: Difficulty }[] = [
  { label: "Fácil", value: "EASY" },
  { label: "Medio", value: "MEDIUM" },
  { label: "Difícil", value: "HARD" },
];

const DuelNew: React.FC = () => {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  // Picks
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [curriculumId, setCurriculumId] = useState<string>("");

  const [full, setFull] = useState<CurriculumFullResponse | null>(null);
  const [competencyId, setCompetencyId] = useState<string>("");
  const [standardId, setStandardId] = useState<string>("");
  const [objectiveId, setObjectiveId] = useState<string>("");

  const [exerciseSel, setExerciseSel] = useState<Set<string>>(new Set());

  // Parámetros del duelo
  const [bestOf, setBestOf] = useState<1 | 3 | 5>(1);
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [maxPlayers, setMaxPlayers] = useState<number>(2); // NUEVO

  // Estado UI
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingFull, setLoadingFull] = useState<boolean>(false);

  // Bootstrap: currículo por defecto + lista de activos
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
        // noop
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
    setExerciseSel(new Set());

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

  // Opciones derivadas
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

  const exercises = useMemo<ExerciseLeaf[]>(() => {
    const o = objectives.find((x) => x.id === objectiveId);
    return o?.exercises ?? [];
  }, [objectives, objectiveId]);

  // Helpers UI
  const fmtNode = (n: IdName) => (n.code ? `${n.code} — ${n.name}` : n.name);

  const toggleExercise = (id: string) => {
    setExerciseSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllExercises = () =>
    setExerciseSel(new Set(exercises.map((e) => e.id)));
  const clearAllExercises = () => setExerciseSel(new Set());

  const canSubmit = useMemo(() => {
    return !!curriculumId && (!!objectiveId || exerciseSel.size > 0);
  }, [curriculumId, objectiveId, exerciseSel.size]);

  // Acción crear duelo
  const submit = async () => {
    setError(null);
    if (!isAuthenticated) {
      setError("No hay sesión activa. Inicia sesión.");
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setError("No se encontró el token de acceso.");
      return;
    }
    if (!curriculumId) {
      setError("Elige un currículo.");
      return;
    }
    if (!objectiveId && exerciseSel.size === 0) {
      setError("Elige un objetivo o ejercicios específicos.");
      return;
    }

    try {
      setBusy(true);
      const req: CreateMatchReq = { curriculumId, bestOf };
      if (difficulty) req.difficulty = difficulty;
      if (objectiveId) req.objectiveId = objectiveId;
      if (exerciseSel.size > 0) req.exerciseIds = Array.from(exerciseSel);
      // NUEVO: solo enviamos si > 2 (backward compatible)
      if (Number.isFinite(maxPlayers) && maxPlayers > 2)
        req.maxPlayers = Math.min(8, Math.max(2, maxPlayers));

      const resp = await createMatch(req, token);
      nav(`/student/duels/room?code=${encodeURIComponent(resp.shortCode)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo crear el duelo.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Nuevo duelo</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Elige tu ruta (currículo &rarr; objetivo). Puedes filtrar por dificultad
        o elegir ejercicios específicos.
      </p>

      {/* Currículo */}
      <section className="mb-4 rounded-xl border p-4 dark:border-gray-700">
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

          <div className="flex items-center gap-2">
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
        </div>
      </section>

      {/* Cascada Comp → Std → OA */}
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border p-4 dark:border-gray-700">
          <div className="mb-1 text-sm font-medium">Competencia</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={competencyId}
            onChange={(e) => {
              setCompetencyId(e.target.value);
              setStandardId("");
              setObjectiveId("");
              setExerciseSel(new Set());
            }}
            disabled={!full}
          >
            <option value="">Selecciona…</option>
            {competencies.map((n) => (
              <option key={n.id} value={n.id}>
                {fmtNode({ id: n.id, name: n.name, code: n.code })}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border p-4 dark:border-gray-700">
          <div className="mb-1 text-sm font-medium">Estándar</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={standardId}
            onChange={(e) => {
              setStandardId(e.target.value);
              setObjectiveId("");
              setExerciseSel(new Set());
            }}
            disabled={!competencyId}
          >
            <option value="">Selecciona…</option>
            {standards.map((n) => (
              <option key={n.id} value={n.id}>
                {fmtNode({ id: n.id, name: n.name, code: n.code })}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border p-4 dark:border-gray-700">
          <div className="mb-1 text-sm font-medium">Objetivo</div>
          <select
            className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={objectiveId}
            onChange={(e) => {
              setObjectiveId(e.target.value);
              setExerciseSel(new Set());
            }}
            disabled={!standardId}
          >
            <option value="">Selecciona…</option>
            {objectives.map((n) => (
              <option key={n.id} value={n.id}>
                {fmtNode({ id: n.id, name: n.name, code: n.code })}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Dificultad + Best of + Max players */}
      <section className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border p-4 dark:border-gray-700">
          <div className="mb-2 text-sm font-medium">Dificultad (opcional)</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setDifficulty("")}
              className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                difficulty === ""
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
                onClick={() => setDifficulty(opt.value)}
                className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                  difficulty === opt.value
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4 dark:border-gray-700">
          <div className="mb-2 text-sm font-medium">Al mejor de…</div>
          <div className="flex gap-2">
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setBestOf(n as 1 | 3 | 5)}
                className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                  bestOf === n
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-4 dark:border-gray-700">
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

      {/* Ejercicios específicos */}
      <section className="mb-4 rounded-xl border p-4 dark:border-gray-700">
        <div className="mb-1 text-sm font-semibold">
          (Opcional) Elegir ejercicios específicos
        </div>
        <p className="mb-3 text-xs opacity-75">
          Si seleccionas alguno, el duelo usará exactamente esos ítems. Si no
          seleccionas, se elegirá aleatoriamente dentro del objetivo.
        </p>

        {!objectiveId && (
          <div className="text-sm opacity-70">
            Selecciona un objetivo para ver sus ejercicios.
          </div>
        )}

        {objectiveId && exercises.length === 0 && (
          <div className="text-sm opacity-70">
            Este objetivo aún no tiene ejercicios.
          </div>
        )}

        {objectiveId && exercises.length > 0 && (
          <>
            <div className="mb-2 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={selectAllExercises}
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={clearAllExercises}
              >
                Limpiar
              </button>
              <div className="text-xs opacity-70">
                Elegidos: {exerciseSel.size} / {exercises.length}
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {exercises.map((ex) => (
                <label
                  key={ex.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm dark:border-gray-700 ${
                    exerciseSel.has(ex.id)
                      ? "ring-2 ring-emerald-500"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={exerciseSel.has(ex.id)}
                    onChange={() => toggleExercise(ex.id)}
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
              ))}
            </div>
          </>
        )}
      </section>

      {/* Errores */}
      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Acción */}
      <button
        onClick={submit}
        disabled={!canSubmit || busy}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {busy ? "Creando…" : "Crear duelo"}
      </button>
    </div>
  );
};

export default DuelNew;
