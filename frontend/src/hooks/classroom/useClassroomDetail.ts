// src/hooks/classroom/useClassroomDetail.ts
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";

export function useClassroomDetail(id?: string) {
  return useQuery({
    queryKey: id ? classroomKeys.detail(id) : ["classrooms", "detail", "noop"],
    enabled: !!id,
    queryFn: () => classroomApi.getDetail(id!),
  });
}
