import type { Difficulty } from "./Difficulty";
import type { TemplateType } from "./TemplateType";
import type { HintResponse } from "./HintResponse";
import type { SolutionStepResponse } from "./SolutionStepResponse";

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

  correctAnswer: string;
  solutionSteps: SolutionStepResponse[];
  hints: HintResponse[];

  createdAt: string;
  updatedAt: string;
  active: boolean;

  isDiagnostic: boolean;
}
