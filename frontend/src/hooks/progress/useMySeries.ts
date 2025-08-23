import { useQuery } from "@tanstack/react-query";
import { qk } from "./queryKeys";
import { getMySeries } from "../../services/progressService";
import type {
  SeriesRange,
  DailyStat,
} from "../../types/progress/ProgressTypes";

export function useMySeries(range: SeriesRange, curriculumId?: string) {
  return useQuery<DailyStat[]>({
    queryKey: qk.mySeries(range, curriculumId),
    queryFn: ({ signal }) => getMySeries(range, curriculumId, signal),
    staleTime: 60_000, // 1 min
  });
}
