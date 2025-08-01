export interface AdminUserSummary {
  id: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  preferences?: Record<string, unknown>;
  roles: string[];
  enabled: boolean;
  fechaRegistro: string;
}

export interface AdminUserProfile extends AdminUserSummary {
  nombres: string;
  apellidos: string;
}

export interface AdminUpdateUserDto {
  nombres: string;
  apellidos: string;
  email: string;
  profilePictureUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
  fechaRegistro: string;
  profilePictureUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface AdminUpdateRequest {
  nombres: string;
  apellidos: string;
  email: string;
  profilePictureUrl?: string;
  preferences?: Record<string, unknown>;
}
