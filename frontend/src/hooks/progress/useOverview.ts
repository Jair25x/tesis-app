// src/hooks/progress/useOverview.ts
import { useQuery } from "@tanstack/react-query";
import { getMyOverview } from "../../services/progressService";
import { qk } from "./queryKeys";

export const useOverview = () =>
  useQuery({
    queryKey: qk.overview,
    queryFn: ({ signal }) => getMyOverview(signal),
    staleTime: 60_000,
  });
