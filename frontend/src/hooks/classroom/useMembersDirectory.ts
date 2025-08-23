// src/hooks/classroom/useMembersDirectory.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "./queryKeys";
import type {
  MemberPublicDto,
  PageResponse,
} from "../../types/classroom/ClassroomTypes";

export function useMembersDirectory(classroomId?: string) {
  const { data, isLoading, isError } = useQuery({
    queryKey: classroomId
      ? classroomKeys.membersPublic(classroomId, { expand: true })
      : ["classrooms", "members", "noop"],
    enabled: !!classroomId,
    // ✅ siempre devolvemos array y paginamos todo
    queryFn: async () => {
      if (!classroomId) return [] as MemberPublicDto[];
      const size = 200;
      let page = 0;
      let out: MemberPublicDto[] = [];
      // paginado defensivo
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const resp: PageResponse<MemberPublicDto> =
          await classroomApi.getPublicMembers(classroomId, {
            page,
            size,
            expand: true,
          });
        out = out.concat(resp.content ?? []);
        if (resp.last || (resp.content ?? []).length < size) break;
        page += 1;
      }
      return out;
    },
    staleTime: 60_000,
  });

  const list = Array.isArray(data) ? data : [];
  const byId = useMemo(() => {
    const m = new Map<string, MemberPublicDto>();
    for (const it of list) m.set(it.userUuid, it);
    return m;
  }, [list]);

  const resolve = (uuid: string) => byId.get(uuid);

  return { list, byId, resolve, isLoading, isError };
}
