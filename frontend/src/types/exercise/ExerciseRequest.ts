import type { Difficulty } from "./Difficulty";
import type { TemplateType } from "./TemplateType";

export interface ExerciseRequest {
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: TemplateType;
  parameters: Record<string, unknown>;
  learningObjectiveId: string;
  correctAnswer: string;
  isDiagnostic?: boolean; // opcional para compatibilidad retro
}
