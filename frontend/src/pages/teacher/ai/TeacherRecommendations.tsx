// src/pages/teacher/ai/TeacherRecommendations.tsx
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

/* ───────── helpers UI ───────── */
function difficultyPill(d?: "EASY" | "MEDIUM" | "HARD" | null) {
  const label =
    d === "EASY"
      ? "Fácil"
      : d === "MEDIUM"
      ? "Medio"
      : d === "HARD"
      ? "Difícil"
      : "—";
  const base = "inline-block text-xs px-2 py-0.5 rounded-full border";
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

function isUuid(v: string) {
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
    if (members.length === 1) setStudentId(members[0].userUuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomId]);

  // Cambiar currículo activo → header X-Curriculum-Id
  useEffect(() => {
    if (!curriculumId) return;
    try {
      localStorage.setItem("app:curriculumId", curriculumId);
    } catch {
      /* noop */
    }
  }, [curriculumId]);

  // Etiqueta de alumno
  const labelOf = (m: MemberPublicDto) =>
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
    const c = curricula?.find((c) => c.id === curriculumId);
    return c ? `Currículo activo: ${c.name}` : "Currículo no asignado.";
  }, [curricula, curriculumId]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Recomendaciones por estudiante
        </h1>
        <div className="text-xs text-muted-foreground">{headerTip}</div>
      </div>

      {/* Filtros */}
      <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Aula */}
          <label className="text-sm inline-flex flex-col gap-1">
            <span className="text-xs">Aula</span>
            <select
              className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={classroomId ?? ""}
              onChange={(e) => setClassroomId(e.target.value || undefined)}
              disabled={loadingCls || !classrooms?.length}
            >
              {(classrooms ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.membersCount})
                </option>
              ))}
            </select>
          </label>

          {/* Alumno */}
          <label className="text-sm inline-flex flex-col gap-1">
            <span className="text-xs">Alumno</span>
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
                className="border rounded px-2 py-1 w-[20rem] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="…o pega UUID (opcional)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                title="También puedes pegar el UUID del alumno"
              />
            </div>
          </label>

          {/* Currículo activo (impacta el header X-Curriculum-Id) */}
          {curricula?.length ? (
            <label className="text-sm inline-flex flex-col gap-1">
              <span className="text-xs">Currículo</span>
              <select
                className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
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
      <div className="min-h-[180px]">
        {!enabled && (
          <div className="text-sm text-muted-foreground">
            Selecciona un alumno o pega un UUID válido para ver recomendaciones.
          </div>
        )}

        {enabled && q.isLoading && (
          <div className="text-sm text-muted-foreground">
            Cargando recomendaciones…
          </div>
        )}

        {enabled && q.isError && (
          <div className="text-sm text-red-500">
            {(q.error as Error).message}
          </div>
        )}

        {enabled && q.isSuccess && (
          <>
            {q.data.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Sin recomendaciones para el estudiante.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {q.data.map((it) => {
                  const fallbackTitle = `Ejercicio ${it.exerciseId.slice(
                    0,
                    8
                  )}`;
                  const displayTitle = (it.title ?? "").trim() || fallbackTitle;
                  return (
                    <article
                      key={it.exerciseId}
                      className="rounded-2xl border shadow-sm bg-white/90 dark:bg-gray-900/40 dark:border-gray-800 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold leading-snug">
                          {displayTitle}
                        </h3>
                        {difficultyPill(it.difficulty)}
                      </div>

                      {it.reason && (
                        <p className="text-sm mt-2 opacity-80">{it.reason}</p>
                      )}

                      <div className="mt-3">
                        <button
                          className="w-full rounded border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => void onOpen(it)}
                          title="Abrir en el reproductor de ejercicios"
                        >
                          Abrir
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
