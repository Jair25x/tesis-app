// src/hooks/assessments/useStudentAssessments.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  listMyAssignments,
  startAssignment,
  submitSubmission,
} from "../../services/assessmentsService";
import { showToast } from "../../utils/showToast";
import type { SubmitRequest } from "../../types/assessments/submissions";
import type { PageResponse } from "../../types/assessments/common";
import type { StudentAssignmentSummaryResponse } from "../../types/assessments/student";

/** ✅ ÚNICA FUENTE DE VERDAD para “Disponibles” (mis asignaciones) */
export function useAvailableAssignments(params?: {
  page?: number;
  size?: number;
}) {
  const page = params?.page ?? 0;
  const size = params?.size ?? 20;

  return useQuery<PageResponse<StudentAssignmentSummaryResponse>, Error>({
    queryKey: ["assessments", "studentAvailable", page, size],
    queryFn: ({ signal }) => listMyAssignments({ page, size }, signal),
    // Evita parpadeo entre páginas y cancela lo obsoleto:
    placeholderData: keepPreviousData,
    // Evita refetch “fantasma”:
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: "always", // primer load sí
    retry: 1,
    staleTime: 30_000,
  });
}

export function useStartAssignment() {
  return useMutation({
    mutationFn: (assignmentId: string) => startAssignment(assignmentId),
  });
}

export function useSubmitSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { submissionId: string; body: SubmitRequest }) =>
      submitSubmission(args.submissionId, args.body),
    onSuccess: () => {
      showToast.success("Envío realizado");
      // invalidar la MISMA key para dedupe correcto
      qc.invalidateQueries({ queryKey: ["assessments", "studentAvailable"] });
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}
