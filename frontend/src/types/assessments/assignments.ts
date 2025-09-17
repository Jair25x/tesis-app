import type {
  UUID,
  AssignmentType,
  AssignmentScope,
  AssignmentState,
} from "./common";

/** Crear/editar asignación */
export interface AssignmentRequest {
  templateId: UUID;
  type: AssignmentType;
  scope: AssignmentScope;
  classroomId?: UUID | null;
  timeLimitSec?: number | null;
  attemptsAllowed?: number; // default 1
  windowStart?: string | null; // ISO
  windowEnd?: string | null; // ISO
  /** Config ad-hoc de la plantilla para esta asignación (fase DIAGNÓSTICO, etc.) */
  templateConfigJson?: Record<string, unknown> | null;
}

/** Detalle de una asignación */
export interface AssignmentResponse {
  id: UUID;
  templateId: UUID;
  type: AssignmentType;
  scope: AssignmentScope;
  classroomId: UUID | null;
  state: AssignmentState;
  timeLimitSec: number | null;
  attemptsAllowed: number;
  windowStart: string | null;
  windowEnd: string | null;
}

/** Fila del listado (docente/admin) */
export interface AssignmentSummaryResponse {
  id: UUID;
  templateId: UUID;
  templateTitle: string | null;
  scope: AssignmentScope;
  type: AssignmentType;
  state: AssignmentState;
  windowStart: string | null; // OffsetDateTime -> ISO string
  windowEnd: string | null; // OffsetDateTime -> ISO string
  timeLimitSec: number | null;
  attemptsAllowed: number | null;
  classroomId: UUID | null;
  classroomName: string | null; // (puede venir null)
  createdByUserId: UUID | null;
  createdAt: string | null; // OffsetDateTime -> ISO string
  updatedAt: string | null; // OffsetDateTime -> ISO string
}

export interface AssignmentMeta {
  id: UUID;
  timeLimitSec?: number | null;
  state?: "DRAFT" | "PUBLISHED" | "CLOSED";
  // agrega otros campos si los necesitas
}
