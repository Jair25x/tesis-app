// src/types/assessments/student.ts
import type {
  UUID,
  AssignmentScope,
  AssignmentType,
  AssignmentState,
  SubmissionStatus, // Asegúrate de que esta unión incluya: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "CANCELED" (y si usas "NOT_STARTED")
} from "./common";

/**
 * DTO para GET /api/assessments/my/assignments
 * BE (Java record):
 *  - id, templateId, templateTitle
 *  - scope, type, state
 *  - windowStart, windowEnd (OffsetDateTime -> ISO string)
 *  - timeLimitSec, attemptsAllowed, attemptsUsed
 *  - canStart, started, submitted
 *  - lastSubmissionId, lastStatus, classroomId, classroomName  (pueden ser null)
 */
export interface StudentAssignmentSummaryResponse {
  /** ID de la asignación (úsalo para /assignments/{id}/start) */
  id: UUID;

  /** Compat si algún lugar del FE aún espera assignmentId */
  assignmentId?: UUID | null;

  templateId: UUID;
  templateTitle: string | null;

  scope: AssignmentScope; // "CLASSROOM" | "PUBLIC"
  type: AssignmentType; // "DIAGNOSTIC" | "FORMATIVE" | "SUMMATIVE"
  state: AssignmentState | null;

  /** Ventana; si ambos son null → “Siempre abierta” en UI */
  windowStart: string | null;
  windowEnd: string | null;

  timeLimitSec: number | null;

  attemptsAllowed: number | null;
  attemptsUsed: number | null;

  /** Flags de negocio proporcionados por el BE */
  canStart: boolean; // dentro de ventana + con intentos
  started: boolean; // existe IN_PROGRESS
  submitted: boolean; // SUBMITTED/GRADED

  /** UX extra desde el BE (pueden ser null si no aplica) */
  lastSubmissionId: UUID | null;
  lastStatus: SubmissionStatus | null;

  /** Para agrupar/filtrar por aula en “Disponibles” */
  classroomId: UUID | null;
  classroomName: string | null;
}

/* ─────────────────── Historial del alumno ─────────────────── */
/** DTO para GET /api/assessments/my/submissions */
export interface MySubmissionSummaryDto {
  submissionId: UUID;
  assignmentId: UUID;
  templateTitle: string | null;
  attemptNo: number | null;
  status: SubmissionStatus; // IN_PROGRESS | SUBMITTED | GRADED | CANCELED (y/o NOT_STARTED si lo usas)
  score: number | null;
  maxScore: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  scope: AssignmentScope; // "PUBLIC" | "CLASSROOM"
  classroomName: string | null; // puede venir null en públicas
}
