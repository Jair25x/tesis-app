// src/hooks/classroom/useClassroomsEnrolled.ts
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";

export function useClassroomsEnrolled() {
  return useQuery({
    queryKey: classroomKeys.enrolled,
    queryFn: classroomApi.listEnrolled,
  });
}
