// src/services/assessmentsService.ts
import api from "./api";
import type { AxiosError } from "axios";
import type { PageResponse } from "../types/assessments/common";

/* ============ Tipos comunes usados en filtros ============ */

/* ============ Templates ============ */
import type {
  TemplateRequest,
  TemplateSummaryDto,
  TemplateListParams,
  TemplateResponse,
} from "../types/assessments/templates";

/* ============ Assignments ============ */
import type {
  AssignmentRequest,
  AssignmentResponse,
  AssignmentSummaryResponse,
} from "../types/assessments/assignments";

/* ============ Submissions ============ */
import type {
  StartResponse,
  SubmitRequest,
  SubmitResponse,
  SubmissionDetailResponse,
  SubmissionSummaryDto,
} from "../types/assessments/submissions";

/* ============ Overview ============ */
import type { AssignmentOverviewResponse } from "../types/assessments/overview";

/* ============ Student (listado) ============ */
import type {
  MySubmissionSummaryDto,
  StudentAssignmentSummaryResponse,
} from "../types/assessments/student";

/* ────────────────────────────────────────────────────────────────
   Helpers de errores (mapeo de 400 con details.fields → mensaje)
   ──────────────────────────────────────────────────────────────── */
type BackendErrorFields = Record<string, string>;
type BackendErrorShape = {
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  timestamp?: string;
  details?: { fields?: BackendErrorFields };
};

function formatBackendErrorMessage(
  payload: BackendErrorShape | undefined
): string {
  if (!payload) return "Error inesperado.";
  const base = payload.message?.trim() || "Validación fallida";
  const flds = payload.details?.fields ?? {};
  const fieldPairs = Object.entries(flds);
  if (fieldPairs.length === 0) return base;

  const summary = fieldPairs.map(([k, v]) => `${k}: ${v}`).join("; ");
  return `${base}. ${summary}`;
}

function raiseFromAxios(e: unknown): never {
  const ax = e as AxiosError<BackendErrorShape>;
  const payload = ax?.response?.data;
  const msg = formatBackendErrorMessage(payload);
  const err = new Error(msg);
  // @ts-expect-error meta para depuración
  err.__raw = payload;
  throw err;
}

/* ========= TEMPLATES (Query + CRUD) ========= */

export async function listTemplates(params?: TemplateListParams) {
  const { data } = await api.get<PageResponse<TemplateSummaryDto>>(
    "/assessments/templates",
    { params }
  );
  return data;
}

export async function createTemplate(body: TemplateRequest) {
  const { data } = await api.post<TemplateResponse>(
    "/assessments/templates",
    body
  );
  return data;
}

export async function getTemplate(id: string) {
  const { data } = await api.get<TemplateResponse>(
    `/assessments/templates/${id}`
  );
  return data;
}

export async function updateTemplate(id: string, body: TemplateRequest) {
  const { data } = await api.put<TemplateResponse>(
    `/assessments/templates/${id}`,
    body
  );
  return data;
}

export async function deleteTemplate(id: string) {
  await api.delete(`/assessments/templates/${id}`);
}

/* ========= ASSIGNMENTS (Docente/Admin) ========= */

export async function createAssignment(body: AssignmentRequest) {
  const { data } = await api.post<AssignmentResponse>(
    "/assessments/assignments",
    body
  );
  return data;
}

/** Filtros del listado global (admin/teacher) — alineado con AssignmentSearchCriteria */
export type AssignmentListFilters = {
  state?: string;
  type?: string;
  scope?: string;
  classroomId?: string;
  templateId?: string;
  windowFrom?: string;
  windowTo?: string;

  /** NUEVO: filtros de creador (soportados por tu BE) */
  createdByMe?: boolean; // -> AssignmentSearchCriteria.createdByMe
  createdByUserId?: string | null; // -> AssignmentSearchCriteria.createdByUserId

  /** opcional: compat si aún usas este flag en otros lugares */
  mineOnly?: boolean;

  page?: number;
  size?: number;
  sort?: string; // ej: "createdAt,desc"
};

function compactParams<T extends Record<string, unknown>>(
  obj?: T
): T | undefined {
  if (!obj) return obj;
  const entries = Object.entries(obj).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return Object.fromEntries(entries) as T;
}

