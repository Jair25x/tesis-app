// src/hooks/progress/useAchievements.ts
import { useQuery } from "@tanstack/react-query";
import { getMyAchievements } from "../../services/progressService";
import { qk } from "./queryKeys";

export const useAchievements = () =>
  useQuery({
    queryKey: qk.achievements,
    queryFn: ({ signal }) => getMyAchievements(signal),
    staleTime: 60_000,
  });
