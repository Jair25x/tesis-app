// src/types/ai/Recommendations.ts
import type { Citation } from "./Chat";

/** Fuente que declara el backend */
export type RecommendationSource = "RF" | "RF+RAG" | "HEURISTIC";

/** Item individual según Swagger (sin title garantizado) */
export interface RecommendationItem {
  exerciseId: string; // uuid
  objectiveId: string | null; // uuid o null
  score: number; // [0,1]
  reason?: string | null;
  source?: RecommendationSource | null;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | null;
  citations?: Citation[]; // opcional, el BE lo expone
  /** Front opcional: si alguna vez el BE añade título, no romperá */
  title?: string | null;
  /** Alias opcional que algunos BE exponen además de score */
  confidence?: number | null;
}

/** Envoltura de respuesta del BE */
export interface RecommendationsResponse {
  generatedAt: string; // ISO date-time
  items: RecommendationItem[];
}
