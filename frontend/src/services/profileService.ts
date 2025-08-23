// src/services/profileService.ts
import { me as getMe, updateMe, changePassword as ChangePass} from "./authService";
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
} from "../types/user/ProfileTypes";

export async function getProfile(): Promise<UserProfile> {
  return getMe();
}

export async function updateProfile(data: UpdateProfileDto): Promise<string> {
  return updateMe(data);
}

export async function changePassword(data: ChangePasswordDto): Promise<string> {
  return ChangePass(data);
}
