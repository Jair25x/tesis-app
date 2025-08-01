export interface UserProfile {
  id: number;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  roles: string[];
}

export interface UpdateProfileDto {
  nombres: string;
  apellidos: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}