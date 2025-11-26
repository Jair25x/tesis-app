// src/pages/teacher/ai/TeacherRecommendations.tsx
// Requiere: @tanstack/react-query, Tailwind, rutas y servicios ya configurados

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRecommendationsForStudent } from "../../../services/aiService";
import type { RecommendationItem } from "../../../types/ai/Recommendations";
import { showToast } from "../../../utils/showToast";
import { useClassroomsMine } from "../../../hooks/classroom/useClassroomsMine";
import { useMembersDirectory } from "../../../hooks/classroom/useMembersDirectory";
import type { MemberPublicDto } from "../../../types/classroom/ClassroomTypes";
import { useExerciseDeepLink } from "../../../hooks/exercises/useExerciseDeepLink";
import { useCurriculum } from "../../../hooks/useCurriculum";
import type { CurriculumResponse } from "../../../types/curriculum/Curriculum";
import {
  getActiveCurricula,
  getCurrentCurriculumId,
} from "../../../services/curriculumService";
import {
  newSourceRefId,
  setRecoAttribution,
} from "../../../utils/recoAttribution";

/* ───────── tipos auxiliares ───────── */

type Difficulty = "EASY" | "MEDIUM" | "HARD";

/* ───────── helpers UI ───────── */

function difficultyPill(d?: Difficulty | null) {
  const label =
    d === "EASY"
      ? "Fácil"
      : d === "MEDIUM"
      ? "Medio"
      : d === "HARD"
      ? "Difícil"
      : "—";

  const base = "inline-block text-[11px] px-2 py-0.5 rounded-full border";
  const color =
    d === "EASY"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800"
      : d === "MEDIUM"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800"
      : d === "HARD"
      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-800"
      : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

  return <span className={`${base} ${color}`}>Dificultad: {label}</span>;
}

function isUuid(v: string): boolean {
  return /^[0-9a-fA-F-]{32,36}$/.test(v.trim());
}

/* ───────── componente ───────── */

