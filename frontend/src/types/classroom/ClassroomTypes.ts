// src/types/classroom/ClassroomTypes.ts
export type UUID = string;

export interface ClassroomSummaryDto {
  id: UUID;
  name: string;
  description?: string;
  grade?: string;
  subject?: string;
  membersCount: number;
  active: boolean;
}

export interface ClassroomDetailDto {
  id: UUID;
  ownerUuid: UUID;
  name: string;
  description?: string;
  grade?: string;
  subject?: string;
  active: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type MemberRole = "STUDENT" | "CO_TEACHER" | "OWNER"; // si OWNER existe en BE

export type MemberDto = {
  userUuid: UUID;
  role: MemberRole;
  joinedAt: string; // ISO
  fullName?: string; // ⬅️ opcional si BE lo expone en privado
  avatarUrl?: string; // opcional
};

export interface JoinCodeDto {
  code: string;
  expiresAt: string; // ISO
  maxUses?: number | null;
  usedCount: number;
  remainingUses?: number | null;
}

// Para crear/editar aula
export interface ClassroomUpsertPayload {
  name: string;
  description?: string;
  grade?: string;
  subject?: string;
  active?: boolean;
}

// público (safe roles)
export type MemberPublicDto = {
  userUuid: UUID;
  joinedAt: string;
  fullName?: string;
  avatarUrl?: string;
  safeRole?: "OWNER" | "STUDENT"; // CT se mapea a STUDENT si así lo decides
};

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
