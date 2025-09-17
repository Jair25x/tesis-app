// src/hooks/assessments/queryKeys.ts
export const assessmentsKeys = {
  // Templates
  templates: (params?: unknown) =>
    ["assessments", "templates", params] as const,
  template: (id: string) => ["assessments", "templates", id] as const,

  // Assignments (admin/teacher)
  assignments: (filters?: unknown) =>
    ["assessments", "assignments", filters] as const,
  assignment: (id: string) => ["assessments", "assignments", id] as const,
  submissionsForAssignment: (assignmentId: string, filters?: unknown) =>
    ["assessments", "assignmentSubmissions", assignmentId, filters] as const,
  submissionDetail: (assignmentId: string, submissionId: string) =>
    ["assessments", "submissionDetail", assignmentId, submissionId] as const,

  // Student
  /** Lista de disponibles — usa siempre la misma key con (page,size) */
  studentAvailable: (page = 0, size = 20) =>
    ["assessments", "studentAvailable", page, size] as const,

  /** Historial de envíos del estudiante (con filtros opcionales) */
  mySubmissions: (filters?: unknown) =>
    ["assessments", "student", "submissions", filters] as const,

  /** Contador de pendientes (útil para el menú). Manténlo centralizado. */
  mySubmissionsCount: (
    status: "ALL" | "IN_PROGRESS" | "SUBMITTED" | "GRADED" = "SUBMITTED"
  ) => ["assessments", "mySubmissionsCount", status] as const,
};
