// src/hooks/classroom/useClassroomMembers.ts
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";
import type { MemberRole } from "../../types/classroom/ClassroomTypes";

export function useClassroomMembers(
  classroomId: string,
  opts?: { role?: MemberRole; page?: number; size?: number; sort?: string }
) {
  return useQuery({
    queryKey: [...classroomKeys.members(classroomId), opts?.role ?? "ALL"],
    enabled: !!classroomId,
    queryFn: async () => {
      const page = await classroomApi.getMembersPage(classroomId, {
        page: opts?.page ?? 0,
        size: opts?.size ?? 100,
        sort: opts?.sort ?? "joinedAt,desc",
        role: opts?.role,
      });
      return page.content;
    },
  });
}
