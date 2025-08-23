// src/pages/teacher/TeacherDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClassroomsMine } from "../../hooks/classroom/useClassroomsMine";
import { useClassroomOverview } from "../../hooks/progress/useClassroomOverview";
import { useMembersDirectory } from "../../hooks/classroom/useMembersDirectory";
import { useCurriculum } from "../../hooks/useCurriculum";
import type { CurriculumResponse } from "../../types/curriculum/Curriculum";
import type {
  MemberDto,
  MemberPublicDto,
  MemberRole,
} from "../../types/classroom/ClassroomTypes";
import { exportOverviewToExcel } from "../../utils/exportToExcel";

const LS_KEY_CURR_DASH = "teacherDashboard:curriculumId";

/** Type guard: ¿tiene 'role' (privado)? */
function hasPrivateRole(m: unknown): m is MemberDto {
  return (
    !!m && typeof m === "object" && "role" in (m as Record<string, unknown>)
  );
}

/** Type guard: ¿tiene 'safeRole' (público)? */
function hasSafeRole(m: unknown): m is MemberPublicDto {
  return (
    !!m && typeof m === "object" && "safeRole" in (m as Record<string, unknown>)
  );
}

/** Util: validar UUID (mínimo 32-36 con guiones) */
function isValidUuid(v: string) {
  return /^[0-9a-fA-F-]{32,36}$/.test(v.trim());
}

