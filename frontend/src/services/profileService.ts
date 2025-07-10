// src/services/profileService.ts
import api from "./api";
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
} from "../types/ProfileTypes";

export async function getProfile(): Promise<UserProfile> {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function updateProfile(data: UpdateProfileDto): Promise<string> {
  const response = await api.put("/api/auth/me", data);
  return response.data;
}

export async function changePassword(data: ChangePasswordDto): Promise<string> {
  const response = await api.put("/api/auth/change-password", data);
  return response.data;
}
