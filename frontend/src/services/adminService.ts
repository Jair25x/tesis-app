// src/services/adminService.ts
import api from "./api";
import type {
  AdminUserSummary,
  AdminUserProfile,
  AdminUpdateUserDto,
  AdminUser,
  AdminUpdateRequest,
} from "../types/user/AdminTypes";

export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const response = await api.get("/auth/users");
  return response.data;
}

export async function getUserById(id: number): Promise<AdminUserProfile> {
  const response = await api.get(`/auth/profile/${id}`);
  return response.data;
}

export async function updateUser(
  id: number,
  data: AdminUpdateUserDto
): Promise<AdminUserProfile> {
  const response = await api.put(`/auth/users/${id}`, data);
  return response.data;
}

export async function setUserEnabled(
  id: number,
  enabled: boolean
): Promise<string> {
  // Enviamos el booleano como JSON primitivo y forzamos el header application/json
  const response = await api.patch(
    `/auth/users/${id}/enabled`,
    JSON.stringify(enabled),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

// New API helpers with alternative naming
export async function fetchUsers(): Promise<AdminUser[]> {
  const response = await api.get("/auth/users");
  return response.data;
}

export async function adminUpdateUser(
  id: number,
  data: AdminUpdateRequest
): Promise<AdminUser> {
  const response = await api.put(`/auth/users/${id}`, data);
  return response.data;
}

export async function toggleUserEnabled(
  id: number,
  enabled: boolean
): Promise<string> {
  // Igual que setUserEnabled, enviamos JSON y header adecuado
  const response = await api.patch(
    `/auth/users/${id}/enabled`,
    JSON.stringify(enabled),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}> {
  const response = await api.get("/auth/users/stats");
  return response.data;
}
