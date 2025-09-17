// src/utils/i18nAssessments.ts

// Re-exporta los tipos desde el "single source of truth"
export type {
  GradingMode,
  AssignmentScope,
  AssignmentType,
  AssignmentState,
  SubmissionStatus,
} from "../types/assessments/common";

// Si necesitas ShowCorrectAfter, re-exporta desde donde viva en tus tipos de templates:
export type { ShowCorrectAfter } from "../types/assessments/templates";

// Importa los tipos para tipar las funciones
import type {
  GradingMode,
  AssignmentScope,
  AssignmentType,
  AssignmentState,
  SubmissionStatus,
} from "../types/assessments/common";
import type { ShowCorrectAfter } from "../types/assessments/templates";

/* ───────────────────── Traducciones ───────────────────── */

export function tGradingMode(m?: GradingMode | null): string {
  switch (m) {
    case "AUTO":
      return "Automática";
    case "MANUAL":
      return "Manual";
    default:
      return "—";
  }
}

export function tShowCorrectAfter(v?: ShowCorrectAfter | null): string {
  switch (v) {
    case "NEVER":
      return "Nunca";
    case "AFTER_SUBMIT":
      return "Después de enviar";
    case "AFTER_CLOSE":
      return "Después de cerrar";
    default:
      return "—";
  }
}

export function tScope(v?: AssignmentScope | null): string {
  switch (v) {
    case "PUBLIC":
      return "Pública";
    case "CLASSROOM":
      return "Aula";
    default:
      return "—";
  }
}

export function tAssignmentType(v?: AssignmentType | null): string {
  switch (v) {
    case "DIAGNOSTIC":
      return "Diagnóstico";
    case "FORMATIVE":
      return "Formativa";
    case "SUMMATIVE":
      return "Sumativa";
    default:
      return v ?? "—";
  }
}

export function tAssignmentState(v?: AssignmentState | null): string {
  switch (v) {
    case "DRAFT":
      return "Borrador";
    case "PUBLISHED":
      return "Publicada";
    case "CLOSED":
      return "Cerrada";
    default:
      return "—";
  }
}

export function tSubmissionStatus(v?: SubmissionStatus | null): string {
  switch (v) {
    case "NOT_STARTED":
      return "No iniciada";
    case "IN_PROGRESS":
      return "En curso";
    case "SUBMITTED":
      return "Enviada";
    case "GRADED":
      return "Calificada";
    case "CANCELED":
      return "Cancelada";
    default:
      return "—";
  }
}
