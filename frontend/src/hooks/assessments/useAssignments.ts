// src/hooks/assessments/useAssignments.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAssignments,
  createAssignment,
  publishAssignment,
  closeAssignment,
  listAssignmentSubmissions,
  getSubmissionDetail,
  gradeSubmissionItem,
  getAssignmentOverview,
  cloneAssignment,
} from "../../services/assessmentsService";
import type { AssignmentListFilters } from "../../services/assessmentsService";
import { assessmentsKeys } from "./queryKeys";
import { showToast } from "../../utils/showToast";
import type { AssignmentRequest } from "../../types/assessments/assignments";
import type { AssignmentOverviewResponse } from "../../types/assessments/overview";

/* ────────────────────────────────────────────────────────────
 * Tipos auxiliares
 * ──────────────────────────────────────────────────────────── */
export type SubmissionsListFilters = {
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
};

/** Tipo de uso en la UI docente (acepta string u objeto) */
export type GradeItemBody = {
  score: number;
  correct: boolean;
  feedback?: string | { message?: string } | { [k: string]: unknown };
};

/** Tipo “wire” que espera el BE: feedback envuelto en { value } */
type GradeItemBodyWire = {
  score: number;
  correct: boolean;
  feedback?: { value?: unknown };
};

function toWireGradeBody(body: GradeItemBody): GradeItemBodyWire {
  const { score, correct } = body;

  let value: unknown | undefined;

  if (typeof body.feedback === "string") {
    const msg = body.feedback.trim();
    value = msg ? msg : undefined;
  } else if (
    body.feedback &&
    typeof body.feedback === "object" &&
    !Array.isArray(body.feedback)
  ) {
    // Si viene { message }, úsala; si ya viene cualquier objeto, lo enviamos tal cual.
    const maybeMessage = (body.feedback as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      value = maybeMessage.trim();
    } else {
      value = body.feedback; // objeto arbitrario
    }
  }

  return value !== undefined
    ? { score, correct, feedback: { value } }
    : { score, correct };
}

export function useAssignmentsList(filters?: AssignmentListFilters) {
  return useQuery({
    queryKey: assessmentsKeys.assignments(filters),
    queryFn: () => listAssignments(filters),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useAssignmentMutations() {
  const qc = useQueryClient();

  const createM = useMutation({
    mutationFn: (body: AssignmentRequest) => createAssignment(body),
    onSuccess: () => {
      showToast.success("Asignación creada");
      qc.invalidateQueries({
        queryKey: assessmentsKeys.assignments(undefined),
      });
    },
    onError: () => showToast.error("No se pudo crear la asignación"),
  });

  const publishM = useMutation({
    mutationFn: (id: string) => publishAssignment(id),
    onSuccess: (_res, id) => {
      showToast.success("Asignación publicada");
      qc.invalidateQueries({ queryKey: assessmentsKeys.assignment(id) });
      qc.invalidateQueries({
        queryKey: assessmentsKeys.assignments(undefined),
      });
    },
    onError: () => showToast.error("No se pudo publicar"),
  });

  const closeM = useMutation({
    mutationFn: (id: string) => closeAssignment(id),
    onSuccess: (_res, id) => {
      showToast.success("Asignación cerrada");
      qc.invalidateQueries({ queryKey: assessmentsKeys.assignment(id) });
      qc.invalidateQueries({
        queryKey: assessmentsKeys.assignments(undefined),
      });
    },
    onError: () => showToast.error("No se pudo cerrar"),
  });

  const cloneM = useMutation({
    mutationFn: (id: string) => cloneAssignment(id, {}),
    onSuccess: () => {
      showToast.success("Asignación clonada");
      qc.invalidateQueries({
        queryKey: assessmentsKeys.assignments(undefined),
      });
    },
    onError: () => showToast.error("No se pudo clonar"),
  });

  return { createM, publishM, closeM, cloneM };
}

export function useAssignmentSubmissions(
  assignmentId: string,
  filters?: SubmissionsListFilters
) {
  return useQuery({
    queryKey: assessmentsKeys.submissionsForAssignment(assignmentId, filters),
    queryFn: () => listAssignmentSubmissions(assignmentId, filters),
    enabled: !!assignmentId,
    staleTime: 15_000,
  });
}

export function useSubmissionDetailTeacher(submissionId?: string) {
  return useQuery({
    queryKey: submissionId
      ? ["assessments", "submissionDetailTeacher", submissionId]
      : ["__noop__"],
    queryFn: () =>
      submissionId
        ? getSubmissionDetail(submissionId, true)
        : Promise.resolve(null),
    enabled: !!submissionId,
    staleTime: 15_000,
  });
}

export function useGradeItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      submissionId: string;
      itemId: string;
      body: GradeItemBody; // UI type
    }) =>
      gradeSubmissionItem({
        submissionId: args.submissionId,
        itemId: args.itemId,
        body: toWireGradeBody(args.body), // adaptamos a { feedback: { value } }
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["assessments", "submissionDetailTeacher", vars.submissionId],
      });
      showToast.success("Ítem calificado");
    },
    onError: () =>
      showToast.error(
        "No se pudo calificar. Verifica puntaje/correct/feedback."
      ),
  });
}

export function useAssignmentOverview(assignmentId?: string) {
  return useQuery({
    queryKey: assignmentId
      ? ["assessments", "assignmentOverview", assignmentId]
      : ["__noop__"],
    queryFn: () =>
      assignmentId
        ? (getAssignmentOverview(
            assignmentId
          ) as Promise<AssignmentOverviewResponse>)
        : Promise.resolve(null),
    enabled: !!assignmentId,
    staleTime: 15_000,
  });
}
