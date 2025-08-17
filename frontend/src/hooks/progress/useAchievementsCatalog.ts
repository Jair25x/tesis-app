import { useQuery } from "@tanstack/react-query";
import { getAchievementsCatalog } from "../../services/progressService";
import { qk } from "./queryKeys";

export const useAchievementsCatalog = () =>
  useQuery({
    queryKey: [...qk.achievements, "catalog"],
    queryFn: ({ signal }) => getAchievementsCatalog(signal),
    staleTime: 5 * 60_000,
  });
