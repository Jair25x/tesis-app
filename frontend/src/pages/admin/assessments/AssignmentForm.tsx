// src/pages/admin/assessments/AssignmentForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createAssignment,
  getTemplate,
} from "../../../services/assessmentsService";
import type { AssignmentRequest } from "../../../types/assessments/assignments";
import { showToast } from "../../../utils/showToast";
import { useClassroomsMine } from "../../../hooks/classroom/useClassroomsMine";

/* =========================
   Tipos y helpers locales
   ========================= */

type ClassroomLike = {
  id: string;
  name?: string;
  title?: string;
  section?: string;
};

// Fase diagnóstica esperada por el BE (en mayúsculas)
type DiagnosticPhase = "INITIAL" | "MID" | "FINAL";

const PHASE_LABEL: Record<DiagnosticPhase, string> = {
  INITIAL: "Inicial",
  MID: "Intermedia",
  FINAL: "Final",
};

function isPhase(x: unknown): x is DiagnosticPhase {
  return x === "INITIAL" || x === "MID" || x === "FINAL";
}

/** isRecord: narrow seguro para acceder por índice */
function isRecord(u: unknown): u is Record<string, unknown> {
  return typeof u === "object" && u !== null;
}

/** Toma un objeto desconocido y, si es objeto, lo devuelve. Si no, null */
function pickObj(u: unknown): Record<string, unknown> | null {
  return isRecord(u) ? (u as Record<string, unknown>) : null;
}

/** Extrae defensivamente configJson.phase desde:
 *  - tpl.configJson?.phase
 *  - tpl.template?.configJson?.phase
 *  - tpl.templateConfigJson?.phase
 */
function readPhaseFromTemplate(tpl: unknown): DiagnosticPhase | null {
  const root = pickObj(tpl);
  if (!root) return null;

  const candidates: Array<Record<string, unknown>> = [];
  const cfgRoot = pickObj(root["configJson"]);
  if (cfgRoot) candidates.push(cfgRoot);

  const tplNode = pickObj(root["template"]);
  const cfgFromTemplate = tplNode ? pickObj(tplNode["configJson"]) : null;
  if (cfgFromTemplate) candidates.push(cfgFromTemplate);

  const cfgAlt = pickObj(root["templateConfigJson"]);
  if (cfgAlt) candidates.push(cfgAlt);

  for (const cfg of candidates) {
    const phaseRaw = cfg["phase"];
    if (typeof phaseRaw === "string") {
      const up = phaseRaw.toUpperCase();
      if (isPhase(up)) return up;
    }
  }
  return null;
}

