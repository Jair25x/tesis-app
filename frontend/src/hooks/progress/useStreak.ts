// src/hooks/progress/useStreak.ts
import { useQuery } from "@tanstack/react-query";
import { getMyStreak } from "../../services/progressService";
import { qk } from "./queryKeys";

export const useStreak = () =>
  useQuery({
    queryKey: qk.streak,
    queryFn: ({ signal }) => getMyStreak(signal),
    staleTime: 60_000,
  });
