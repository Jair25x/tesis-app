import type { Difficulty } from "./Difficulty";
import type { HintResponse } from "./HintResponse";
import type { SolutionStepResponse } from "./SolutionStepResponse";
import type { TemplateType } from "./TemplateSchemaResponse";

export interface ExerciseResponse {
  id: string;
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: TemplateType;
  parameters: Record<string, unknown>;

  learningObjectiveId: string;
  learningObjectiveName?: string;
  standardId?: string;
  standardName?: string;
  competencyId?: string;
  competencyName?: string;
  curriculumId?: string;

  // OJO: correctAnswer NO va aquí (solo en vista admin)
  solutionSteps: SolutionStepResponse[];
  hints: HintResponse[]; 

  createdAt: string;
  updatedAt: string;
  active: boolean;
  isDiagnostic: boolean;
  examMode?: boolean;
  statementRendered?: string | null;
}
