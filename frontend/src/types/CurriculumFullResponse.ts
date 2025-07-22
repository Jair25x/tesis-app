// src/types/CurriculumFullResponse.ts
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
}
