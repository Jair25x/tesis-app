// src/pages/student/duels/DuelNew.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateMatchReq, Difficulty } from "../../../types/duels/duels";
import {
  createMatch,
  getObjectiveAvailability,
  ApiError,
} from "../../../services/duelsService";
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
import { useToastError } from "../../../hooks/useToastError";

// ⬇️ NUEVO: helper de presets
import { buildCreateMatchReq } from "../../../features/duels/createMatchPresets";

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

const DEFAULT_QPR = 3;
const QPR_MIN = 1;
const QPR_MAX = 10;

/** —— Type guards —— */
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

// Mapea UI (EASY|MEDIUM|HARD) -> BD (BASIC|INTERMEDIATE|ADVANCED)
function exerciseMatchesDifficulty(
  ex: ExerciseLeaf,
  d: Difficulty | ""
): boolean {
  if (!d) return true;
  const exDiff = String(ex.difficulty ?? "").toUpperCase();
  const mapUiToDb: Record<Difficulty, "BASIC" | "INTERMEDIATE" | "ADVANCED"> = {
    EASY: "BASIC",
    MEDIUM: "INTERMEDIATE",
    HARD: "ADVANCED",
  };
  return exDiff === mapUiToDb[d];
}

function availableExercises(
  oa: LearningObjectiveNode | undefined,
  difficulty: Difficulty | ""
): ExerciseLeaf[] {
  if (!oa?.exercises || oa.exercises.length === 0) return [];
  return oa.exercises.filter(
    (ex) => isActiveExercise(ex) && exerciseMatchesDifficulty(ex, difficulty)
  );
}

function pickFirstObjectiveWithExercises(
  full: CurriculumFullResponse | null,
  difficulty: Difficulty | ""
): { id: string; count: number } | null {
  if (!full) return null;
  for (const comp of full.competencies ?? []) {
    for (const std of comp.standards ?? []) {
      for (const oa of std.learningObjectives ?? []) {
        const count = availableExercises(oa, difficulty).length;
        if (count > 0) return { id: oa.id, count };
      }
    }
  }
  return null;
}

