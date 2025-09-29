// src/hooks/ai/useRecommendations.ts
import { useQuery } from "@tanstack/react-query";
import { getRecommendationsMe } from "../../services/aiService";
import type { RecommendationsResponse } from "../../types/ai/Recommendations";

export type UseRecoArgs = {
  limit?: number;
  subject?: "math" | "lang"; // 👈 corregido
  objectiveId?: string;
  fresh?: boolean; // forzar refresh puntual (ignora cache del BE)
};

export const recoKey = (args?: UseRecoArgs) => [
  "reco",
  "me",
  args?.limit ?? 8,
  args?.subject ?? "any",
  args?.objectiveId ?? "any",
];

export function useRecommendations(args?: UseRecoArgs) {
  return useQuery<RecommendationsResponse>({
    queryKey: recoKey(args),
    queryFn: () =>
      getRecommendationsMe({
        limit: args?.limit,
        subject: args?.subject,
        objectiveId: args?.objectiveId,
        fresh: !!args?.fresh,
      }),
    // tuning conservador para UX + coste
    staleTime: 30_000, // 30s
    gcTime: 5 * 60_000, // 5 min
    refetchOnWindowFocus: false, // evita spam al cambiar de pestaña
  });
}
