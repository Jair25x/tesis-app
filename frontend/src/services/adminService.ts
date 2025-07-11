import api from "./api";
import type { AdminUserSummary, AdminUserProfile, AdminUpdateUserDto } from "../types/AdminTypes";

export async function getAllUsers(): Promise<AdminUserSummary[]> {
  const response = await api.get("/api/auth/users");
  return response.data;
}

export async function getUserById(id: number): Promise<AdminUserProfile> {
  const response = await api.get(`/api/auth/profile/${id}`);
  return response.data;
}

export async function updateUser(id: number, data: AdminUpdateUserDto): Promise<AdminUserProfile> {
  const response = await api.put(`/api/auth/users/${id}`, data);
  return response.data;
}

export async function setUserEnabled(id: number, enabled: boolean): Promise<string> {
  const response = await api.patch(`/api/auth/users/${id}/enabled`, enabled);
  return response.data;
}