export default function TeacherDashboard() {
  // ----- data sources -----
  const { data: classrooms, isLoading: loadingCls } = useClassroomsMine();
  const [selectedClassroomId, setSelectedClassroomId] = useState<
    string | undefined
  >();

  // Currículo (opcional) + persistencia en localStorage
  const { curricula } = useCurriculum();
  const [curriculumId, setCurriculumId] = useState<string | undefined>(() => {
    const saved = localStorage.getItem(LS_KEY_CURR_DASH) || "";
    return saved || undefined;
  });
  useEffect(() => {
    if (curriculumId) localStorage.setItem(LS_KEY_CURR_DASH, curriculumId);
    else localStorage.removeItem(LS_KEY_CURR_DASH);
  }, [curriculumId]);

  // Aula seleccionada (por defecto: primera)
  const currentClassroomId = selectedClassroomId ?? classrooms?.[0]?.id;

  // Overview agregado del aula (para KPIs y Top 5)
  const { data: overview, isLoading: loadingOv } = useClassroomOverview(
    currentClassroomId ?? "",
    curriculumId
  );

  // Directorio público para resolver nombres/avatares/safeRole del aula actual
  const { list: members, byId } = useMembersDirectory(currentClassroomId ?? "");

  // ----- helpers -----
  // “Nombre — código” (código = primeros 8 chars del UUID)
  const displayLabel = (studentId: string) => {
    const m = byId.get(studentId) as MemberPublicDto | MemberDto | undefined;
    const short = studentId.slice(0, 8);
    const name = m?.fullName?.trim() || short;
    return `${name} — ${short}`;
  };

  // KPIs agregados
  const kpis = useMemo(() => {
    const base = {
      students: overview?.length ?? 0,
      attempts: 0,
      correct: 0,
      avgAccuracy: 0,
      activeToday: 0,
    };
    if (!overview?.length) return base;

    let accSum = 0;
    let accCount = 0;

    for (const s of overview) {
      base.attempts += s.overview.dailyAttempts;
      base.correct += s.overview.dailyCorrect;

      if (s.overview.dailyAttempts > 0) {
        accSum += s.overview.dailyCorrect / s.overview.dailyAttempts;
        accCount += 1;

        // Considera "activo hoy" sólo a estudiantes (defensivo por si aparecen CT/OWNER)
        const m = byId.get(s.studentId) as
          | MemberPublicDto
          | MemberDto
          | undefined;
        let role: MemberRole = "STUDENT"; // defecto
        if (hasSafeRole(m) && m.safeRole) {
          role = m.safeRole as MemberRole; // 'OWNER' | 'STUDENT' ⊆ MemberRole
        } else if (hasPrivateRole(m)) {
          role = m.role; // 'STUDENT' | 'CO_TEACHER' | 'OWNER'
        }
        if (role === "STUDENT") base.activeToday += 1;
      }
    }

    base.avgAccuracy = accCount ? Math.round((accSum / accCount) * 100) : 0;
    return base;
  }, [overview, byId]);

  // ----- export -----
  function csvEscape(s: string): string {
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  const rowsForExport = useMemo(
    () =>
      (overview ?? []).map((s) => ({
        studentId: s.studentId,
        alumno: displayLabel(s.studentId),
        dailyAttempts: s.overview.dailyAttempts,
        dailyCorrect: s.overview.dailyCorrect,
        mastered: s.overview.masteredObjectives,
        inProgress: s.overview.inProgressObjectives,
        notStarted: s.overview.notStartedObjectives,
      })),
    [overview, byId]
  );

  const handleExportCsv = () => {
    const rows = [
      [
        "studentId",
        "alumno",
        "dailyAttempts",
        "dailyCorrect",
        "mastered",
        "inProgress",
        "notStarted",
      ],
      ...rowsForExport.map((r) => [
        r.studentId,
        r.alumno,
        String(r.dailyAttempts),
        String(r.dailyCorrect),
        String(r.mastered),
        String(r.inProgress),
        String(r.notStarted),
      ]),
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const suffix = curriculumId ? `-${curriculumId.slice(0, 8)}` : "";
    const classSuffix = currentClassroomId
      ? `-${currentClassroomId.slice(0, 8)}`
      : "";
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard${classSuffix}${suffix}-overview.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const suffix = curriculumId ? `-${curriculumId.slice(0, 8)}` : "";
    const classSuffix = currentClassroomId
      ? `-${currentClassroomId.slice(0, 8)}`
      : "";
    exportOverviewToExcel(
      rowsForExport as Array<Record<string, string | number>>,
      `dashboard${classSuffix}${suffix}-overview`
    );
  };

  // ----- “Ir a alumno” -----
  const [goUuid, setGoUuid] = useState("");
  // Resetear el buscador si cambia el aula
  useEffect(() => {
    setGoUuid("");
  }, [currentClassroomId]);

  const datalistId = `students-${currentClassroomId?.slice(0, 8) ?? "none"}`;

  // Parser: acepta UUID, "Nombre — 07cb135b" o nombre exacto con match único
  const handleGoChange = (raw: string) => {
    const val = raw.trim();

    // 1) Si pega UUID, listo
    if (isValidUuid(val)) {
      setGoUuid(val);
      return;
    }

    // 2) Si termina en 8 hex (… — 07cb135b), intenta mapear
    const mShort = /([0-9a-fA-F]{8})$/.exec(val);
    if (mShort) {
      const short = mShort[1].toLowerCase();
      const matches = members.filter(
        (m) => m.userUuid.slice(0, 8).toLowerCase() === short
      );
      if (matches.length === 1) {
        setGoUuid(matches[0].userUuid);
        return;
      }
    }

    // 3) Si coincide exactamente con fullName (match único), úsalo
    const exact = members.filter((m) => (m.fullName ?? "").trim() === val);
    if (exact.length === 1) {
      setGoUuid(exact[0].userUuid);
      return;
    }

    // 4) Si nada de lo anterior, conserva el texto (el datalist sigue ayudando)
    setGoUuid(val);
  };

  const goDisabled = !currentClassroomId || !isValidUuid(goUuid);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Panel del docente</h1>

        {/* Acciones globales (arriba a la derecha) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={!overview?.length}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
            title={
              !overview?.length ? "Sin datos que exportar" : "Exportar CSV"
            }
          >
            ⬇️ Exportar CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={!overview?.length}
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-60"
            title={
              !overview?.length ? "Sin datos que exportar" : "Exportar Excel"
            }
          >
            ⬇️ Exportar Excel
          </button>

          <Link
            to="/teacher/classrooms"
            className="rounded border px-3 py-1.5 text-sm dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Gestionar tus aulas"
          >
            Gestionar aulas
          </Link>
        </div>
      </div>

      {/* Filtros (Aula → Currículo → Ir a alumno) */}
      <div className="flex items-end gap-3 flex-wrap">
        {/* Aula */}
        <label className="text-sm inline-flex flex-col gap-1">
          <span className="text-xs">Aula</span>
          <select
            className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            value={currentClassroomId ?? ""}
            onChange={(e) =>
              setSelectedClassroomId(e.target.value || undefined)
            }
            disabled={loadingCls || !classrooms?.length}
          >
            {(classrooms ?? []).map((c) => (
              <option value={c.id} key={c.id}>
                {c.name} ({c.membersCount})
              </option>
            ))}
          </select>
        </label>

        {/* Currículo (opcional) */}
        {curricula?.length ? (
          <label className="text-sm inline-flex flex-col gap-1">
            <span className="text-xs">Currículo (opcional)</span>
            <select
              className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={curriculumId ?? ""}
              onChange={(e) => setCurriculumId(e.target.value || undefined)}
            >
              <option value="">Todos</option>
              {curricula.map((c: CurriculumResponse) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {/* Ir a alumno (por aula seleccionada) */}
        <label className="text-sm inline-flex flex-col gap-1">
          <span className="text-xs">Ir a alumno (aula actual)</span>
          <div className="flex gap-2">
            <input
              list={datalistId}
              className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder={
                currentClassroomId
                  ? "Escribe nombre o UUID…"
                  : "Selecciona un aula…"
              }
              value={goUuid}
              onChange={(e) => handleGoChange(e.target.value)}
              disabled={!currentClassroomId}
              title={!currentClassroomId ? "Selecciona un aula primero" : ""}
            />
            <datalist id={datalistId}>
              {members.map((m) => (
                <option key={m.userUuid} value={m.userUuid}>
                  {(m.fullName ?? m.userUuid.slice(0, 8)) +
                    (m.safeRole === "OWNER" ? " (DOCENTE)" : "")}
                </option>
              ))}
            </datalist>

            <Link
              to={
                !goDisabled && currentClassroomId
                  ? `/teacher/classrooms/${currentClassroomId}/students/${goUuid}`
                  : "#"
              }
              className={`rounded border px-2 py-1 text-sm dark:border-gray-700 ${
                !goDisabled
                  ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={(e) => {
                if (goDisabled) e.preventDefault();
              }}
              title={
                !goUuid
                  ? "Elige un alumno"
                  : goDisabled
                  ? "UUID inválido"
                  : "Abrir detalle"
              }
            >
              Abrir
            </Link>
          </div>
        </label>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <KpiCard title="Alumnos" value={kpis.students} />
        <KpiCard title="Activos hoy" value={kpis.activeToday} />
        <KpiCard title="Intentos hoy" value={kpis.attempts} />
        <KpiCard title="Precisión media" value={kpis.avgAccuracy} suffix="%" />
      </div>

      {/* Top 5 por intentos (tabla simple) */}
      <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-sm font-semibold mb-3">Top 5 — Intentos hoy</div>
        {loadingOv ? (
          <p className="text-sm">Cargando…</p>
        ) : (overview?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <Th>Alumno</Th>
                  <Th className="text-center">Intentos</Th>
                  <Th className="text-center">Correctos</Th>
                  <Th className="text-center">Detalle</Th>
                </tr>
              </thead>
              <tbody>
                {overview!
                  .slice()
                  .sort(
                    (a, b) =>
                      b.overview.dailyAttempts - a.overview.dailyAttempts
                  )
                  .slice(0, 5)
                  .map((s) => (
                    <tr
                      key={s.studentId}
                      className="border-t dark:border-gray-700"
                    >
                      <Td>{displayLabel(s.studentId)}</Td>
                      <Td center>{s.overview.dailyAttempts}</Td>
                      <Td center>{s.overview.dailyCorrect}</Td>
                      <Td center>
                        <Link
                          className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                          to={`/teacher/classrooms/${currentClassroomId}/students/${s.studentId}`}
                          title="Ver detalle del alumno"
                        >
                          Ver
                        </Link>
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin datos.</p>
        )}
      </div>
    </div>
  );
}

/* UI helpers */
function KpiCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded border p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="text-xs text-gray-500 dark:text-gray-300">{title}</div>
      <div className="text-2xl font-semibold">
        {value}
        {suffix ?? ""}
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-100 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  center,
  mono,
}: {
  children: React.ReactNode;
  center?: boolean;
  mono?: boolean;
}) {
  return (
    <td
      className={`px-3 py-2 dark:text-gray-100 ${
        center ? "text-center" : "text-left"
      } ${mono ? "font-mono" : ""}`}
    >
      {children}
    </td>
  );
}
