// src/services/adminService.ts
import api from "./api";
import type {
  AdminUserSummary,
  AdminUserProfile,
  AdminUpdateUserDto,
  AdminUpdateRequest,
} from "../types/user/AdminTypes";

// === Core (únicas llamadas) ===
export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const { data } = await api.get("/auth/users");
  return data;
}

export async function getUserById(id: number): Promise<AdminUserProfile> {
  const { data } = await api.get(`/auth/profile/${id}`);
  return data;
}

export async function updateUser(
  id: number,
  payload: AdminUpdateUserDto
): Promise<AdminUserProfile> {
  const { data } = await api.put(`/auth/users/${id}`, payload);
  return data;
}

export async function setUserEnabled(
  id: number,
  enabled: boolean
): Promise<string> {
  const { data } = await api.patch(
    `/auth/users/${id}/enabled`,
    JSON.stringify(enabled),
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
}

export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}> {
  const { data } = await api.get("/auth/users/stats");
  return data;
}

// === Aliases (compatibilidad, sin duplicar lógica) ===
export const fetchUsers = getAllUsers;
export const adminUpdateUser = (id: number, data: AdminUpdateRequest) =>
  updateUser(id, data as unknown as AdminUpdateUserDto);
export const toggleUserEnabled = setUserEnabled;
