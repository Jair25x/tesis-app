// src/hooks/progress/queryKeys.ts
export const qk = {
  overview: ["progress", "overview"] as const,
  streak: ["progress", "streak"] as const,
  achievements: ["progress", "achievements"] as const,

  // Estados por objetivo (me)
  objectiveStatuses: (curriculumId?: string) =>
    ["progress", "objective-statuses", curriculumId ?? "all"] as const,

  // Cobertura por objetivo (me)
  objectiveCoverage: (curriculumId?: string) =>
    ["progress", "objective-coverage", curriculumId ?? "all"] as const,

  classroomOverview: (classroomId: string, curriculumId?: string) =>
    [
      "progress",
      "classrooms",
      classroomId,
      "overview",
      curriculumId ?? "default",
    ] as const,

  studentDetail: (
    classroomId: string,
    studentId: string,
    curriculumId?: string
  ) =>
    [
      "progress",
      "classrooms",
      classroomId,
      "students",
      studentId,
      curriculumId ?? "default",
    ] as const,

  mySeries: (range: "today" | "7d" | "14d", curriculumId?: string) =>
    ["progress", "me", "series", range, curriculumId ?? "default"] as const,

  classroomSeries: (
    classroomId: string,
    curriculumId?: string,
    range: "today" | "7d" | "14d" = "7d"
  ) =>
    [
      "progress",
      "classrooms",
      classroomId,
      "series",
      curriculumId ?? "default",
      range,
    ] as const,

  studentSeries: (
    classroomId: string,
    studentId: string,
    curriculumId?: string,
    range: "today" | "7d" | "14d" = "7d"
  ) =>
    [
      "progress",
      "classrooms",
      classroomId,
      "students",
      studentId,
      "series",
      curriculumId ?? "default",
      range,
    ] as const,
};
