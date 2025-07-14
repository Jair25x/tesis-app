export type Difficulty = "EASY" | "INTERMEDIATE" | "HARD";

export type TemplateType =
  | "TBL_MATCH"
  | "PATTERN_FORMATION"
  | "MULTIPLES_SEARCH"
  | "DIVISORS_SEARCH"
  | "GCD_FIND"
  | "MULT_DIV_CHALLENGE"
  | "BASIC_PROB_DECISION"
  | "BAR_GRAPH_READING"
  | "STATISTICAL_GRAPH"
  | "PRISM_CONSTRUCTION"
  | "CYLINDER_VOLUME"
  | "RECT_TRIANGLE_AREA"
  | "PARALLELOGRAM_AREA"
  | "PERIMETER_AREA_RELATION"
  | "BASIC_OPERATIONS"
  | "DECIMAL_COMPARISON"
  | "UNIT_VALUE"
  | "PERCENTAGE_FRACTION"
  | "SHAPE_IDENTIFICATION"
  | "PROPORTIONALITY"
  | "SCALE_UP_DOWN"
  | "RATIO_SPLIT"
  | "EQUATION_SOLVE"
  | "INEQUATION_SOLVE";

export interface HintResponse {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionStepResponse {
  id: string;
  content: string;
  order: number;
}

export interface ExerciseResponse {
  id: string;
  statement: string;
  difficulty: Difficulty;
  type: string;
  templateType: TemplateType;
  parameters: Record<string, unknown>;
  learningObjectiveId: string;
  solutionSteps: SolutionStepResponse[];
  hints: HintResponse[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}