export default function TeacherRecommendations() {
  // Aulas + selección
  const { data: classrooms, isLoading: loadingCls } = useClassroomsMine();
  const [classroomId, setClassroomId] = useState<string | undefined>();

  // Miembros del aula actual
  const { list: members } = useMembersDirectory(classroomId ?? "");

  // Alumno seleccionado (UUID o texto pegado)
  const [studentId, setStudentId] = useState<string>("");

  // Currículos + selector que escribe en localStorage("app:curriculumId") para X-Curriculum-Id
  const { curricula } = useCurriculum();
  const [curriculumId, setCurriculumId] = useState<string | undefined>(
    () => getCurrentCurriculumId() ?? undefined
  );

  const { goToExercise } = useExerciseDeepLink();

  // Aula por defecto cuando llegan
  useEffect(() => {
    if (!classroomId && classrooms && classrooms.length > 0) {
      setClassroomId(classrooms[0].id);
    }
  }, [classrooms, classroomId]);

  // Reset alumno al cambiar de aula (y autoselección si hay 1)
  useEffect(() => {
    setStudentId("");
    if (members.length === 1) {
      setStudentId(members[0].userUuid);
    }
  }, [classroomId, members]);

  // Cambiar currículo activo → header X-Curriculum-Id
  useEffect(() => {
    if (!curriculumId) return;
    try {
      localStorage.setItem("app:curriculumId", curriculumId);
    } catch {
      // noop
    }
  }, [curriculumId]);

  // Etiqueta de alumno
  const labelOf = (m: MemberPublicDto): string =>
    (m.fullName?.trim() || m.userUuid.slice(0, 8)) +
    (m.safeRole === "OWNER" ? " (DOCENTE)" : "");

  // Query de recomendaciones (dependiente de alumno y currículo)
  const enabled = isUuid(studentId);
  const q = useQuery({
    queryKey: ["ai", "reco", "by-student", { studentId, curriculumId }],
    queryFn: () => getRecommendationsForStudent(studentId, { limit: 12 }),
    enabled,
    staleTime: 60_000,
  });

  // Garantiza currículo (por si venías sin “app:curriculumId”)
  async function ensureCurriculumSelected(): Promise<boolean> {
    try {
      const current = getCurrentCurriculumId();
      if (current) return true;

      const list = await getActiveCurricula();
      if (Array.isArray(list) && list.length > 0) {
        localStorage.setItem("app:curriculumId", list[0].id);
        setCurriculumId(list[0].id); // sincroniza UI
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Abrir ejercicio recomendado (reusa deep link + atribución)
  const onOpen = async (it: RecommendationItem) => {
    if (!it.objectiveId) {
      showToast.warning("La recomendación no incluye objectiveId.");
      return;
    }

    const ok = await ensureCurriculumSelected();
    if (!ok) {
      showToast.warning("Selecciona un currículo antes de abrir ejercicios.");
      return;
    }

    setRecoAttribution(it.exerciseId, {
      source: "AI_RECO",
      objectiveId: it.objectiveId,
      at: new Date().toISOString(),
      sourceRefId: newSourceRefId(),
    });

    goToExercise(it.exerciseId, it.objectiveId);
  };

  const headerTip = useMemo(() => {
    const c = curricula?.find((item) => item.id === curriculumId);
    return c ? `Currículo activo: ${c.name}` : "Currículo no asignado.";
  }, [curricula, curriculumId]);

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Recomendaciones por estudiante
        </h1>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {headerTip}
        </div>
      </div>

      {/* Filtros */}
      <div className="mt-3 rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          {/* Aula */}
          <label className="flex w-full flex-col gap-1 text-sm md:w-auto">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              Aula
            </span>
            <select
              className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-64 lg:w-72"
              value={classroomId ?? ""}
              onChange={(e) => setClassroomId(e.target.value || undefined)}
              disabled={loadingCls || !classrooms?.length}
            >
              {(!classrooms || classrooms.length === 0) && (
                <option value="">Sin aulas disponibles</option>
              )}
              {(classrooms ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.membersCount})
                </option>
              ))}
            </select>
          </label>

          {/* Alumno */}
          <label className="flex w-full flex-col gap-1 text-sm">
            <span className="text-xs text-gray-700 dark:text-gray-200">
              Alumno
            </span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-64 lg:w-72"
                value={isUuid(studentId) ? studentId : ""}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={!classroomId || members.length === 0}
                title={!classroomId ? "Selecciona un aula primero" : ""}
              >
                <option value="" disabled>
                  {members.length ? "Selecciona…" : "Sin alumnos"}
                </option>
                {members.map((m) => (
                  <option key={m.userUuid} value={m.userUuid}>
                    {labelOf(m)}
                  </option>
                ))}
              </select>

              {/* También permitir pegar UUID */}
              <input
                className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:flex-1"
                placeholder="…o pega UUID del alumno (opcional)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                title="También puedes pegar el UUID del alumno"
              />
            </div>
          </label>

          {/* Currículo activo (impacta el header X-Curriculum-Id) */}
          {curricula?.length ? (
            <label className="flex w-full flex-col gap-1 text-sm md:w-auto">
              <span className="text-xs text-gray-700 dark:text-gray-200">
                Currículo
              </span>
              <select
                className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:w-64 lg:w-72"
                value={curriculumId ?? ""}
                onChange={(e) => setCurriculumId(e.target.value || undefined)}
                title="Cambia el currículo activo para las recomendaciones"
              >
                {curricula.map((c: CurriculumResponse) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-4 min-h-[180px]">
        {!enabled && (
          <div className="rounded-2xl border border-dashed bg-white/60 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
            Selecciona un alumno o pega un UUID válido para ver recomendaciones
            personalizadas.
          </div>
        )}

        {enabled && q.isLoading && (
          <div className="rounded-2xl border bg-white/70 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
            Cargando recomendaciones…
          </div>
        )}

        {enabled && q.isError && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
            {(q.error as Error).message}
          </div>
        )}

        {enabled && q.isSuccess && (
          <>
            {q.data.length === 0 ? (
              <div className="rounded-2xl border bg-white/70 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
                Sin recomendaciones para el estudiante en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {q.data.map((it) => {
                  const fallbackTitle = `Ejercicio ${it.exerciseId.slice(
                    0,
                    8
                  )}`;
                  const displayTitle = (it.title ?? "").trim() || fallbackTitle;

                  return (
                    <article
                      key={it.exerciseId}
                      className="flex flex-col rounded-2xl border bg-white/90 p-4 text-sm shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                          {displayTitle}
                        </h3>
                        {difficultyPill(it.difficulty ?? null)}
                      </div>

                      {it.reason && (
                        <p className="mt-1 text-xs text-gray-700 dark:text-gray-200">
                          {it.reason}
                        </p>
                      )}

                      <div className="mt-3 flex-1" />

                      <div className="mt-3">
                        <button
                          type="button"
                          className="w-full rounded-lg border px-3 py-2 text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                          onClick={() => void onOpen(it)}
                          title="Abrir en el reproductor de ejercicios"
                        >
                          Abrir ejercicio recomendado
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
