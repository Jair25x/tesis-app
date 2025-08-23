// src/services/progressTeacherService.ts
import api from "./api";
import type { UUID } from "../types/classroom/ClassroomTypes";
import type {
  OverviewDto,
  StudentOverviewDto,
  DailyStatDto,
} from "../types/classroom/TeacherProgressTypes";

export const progressTeacherApi = {
  getClassroomOverview(
    classroomId: UUID,
    curriculumId?: UUID
  ): Promise<StudentOverviewDto[]> {
    const params = new URLSearchParams();
    if (curriculumId) params.set("curriculumId", curriculumId);
    return api
      .get<StudentOverviewDto[]>(
        `/progress/classrooms/${classroomId}/overview${
          params.toString() ? `?${params}` : ""
        }`
      )
      .then((r) => r.data);
  },

  getStudentDetail(
    classroomId: UUID,
    studentId: UUID,
    curriculumId?: UUID
  ): Promise<OverviewDto> {
    const params = new URLSearchParams();
    if (curriculumId) params.set("curriculumId", curriculumId);
    return api
      .get<OverviewDto>(
        `/progress/classrooms/${classroomId}/students/${studentId}${
          params.toString() ? `?${params}` : ""
        }`
      )
      .then((r) => r.data);
  },

  // ✅ NUEVO: serie diaria del aula
  getClassroomSeries(
    classroomId: UUID,
    opts?: { curriculumId?: UUID; range?: "today" | "7d" | "14d" }
  ): Promise<DailyStatDto[]> {
    const params = new URLSearchParams();
    if (opts?.curriculumId) params.set("curriculumId", opts.curriculumId);
    if (opts?.range) params.set("range", opts.range);
    return api
      .get<DailyStatDto[]>(
        `/progress/classrooms/${classroomId}/series${
          params.toString() ? `?${params}` : ""
        }`
      )
      .then((r) => r.data);
  },

  // ✅ NUEVO: serie diaria de un alumno dentro del aula
  getStudentSeries(
    classroomId: UUID,
    studentId: UUID,
    opts?: { curriculumId?: UUID; range?: "today" | "7d" | "14d" }
  ): Promise<DailyStatDto[]> {
    const params = new URLSearchParams();
    if (opts?.curriculumId) params.set("curriculumId", opts.curriculumId);
    if (opts?.range) params.set("range", opts.range);
    return api
      .get<DailyStatDto[]>(
        `/progress/classrooms/${classroomId}/students/${studentId}/series${
          params.toString() ? `?${params}` : ""
        }`
      )
      .then((r) => r.data);
  },
};
