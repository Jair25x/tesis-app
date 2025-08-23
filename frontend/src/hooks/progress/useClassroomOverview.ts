// src/hooks/progress/useClassroomOverview.ts
import { useQuery } from "@tanstack/react-query";
import { progressTeacherApi } from "../../services/progressTeacherService";

export function useClassroomOverview(
  classroomId?: string,
  curriculumId?: string
) {
  return useQuery({
    enabled: !!classroomId,
    queryKey: [
      "progress",
      "classrooms",
      "overview",
      classroomId,
      curriculumId ?? "any",
    ],
    queryFn: () =>
      progressTeacherApi.getClassroomOverview(classroomId!, curriculumId),
    retry: 1, // evita spam si es 403/404
  });
}