const DuelNew: React.FC = () => {
  const nav = useNavigate();
  const { isAuthenticated } = useAuth();

  // Datos base
  const [curricula, setCurricula] = useState<CurriculumResponse[]>([]);
  const [curriculumId, setCurriculumId] = useState<string>("");

  const [full, setFull] = useState<CurriculumFullResponse | null>(null);
  const [competencyId, setCompetencyId] = useState<string>("");
  const [standardId, setStandardId] = useState<string>("");
  const [objectiveId, setObjectiveId] = useState<string>("");

  // Estado UI
  const [busy, setBusy] = useState<boolean>(false);
  const [, /* error */ setError] = useState<string | null>(null);
  const [loadingFull, setLoadingFull] = useState<boolean>(false);

  // Duelo rápido
  const [quickOpen, setQuickOpen] = useState<boolean>(true);
  const [quickDifficulty, setQuickDifficulty] = useState<Difficulty | "">("");
  const [quickQPR, setQuickQPR] = useState<number>(DEFAULT_QPR);

  // Disponibilidad (server + fallback local)
  const [serverAvailable, setServerAvailable] = useState<number | null>(null);
  const [serverSource, setServerSource] = useState<"server" | "sample" | null>(
    null
  );

  const toastError = useToastError(setError);

  // ===== Bootstrap =====
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

  // ===== Cargar estructura completa =====
  useEffect(() => {
    if (!curriculumId) {
      setFull(null);
      return;
    }
    setCurrentCurriculumId(curriculumId);

    let canceled = false;
    const ctrl = new AbortController();
    setLoadingFull(true);

    // Reset picks
    setCompetencyId("");
    setStandardId("");
    setObjectiveId("");

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

  // ===== Derivados =====
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

  const selectedObjective = useMemo(
    () => objectives.find((x) => x.id === objectiveId),
    [objectives, objectiveId]
  );

  const localAvailableCount = useMemo(
    () => availableExercises(selectedObjective, quickDifficulty).length,
    [selectedObjective, quickDifficulty]
  );

  // Disponibilidad final
  const effectiveAvailable = serverAvailable ?? localAvailableCount;
  const requiredQuestions = useMemo(
    () => Math.max(QPR_MIN, Math.min(QPR_MAX, quickQPR)),
    [quickQPR]
  );

  // ===== Server availability fetch =====
  useEffect(() => {
    setServerAvailable(null);
    setServerSource(null);

    if (!objectiveId) return;
    if (!isAuthenticated) return;
    const token = getAccessToken();
    if (!token) return;

    let mounted = true;
    const ctrl = new AbortController();
    (async () => {
      try {
        const resp = await getObjectiveAvailability(
          objectiveId,
          token,
          {
            difficulty: quickDifficulty || undefined,
            minRequired: requiredQuestions,
            maxAllowed: requiredQuestions,
          },
          { signal: ctrl.signal, timeoutMs: 10_000 }
        );
        if (!mounted) return;
        const safe =
          Number.isFinite(resp.available) && resp.available >= 0
            ? resp.available
            : 0;
        setServerAvailable(safe);
        setServerSource(resp.source);
      } catch {
        /* fallback local */
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [objectiveId, quickDifficulty, requiredQuestions, isAuthenticated]);

  // Sugerir OA inicial
  useEffect(() => {
    if (!objectiveId && full) {
      const pick = pickFirstObjectiveWithExercises(full, quickDifficulty);
      if (pick?.id) setObjectiveId(pick.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full, quickDifficulty]);

  // Ajustar QPR si supera los disponibles
  useEffect(() => {
    if (effectiveAvailable > 0 && requiredQuestions > effectiveAvailable) {
      setQuickQPR(Math.max(QPR_MIN, Math.min(QPR_MAX, effectiveAvailable)));
    }
  }, [effectiveAvailable, requiredQuestions]);

  const fmtNode = (n: IdName) => (n.code ? `${n.code} — ${n.name}` : n.name);

  // ===== Crear duelo rápido usando el helper de presets =====
  const buildQuickReq = (chosenObjectiveId: string): CreateMatchReq =>
    buildCreateMatchReq({
      preset: "quick",
      curriculumId,
      objectiveId: chosenObjectiveId,
      difficulty: quickDifficulty || undefined,
      isPublic: true,
      maxPlayers: 2,
      // este valor se mapea a questionsPerRound para el preset quick
      questionsPerRound: requiredQuestions,
    });

  const submitQuick = async () => {
    setError(null);
    if (!isAuthenticated)
      return toastError("No hay sesión activa. Inicia sesión.");
    const token = getAccessToken();
    if (!token) return toastError("No se encontró el token de acceso.");
    if (!curriculumId) return toastError("Elige un currículo.");
    if (!objectiveId) return toastError("Elige un objetivo.");

    // Revalidación silenciosa justo antes de enviar (reduce 422)
    try {
      const quickCheck = await getObjectiveAvailability(
        objectiveId,
        token,
        {
          difficulty: quickDifficulty || undefined,
          minRequired: requiredQuestions,
          maxAllowed: requiredQuestions,
        },
        { timeoutMs: 6_000 }
      );
      const ok =
        Number.isFinite(quickCheck.available) &&
        quickCheck.available >= requiredQuestions;
      if (!ok) {
        return toastError(
          `Este objetivo no tiene suficientes ejercicios activos${
            quickDifficulty ? ` (${quickDifficulty.toLowerCase()})` : ""
          }. Disponibles: ${
            quickCheck.available ?? 0
          } · Requeridos: ${requiredQuestions}.`
        );
      }
    } catch {
      // si falla el check final, usamos effectiveAvailable
      if (effectiveAvailable < requiredQuestions) {
        return toastError(
          `No hay suficientes ejercicios activos para ${requiredQuestions}.`
        );
      }
    }

    try {
      setBusy(true);
      const req = buildQuickReq(objectiveId);
      const resp = await createMatch(req, token, { timeoutMs: 20_000 });
      nav(`/student/duels/room?code=${encodeURIComponent(resp.shortCode)}`);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 422) {
          return toastError(
            e.message ||
              "Validación del duelo inválida (422). Revisa los datos."
          );
        }
        if (e.status === 400) {
          return toastError(e.message || "Solicitud inválida (400).");
        }
      }
      toastError(e, "No se pudo crear el duelo rápido.");
    } finally {
      setBusy(false);
    }
  };

  // === UI (sólo modo rápido) ===
  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-1 text-2xl font-bold">Nuevo duelo</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Crea un duelo <strong>rápido</strong>: 1 ronda · preguntas aleatorias ·
        máx. 2 jugadores.
      </p>

      <div className="mb-5 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-semibold">⚡ Duelo rápido</div>
            <div className="text-xs opacity-70">
              Selecciona currículo, objetivo, dificultad (opcional) y preguntas
              por ronda.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setQuickOpen((p) => !p)}
            className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40"
            disabled={busy}
          >
            {quickOpen ? "Ocultar" : "Mostrar"}
          </button>
        </div>

        {quickOpen && (
          <div className="mt-4 space-y-4">
            {/* 1) Currículo */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-1 text-xs font-medium uppercase opacity-70">
                1) Currículo
              </div>
              <select
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                value={curriculumId}
                onChange={(e) => setCurriculumId(e.target.value)}
                disabled={busy}
              >
                <option value="">Selecciona…</option>
                {curricula.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>
              <div className="mt-1 text-[11px] opacity-70">
                {loadingFull
                  ? "Cargando estructura…"
                  : full
                  ? "Estructura lista"
                  : curriculumId
                  ? "No se pudo cargar"
                  : ""}
              </div>
            </section>

            {/* 2) Competencia */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-1 text-xs font-medium uppercase opacity-70">
                2) Competencia
              </div>
              <select
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                value={competencyId}
                onChange={(e) => {
                  setCompetencyId(e.target.value);
                  setStandardId("");
                  setObjectiveId("");
                }}
                disabled={!full || busy}
              >
                <option value="">Selecciona…</option>
                {competencies.map((n) => (
                  <option key={n.id} value={n.id}>
                    {fmtNode({ id: n.id, name: n.name, code: n.code })}
                  </option>
                ))}
              </select>
            </section>

            {/* 3) Estándar */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-1 text-xs font-medium uppercase opacity-70">
                3) Estándar
              </div>
              <select
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                value={standardId}
                onChange={(e) => {
                  setStandardId(e.target.value);
                  setObjectiveId("");
                }}
                disabled={!competencyId || busy}
              >
                <option value="">Selecciona…</option>
                {standards.map((n) => (
                  <option key={n.id} value={n.id}>
                    {fmtNode({ id: n.id, name: n.name, code: n.code })}
                  </option>
                ))}
              </select>
            </section>

            {/* 4) Objetivo */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-1 text-xs font-medium uppercase opacity-70">
                4) Objetivo
              </div>
              <select
                className="w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
                value={objectiveId}
                onChange={(e) => setObjectiveId(e.target.value)}
                disabled={!standardId || busy}
              >
                <option value="">Selecciona…</option>
                {objectives.map((n) => (
                  <option key={n.id} value={n.id}>
                    {fmtNode({ id: n.id, name: n.name, code: n.code })}
                  </option>
                ))}
              </select>

              {/* Indicador de disponibles */}
              <div className="mt-2 text-xs">
                {objectiveId ? (
                  effectiveAvailable > 0 ? (
                    <span className="text-emerald-600">
                      Ejercicios activos disponibles
                      {quickDifficulty
                        ? ` (${quickDifficulty.toLowerCase()})`
                        : ""}{" "}
                      : <strong>{effectiveAvailable}</strong>
                      {serverSource ? ` · fuente: ${serverSource}` : ""}
                    </span>
                  ) : (
                    <span className="text-amber-600">
                      No hay ejercicios activos
                      {quickDifficulty
                        ? ` (${quickDifficulty.toLowerCase()})`
                        : ""}{" "}
                      para este objetivo. Prueba otra dificultad u otro
                      objetivo.
                    </span>
                  )
                ) : (
                  <span className="opacity-70">
                    Selecciona un objetivo para ver disponibilidad.
                  </span>
                )}
              </div>
            </section>

            {/* 5) Dificultad */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-2 text-xs font-medium uppercase opacity-70">
                5) Dificultad (opcional)
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDifficulty("")}
                  disabled={busy}
                  className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                    quickDifficulty === ""
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${busy ? "opacity-60" : ""}`}
                >
                  Cualquiera
                </button>
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQuickDifficulty(opt.value)}
                    disabled={busy}
                    className={`rounded-md border px-3 py-1.5 text-sm dark:border-gray-700 ${
                      quickDifficulty === opt.value
                        ? "bg-emerald-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${busy ? "opacity-60" : ""}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 6) Preguntas por ronda */}
            <section className="rounded-xl border p-3 dark:border-gray-700">
              <div className="mb-2 text-xs font-medium uppercase opacity-70">
                6) Preguntas por ronda
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={QPR_MIN}
                  max={QPR_MAX}
                  value={quickQPR}
                  onChange={(e) => {
                    const v = Number(e.target.value) || QPR_MIN;
                    setQuickQPR(Math.max(QPR_MIN, Math.min(QPR_MAX, v)));
                  }}
                  disabled={busy}
                  className="w-24 rounded-md border px-3 py-1.5 dark:border-gray-700 dark:bg-gray-900"
                />
                <span className="text-xs opacity-70">
                  Disponibles ahora: {effectiveAvailable}
                </span>
              </div>

              <div className="mt-4">
                {objectiveId && effectiveAvailable < requiredQuestions && (
                  <div className="mb-2 text-xs text-amber-600">
                    No hay suficientes ejercicios activos para{" "}
                    {requiredQuestions}. Reduce el número, cambia la dificultad
                    o el objetivo.
                  </div>
                )}
                <button
                  type="button"
                  onClick={submitQuick}
                  disabled={
                    busy ||
                    !curriculumId ||
                    !objectiveId ||
                    effectiveAvailable < requiredQuestions
                  }
                  title={
                    objectiveId && effectiveAvailable < requiredQuestions
                      ? "No hay suficientes ejercicios activos para esta dificultad."
                      : undefined
                  }
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Creando…" : "Iniciar duelo"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuelNew;