export async function listAssignments(params?: AssignmentListFilters) {
  const clean = compactParams(params);

  const query: Record<string, unknown> = { ...(clean ?? {}) };

  if (clean?.createdByMe === true) {
    query.createdBy = "me";
  }

  delete query.createdByMe;

  if ("mineOnly" in query) delete query.mineOnly;

  if (clean?.createdByUserId === null) delete query.createdByUserId;

  const { data } = await api.get<PageResponse<AssignmentSummaryResponse>>(
    "/assessments/assignments",
    { params: query }
  );
  return data;
}

export async function publishAssignment(id: string) {
  const { data } = await api.post<string>(
    `/assessments/assignments/${id}/publish`
  );
  return data;
}

export async function closeAssignment(id: string) {
  const { data } = await api.post<string>(
    `/assessments/assignments/${id}/close`
  );
  return data;
}

export async function cloneAssignment(
  id: string,
  overrides?: Partial<{
    scope: "CLASSROOM" | "PUBLIC";
    classroomId: string | null;
    windowStart: string | null;
    windowEnd: string | null;
    timeLimitSec: number | null;
    attemptsAllowed: number | null;
  }>
) {
  const { data } = await api.post<AssignmentResponse>(
    `/assessments/assignments/${id}/clone`,
    overrides ?? {}
  );
  return data;
}

export async function getAssignmentOverview(id: string) {
  const { data } = await api.get<AssignmentOverviewResponse>(
    `/assessments/assignments/${id}/overview`
  );
  return data;
}

/** Listado de submissions por asignación */
export async function listAssignmentSubmissions(
  assignmentId: string,
  params?: { status?: string; page?: number; size?: number; sort?: string }
) {
  const { data } = await api.get<PageResponse<SubmissionSummaryDto>>(
    `/assessments/assignments/${assignmentId}/submissions`,
    { params }
  );
  return data;
}

/* ========= SUBMISSIONS ========= */

export async function getSubmissionDetail(
  submissionId: string,
  asTeacher = false
) {
  const { data } = await api.get<SubmissionDetailResponse>(
    `/assessments/submissions/${submissionId}`,
    { params: asTeacher ? { asTeacher: true } : undefined }
  );
  return data;
}

export async function gradeSubmissionItem(args: {
  submissionId: string;
  itemId: string;
  body: {
    score: number;
    correct: boolean;
    feedback?: { value?: unknown }; // ← contrato real del BE
  };
}) {
  const { submissionId, itemId, body } = args;
  const { data } = await api.post(
    `/assessments/submissions/${submissionId}/items/${itemId}/grade`,
    body
  );
  return data as unknown; // o el tipo que devuelva tu endpoint
}

export async function listMyAssignments(
  params?: { page?: number; size?: number },
  signal?: AbortSignal
) {
  const { data } = await api.get<
    PageResponse<StudentAssignmentSummaryResponse>
  >("/assessments/my/assignments", { params, signal });
  return data;
}

export async function startAssignment(assignmentId: string) {
  if (!assignmentId) {
    return Promise.reject(new Error("assignmentId vacío"));
  }
  const { data } = await api.post<StartResponse>(
    `/assessments/assignments/${assignmentId}/start`
  );
  return data;
}

export async function submitSubmission(
  submissionId: string,
  body: SubmitRequest
) {
  try {
    const { data } = await api.post<SubmitResponse>(
      `/assessments/submissions/${submissionId}/submit`,
      body
    );
    return data;
  } catch (e) {
    raiseFromAxios(e);
  }
}

/** Historial de envíos del alumno */
export async function listMySubmissions(params?: {
  page?: number;
  size?: number;
  sort?: string; // ej: "submittedAt,desc"
  status?: "ALL" | "IN_PROGRESS" | "SUBMITTED" | "GRADED";
}) {
  const { data } = await api.get<PageResponse<MySubmissionSummaryDto>>(
    "/assessments/my/submissions",
    { params }
  );
  return data;
}

/* ========= ADMIN (Outbox) ========= */

export async function retryProgressOutbox(limit = 50) {
  const { data } = await api.post<string>(
    `/assessments/admin/outbox/progress/retry`,
    null,
    { params: { limit } }
  );
  return data;
}

export async function retryAdvisorOutbox(limit = 50) {
  const { data } = await api.post<string>(
    `/assessments/admin/outbox/advisor/retry`,
    null,
    { params: { limit } }
  );
  return data;
}
