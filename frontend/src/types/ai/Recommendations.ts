export type RecommendationItem = {
  exerciseId: string;
  objectiveId: string | null;
  title: string;
  reason?: string | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  source?: "RF" | "HEURISTIC" | null;
  score?: number | null;
};
