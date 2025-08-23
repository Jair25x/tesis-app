// src/hooks/progress/useClassroomSeries.ts
import { useQuery } from "@tanstack/react-query";
import { progressTeacherApi } from "../../services/progressTeacherService";
import { qk } from "./queryKeys";
import type { UUID } from "../../types/classroom/ClassroomTypes";
import type { DailyStatDto } from "../../types/classroom/TeacherProgressTypes";

export function useClassroomSeries(
  classroomId?: UUID,
  curriculumId?: UUID,
  range: "today" | "7d" | "14d" = "7d"
) {
  return useQuery({
    queryKey: qk.classroomSeries(
      String(classroomId ?? ""),
      curriculumId,
      range
    ),
    enabled: !!classroomId,
    queryFn: () =>
      progressTeacherApi.getClassroomSeries(String(classroomId), {
        curriculumId,
        range,
      }) as Promise<DailyStatDto[]>,
    staleTime: 60_000,
  });
}
