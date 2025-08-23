// src/hooks/classroom/useClassroomsMine.ts
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";

export function useClassroomsMine() {
  return useQuery({
    queryKey: classroomKeys.mine,
    queryFn: classroomApi.listMine,
  });
}
