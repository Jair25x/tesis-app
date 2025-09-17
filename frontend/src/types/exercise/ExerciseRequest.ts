// src/types/exercise/ExerciseRequest.ts
import type { Difficulty } from "./Difficulty";
import type { TemplateType } from "./TemplateSchemaResponse";

export interface ExerciseRequest {
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: TemplateType;
  correctAnswer?: string; // solo admin
  parameters: Record<string, unknown>;
  learningObjectiveId: string;
  isDiagnostic?: boolean;
  examMode?: boolean; // 👈 NUEVO
}
