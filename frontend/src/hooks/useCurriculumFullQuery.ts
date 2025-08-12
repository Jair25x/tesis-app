import { useQuery } from "@tanstack/react-query";
import { getCurriculumFull } from "../services/curriculumService";
import type { CurriculumFullResponse } from "../types/curriculum/CurriculumFullResponse";

export function useCurriculumFullQuery(curriculumId: string) {
  return useQuery<CurriculumFullResponse>({
    queryKey: ["curriculumFull", curriculumId],
    queryFn: () => getCurriculumFull(curriculumId),
    enabled: Boolean(curriculumId),
  });
}
