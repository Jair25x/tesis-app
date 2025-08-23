// src/services/authService.ts
import api from "./api";
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
} from "../types/user/ProfileTypes";
import type { JwtResponse } from "../types/user/JwtResponse";

// Peticiones simples
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nombres: string;
  apellidos: string;
  role?: string[]; // opcional; BE setea ROLE_STUDENT por defecto si no viene
}

export interface LoginRequest {
  username: string;
  password: string;
}

// ---- Público ----
export const register = async (data: RegisterRequest): Promise<string> => {
  const r = await api.post("/auth/register", data);
  return r.data;
};

export const login = async (data: LoginRequest): Promise<JwtResponse> => {
  const r = await api.post<JwtResponse>("/auth/login", data);
  return r.data;
};

export const getRoles = async (): Promise<string[]> => {
  const r = await api.get<string[]>("/auth/roles");
  return r.data;
};

export const refreshToken = async (
  refreshToken: string
): Promise<JwtResponse> => {
  const r = await api.post<JwtResponse>("/auth/refresh-token", {
    refreshToken,
  });
  return r.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};

// ---- Autenticado ----
export const me = async (): Promise<UserProfile> => {
  const r = await api.get<UserProfile>("/auth/me");
  return r.data;
};

export const updateMe = async (data: UpdateProfileDto): Promise<string> => {
  const r = await api.put<string>("/auth/me", data);
  return r.data;
};

export const changePassword = async (
  data: ChangePasswordDto
): Promise<string> => {
  const r = await api.put<string>("/auth/change-password", data);
  return r.data;
};
