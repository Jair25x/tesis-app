// src/types/curriculum/CurriculumFullResponse.ts
export interface CurriculumFullResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  grade: string;
  competencies: CompetencyNode[];
}

export interface CompetencyNode {
  id: string;
  code: string;
  name: string;
  standards: StandardNode[];
}

export interface StandardNode {
  id: string;
  code: string;
  name: string;
  learningObjectives: LearningObjectiveNode[];
}

export interface LearningObjectiveNode {
  id: string;
  code: string;
  name: string;
  exercises: ExerciseLeaf[];
}

export interface ExerciseLeaf {
  id: string;
  statement: string;
  difficulty: string;
  // extras del back (opcionales para no romper)
  type?: string;
  templateType?:
    | "EQUATION_SINGLE_CHOICE"
    | "FREQUENCY_TABLE_QA"
    | "FREQUENCY_TABLE_COMPLETE";
  parameters?: Record<string, unknown>;
  // correctAnswer existe en admin, pero en el árbol no lo usamos
  hints?: { id: string; hintText: string; cost: number }[];
  solutionSteps?: { id: string; stepNumber: number; explanation: string }[];
}
