// src/hooks/progress/useClassroomStudentDetail.ts
import { useQuery } from "@tanstack/react-query";
import { qk } from "./queryKeys";
import { progressTeacherApi } from "../../services/progressTeacherService";

export function useClassroomStudentDetail(
  classroomId?: string,
  studentId?: string,
  curriculumId?: string
) {
  return useQuery({
    queryKey:
      classroomId && studentId
        ? qk.studentDetail(classroomId, studentId, curriculumId)
        : ["progress", "noop"],
    enabled: !!classroomId && !!studentId,
    queryFn: () =>
      progressTeacherApi.getStudentDetail(
        classroomId!,
        studentId!,
        curriculumId
      ),
  });
}
