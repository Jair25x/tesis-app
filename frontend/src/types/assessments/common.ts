// src/types/assessments/common.ts
export type UUID = string;

export type GradingMode = "AUTO" | "MANUAL";
export type AssignmentType = "DIAGNOSTIC" | "FORMATIVE" | "SUMMATIVE";
export type AssignmentScope = "CLASSROOM" | "PUBLIC";
export type AssignmentState = "DRAFT" | "PUBLISHED" | "CLOSED";

// Paginación genérica
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export type SubmissionStatus = import("./submissions").SubmissionStatus;