import type { UUID, AssignmentScope } from "./common";

export interface ObjectiveBreakdown {
  objectiveId: UUID;
  avg: number; // 0..1 o puntos normalizados (según tu BE)
  n: number;
}

export interface AssignmentOverviewResponse {
  assignmentId: UUID;
  scope: AssignmentScope;
  classroomId?: UUID | null;
  totalStudents?: number | null; // null si PUBLIC
  started: number;
  submitted: number;
  avgScore: number | null; // BigDecimal → number | null
  objectiveBreakdown: ObjectiveBreakdown[];
  manualPendingCount?: number; // opcional en tu record
}
