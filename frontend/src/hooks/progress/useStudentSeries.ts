// src/hooks/progress/useStudentSeries.ts
import { useQuery } from "@tanstack/react-query";
import { progressTeacherApi } from "../../services/progressTeacherService";
import { qk } from "./queryKeys";
import type { UUID } from "../../types/classroom/ClassroomTypes";
import type { DailyStatDto } from "../../types/classroom/TeacherProgressTypes";

export function useStudentSeries(
  classroomId?: UUID,
  studentId?: UUID,
  curriculumId?: UUID,
  range: "today" | "7d" | "14d" = "7d"
) {
  return useQuery({
    queryKey: qk.studentSeries(
      String(classroomId ?? ""),
      String(studentId ?? ""),
      curriculumId,
      range
    ),
    enabled: !!classroomId && !!studentId,
    queryFn: () =>
      progressTeacherApi.getStudentSeries(
        String(classroomId),
        String(studentId),
        {
          curriculumId,
          range,
        }
      ) as Promise<DailyStatDto[]>,
    staleTime: 60_000,
  });
}