// Helpers para datetime-local -> ISO
function localToISO(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/* =========================
   Componente
   ========================= */

export default function AssignmentForm() {
  const [sp] = useSearchParams();

  const templateIdQS = sp.get("templateId") ?? "";
  const curriculumIdQS = sp.get("curriculumId") ?? ""; // informativo

  const [templateId, setTemplateId] = useState<string>(templateIdQS);
  const [templateTitle, setTemplateTitle] = useState<string | null>(null);

  // Tipos y Scope se envían al BE en inglés, pero mostramos labels en español
  const [type, setType] = useState<AssignmentRequest["type"]>("FORMATIVE");
  const [scope, setScope] = useState<AssignmentRequest["scope"]>("CLASSROOM");
  const [classroomId, setClassroomId] = useState<string | undefined>(undefined);
  const [manualClassroom, setManualClassroom] = useState<boolean>(false);

  const [attemptsAllowed, setAttemptsAllowed] = useState<number>(1);
  const [timeLimitSec, setTimeLimitSec] = useState<number | undefined>(600);

  // Nueva UX de ventana
  const [alwaysOpen, setAlwaysOpen] = useState<boolean>(false);
  const [windowStartLocal, setWindowStartLocal] = useState<string>("");
  const [windowEndLocal, setWindowEndLocal] = useState<string>("");

  // Fase diagnóstico (solo cuando type === "DIAGNOSTIC")
  const [phase, setPhase] = useState<DiagnosticPhase | "">("");

  const [submitting, setSubmitting] = useState(false);

  // Aulas del docente
  const { data: myClassrooms } = useClassroomsMine();
  const classroomOptions = useMemo<ClassroomLike[]>(() => {
    const arr = (myClassrooms as unknown as ClassroomLike[]) ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [myClassrooms]);

  // Cambio de tipo: si pasamos a DIAGNOSTIC, sugerimos INITIAL si no hay fase
  const onTypeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = e.target.value as AssignmentRequest["type"];
    setType(next);
    if (next === "DIAGNOSTIC" && !phase) setPhase("INITIAL");
  };

  const onScopeChange: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
    setScope(e.target.value as AssignmentRequest["scope"]);

  // Si hay QS de templateId, busca título y precarga phase (si el template la trae)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!templateId) {
        setTemplateTitle(null);
        return;
      }
      try {
        const tpl = await getTemplate(templateId);
        if (cancelled) return;
        setTemplateTitle(
          (tpl as { title?: string | null })?.title ?? "(sin título)"
        );

        const ph = readPhaseFromTemplate(tpl);
        if (ph && !phase) setPhase(ph);
      } catch {
        if (!cancelled) setTemplateTitle(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const lookupTemplate = async () => {
    try {
      const tpl = await getTemplate(templateId);
      setTemplateTitle(
        (tpl as { title?: string | null })?.title ?? "(sin título)"
      );
      const ph = readPhaseFromTemplate(tpl);
      if (ph) setPhase(ph);
      showToast.success("Plantilla encontrada");
    } catch {
      setTemplateTitle(null);
      showToast.error("No se encontró la plantilla");
    }
  };

  const submit = async () => {
    if (!templateId) {
      showToast.error("Ingresa un Template ID");
      return;
    }
    if (scope === "CLASSROOM" && !classroomId) {
      showToast.error("Selecciona o ingresa un Aula");
      return;
    }

    // Validación simple de ventana cuando no es "siempre abierta"
    if (!alwaysOpen) {
      const hasStart = !!windowStartLocal;
      const hasEnd = !!windowEndLocal;
      if (hasStart !== hasEnd) {
        showToast.error(
          "Completa ambos campos de ventana o marca 'Siempre abierta'."
        );
        return;
      }
      if (hasStart && hasEnd) {
        const start = new Date(windowStartLocal).getTime();
        const end = new Date(windowEndLocal).getTime();
        if (!(start < end)) {
          showToast.error(
            "La 'Ventana desde' debe ser anterior a 'Ventana hasta'."
          );
          return;
        }
      }
    }

    // Si es diagnóstico, garantizamos un phase válido y lo enviamos en templateConfigJson
    let templateConfigJson: Record<string, unknown> | undefined;
    if (type === "DIAGNOSTIC") {
      const effective =
        (typeof phase === "string" ? phase.toUpperCase() : "") || "INITIAL";
      if (!isPhase(effective)) {
        showToast.error("Selecciona una fase de diagnóstico válida.");
        return;
      }
      templateConfigJson = { phase: effective };
    }

    const body: AssignmentRequest = {
      templateId,
      type,
      scope,
      classroomId: scope === "CLASSROOM" ? classroomId ?? "" : undefined,
      attemptsAllowed: Math.max(1, attemptsAllowed || 1),
      timeLimitSec:
        timeLimitSec && timeLimitSec > 0 ? Number(timeLimitSec) : undefined,
      windowStart: alwaysOpen ? null : localToISO(windowStartLocal),
      windowEnd: alwaysOpen ? null : localToISO(windowEndLocal),
      ...(templateConfigJson ? { templateConfigJson } : {}),
    };

    try {
      setSubmitting(true);
      const created = await createAssignment(body);
      showToast.success("Asignación creada");
      await navigator.clipboard.writeText((created as { id: string }).id);
      showToast.info(
        "ID copiado (assignmentId). Puedes publicarla desde Mis asignaciones."
      );
    } catch {
      showToast.error("No se pudo crear la asignación");
    } finally {
      setSubmitting(false);
    }
  };

  // UI helpers
  const requiredAsterisk = <span className="text-rose-600">*</span>;
  const phaseHelp =
    type === "DIAGNOSTIC"
      ? "Define si esta evaluación es Inicial, Intermedia o Final."
      : null;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6 sm:px-6 lg:px-8 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        {/* Card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">
              Nueva asignación
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Crea una asignación a partir de una plantilla existente.
            </p>

            {curriculumIdQS && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  Currículo:{" "}
                  <span className="ml-1 font-mono">{curriculumIdQS}</span>
                </span>
                {templateTitle && (
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                    Plantilla: <span className="ml-1">{templateTitle}</span>
                  </span>
                )}
              </div>
            )}
          </header>

          {/* Template ID */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Template ID {requiredAsterisk}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="UUID de la plantilla"
                aria-required="true"
                disabled={submitting}
              />
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                onClick={lookupTemplate}
                type="button"
                disabled={submitting || !templateId}
              >
                Ver título
              </button>
            </div>
            {templateTitle !== null && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Plantilla: {templateTitle}
              </div>
            )}
          </div>

          {/* Tipo / Alcance */}
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select
                value={type}
                onChange={onTypeChange}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                disabled={submitting}
              >
                <option value="DIAGNOSTIC">Diagnóstica</option>
                <option value="FORMATIVE">Formativa</option>
                <option value="SUMMATIVE">Sumativa</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Alcance</label>
              <select
                value={scope}
                onChange={onScopeChange}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                disabled={submitting}
              >
                <option value="CLASSROOM">Aula</option>
                <option value="PUBLIC">Pública</option>
              </select>
            </div>
          </div>

          {/* Fase (solo diagnóstico) */}
          {type === "DIAGNOSTIC" && (
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">
                Fase de diagnóstico
              </label>
              <select
                value={phase || "INITIAL"}
                onChange={(e) =>
                  setPhase(
                    (e.target.value.toUpperCase() as DiagnosticPhase) ||
                      "INITIAL"
                  )
                }
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                disabled={submitting}
              >
                <option value="INITIAL">{PHASE_LABEL.INITIAL}</option>
                <option value="MID">{PHASE_LABEL.MID}</option>
                <option value="FINAL">{PHASE_LABEL.FINAL}</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {phaseHelp}
              </p>
            </div>
          )}

          {/* Aula (solo CLASSROOM) */}
          {scope === "CLASSROOM" && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium">
                  Aula <span className="text-rose-600">*</span>
                </label>
                {classroomOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setManualClassroom((v) => !v)}
                    className="text-xs text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400"
                    disabled={submitting}
                  >
                    {manualClassroom
                      ? "Usar selector"
                      : "Ingresar ID manualmente"}
                  </button>
                )}
              </div>

              {classroomOptions.length > 0 && !manualClassroom ? (
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                  value={classroomId ?? ""}
                  onChange={(e) => setClassroomId(e.target.value || undefined)}
                  disabled={submitting}
                >
                  <option value="">Selecciona un aula…</option>
                  {classroomOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? c.title ?? c.section ?? c.id}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                  value={classroomId ?? ""}
                  onChange={(e) => setClassroomId(e.target.value)}
                  placeholder="UUID del aula"
                  aria-required="true"
                  disabled={submitting}
                />
              )}

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Si tu asignación es pública, cambia el Alcance a{" "}
                <strong>Pública</strong>.
              </p>
            </div>
          )}

          {/* Intentos / Tiempo */}
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Intentos permitidos
              </label>
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                value={attemptsAllowed}
                onChange={(e) =>
                  setAttemptsAllowed(Math.max(1, Number(e.target.value) || 1))
                }
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Límite de tiempo (seg)
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                value={timeLimitSec ?? 0}
                onChange={(e) =>
                  setTimeLimitSec(
                    Number(e.target.value) > 0
                      ? Number(e.target.value)
                      : undefined
                  )
                }
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Deja vacío o en <strong>0</strong> para sin límite.
              </p>
            </div>
          </div>

          {/* Ventana con datetime-local */}
          <div className="mb-4 rounded-xl border p-3 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={alwaysOpen}
                onChange={(e) => setAlwaysOpen(e.target.checked)}
                disabled={submitting}
              />
              Siempre abierta (sin ventana)
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ventana desde
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition disabled:opacity-50 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                  value={windowStartLocal}
                  onChange={(e) => setWindowStartLocal(e.target.value)}
                  disabled={alwaysOpen || submitting}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Ventana hasta
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition disabled:opacity-50 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
                  value={windowEndLocal}
                  onChange={(e) => setWindowEndLocal(e.target.value)}
                  disabled={alwaysOpen || submitting}
                />
              </div>
            </div>

            <p className="mt-2 text-xs opacity-70">
              Si marcas “Siempre abierta”, los estudiantes podrán iniciar en
              cualquier momento.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Creando…" : "Crear asignación"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
