// src/services/classroomService.ts
import api from "./api";
import type {
  ClassroomDetailDto,
  ClassroomSummaryDto,
  ClassroomUpsertPayload,
  JoinCodeDto,
  MemberDto,
  MemberRole,
  UUID,
  MemberPublicDto,
  PageResponse,
} from "../types/classroom/ClassroomTypes";

export const classroomApi = {
  create(payload: ClassroomUpsertPayload) {
    return api
      .post<ClassroomDetailDto>("/classrooms", payload)
      .then((r) => r.data);
  },

  listMine() {
    return api
      .get<ClassroomSummaryDto[]>("/classrooms/mine")
      .then((r) => r.data);
  },

  getDetail(id: UUID) {
    return api.get<ClassroomDetailDto>(`/classrooms/${id}`).then((r) => r.data);
  },

  update(id: UUID, payload: Partial<ClassroomUpsertPayload>) {
    return api
      .patch<ClassroomDetailDto>(`/classrooms/${id}`, payload)
      .then((r) => r.data);
  },

  remove(id: UUID) {
    return api.delete<void>(`/classrooms/${id}`).then((r) => r.data);
  },

  getMembers(id: UUID) {
    // ⬇️ usa la versión paginada por debajo y extrae content
    return this.getMembersPage(id, {
      page: 0,
      size: 200,
      sort: "joinedAt,desc",
    }).then((p) => p.content);
  },

  addMember(id: UUID, userUuid: UUID, role?: MemberRole) {
    const params = new URLSearchParams();
    params.set("userUuid", userUuid);
    if (role) params.set("role", role);
    return api
      .post<void>(`/classrooms/${id}/members?${params.toString()}`)
      .then((r) => r.data);
  },

  removeMember(id: UUID, userUuid: UUID) {
    return api
      .delete<void>(`/classrooms/${id}/members/${userUuid}`)
      .then((r) => r.data);
  },

  generateJoinCode(
    id: UUID,
    payload?: { ttlMinutes?: number; maxUses?: number | null }
  ) {
    return api
      .post<JoinCodeDto>(`/classrooms/${id}/join-code`, payload ?? {})
      .then((r) => r.data);
  },

  getActiveJoinCode(id: UUID) {
    return api
      .get<JoinCodeDto>(`/classrooms/${id}/join-code`)
      .then((r) => r.data);
  },

  revokeJoinCode(id: UUID) {
    return api.delete<void>(`/classrooms/${id}/join-code`).then((r) => r.data);
  },

  joinByCode(payload: { code: string }) {
    return api
      .post<ClassroomDetailDto>("/classrooms/join", payload)
      .then((r) => r.data);
  },

  listEnrolled() {
    return api
      .get<ClassroomSummaryDto[]>("/classrooms/enrolled")
      .then((r) => r.data);
  },

  getPublicMembers(
    id: UUID,
    opts?: {
      page?: number;
      size?: number;
      expand?: boolean;
      search?: string;
      sort?: string;
    }
  ) {
    const params = new URLSearchParams();
    if (opts?.page != null) params.set("page", String(opts.page));
    if (opts?.size != null) params.set("size", String(opts.size));
    if (opts?.expand != null) params.set("expand", String(!!opts.expand));
    if (opts?.search) params.set("search", opts.search);
    if (opts?.sort) params.set("sort", opts.sort); // ✅ nuevo

    return api
      .get<PageResponse<MemberPublicDto>>(
        `/classrooms/${id}/members/public?${params.toString()}`
      )
      .then((r) => r.data);
  },

  getMembersPage(
    id: UUID,
    opts?: { page?: number; size?: number; sort?: string; role?: MemberRole }
  ) {
    const params = new URLSearchParams();
    if (opts?.page != null) params.set("page", String(opts.page));
    if (opts?.size != null) params.set("size", String(opts.size));
    if (opts?.sort) params.set("sort", opts.sort);
    if (opts?.role) params.set("role", opts.role);

    return api
      .get<PageResponse<MemberDto>>(
        `/classrooms/${id}/members?${params.toString()}`
      )
      .then((r) => r.data);
  },

  // El alumno sale por sí mismo del aula (idempotente)
  leaveMyMembership(id: UUID) {
    return api.delete<void>(`/classrooms/${id}/members/me`).then((r) => r.data);
  },
};
