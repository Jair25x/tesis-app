// src/hooks/classroom/usePublicMembers.ts
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import type {
  MemberPublicDto,
  PageResponse,
} from "../../types/classroom/ClassroomTypes";

export const classroomPublicKeys = {
  members: (
    id: string,
    page: number,
    size: number,
    expand: boolean,
    search: string
  ) =>
    [
      "classrooms",
      id,
      "members",
      "public",
      { page, size, expand, search },
    ] as const,
};

export function usePublicMembers(
  classroomId: string,
  { page = 0, size = 20, expand = true, search = "" } = {}
) {
  return useQuery({
    queryKey: classroomPublicKeys.members(
      classroomId,
      page,
      size,
      expand,
      search
    ),
    queryFn: (): Promise<PageResponse<MemberPublicDto>> =>
      classroomApi.getPublicMembers(classroomId, {
        page,
        size,
        expand,
        search,
      }),
    enabled: !!classroomId,
  });
}
