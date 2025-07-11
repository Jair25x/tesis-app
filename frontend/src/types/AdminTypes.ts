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
