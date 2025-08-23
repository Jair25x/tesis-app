// src/hooks/classroom/queryKeys.ts
export const classroomKeys = {
  mine: ["classrooms", "mine"] as const,
  enrolled: ["classrooms", "enrolled"] as const,
  detail: (id: string) => ["classrooms", "detail", id] as const,
  members: (id: string) => ["classrooms", "members", id] as const,
  joinCode: (id: string) => ["classrooms", "join-code", id] as const,

  // ✅ NUEVO: clave estable para el listado público (paginado)
  membersPublic: (
    id: string,
    opts?: {
      expand?: boolean;
      page?: number;
      size?: number;
      search?: string;
      sort?: string;
    }
  ) =>
    [
      "classrooms",
      "members",
      "public",
      id,
      opts?.expand ? "expand" : "no-expand",
      opts?.search ?? "",
      String(opts?.page ?? 0),
      String(opts?.size ?? 20),
      opts?.sort ?? "joinedAt,desc",
    ] as const,
};
