// src/types/user/JwtResponse.ts
export interface JwtResponse {
  token: string; // access token (JWT)
  refreshToken: string; // refresh token
  type: string; // normalmente 'Bearer'
  id: number;
  username: string;
  roles: string[];
  email: string;
  nombres: string;
  apellidos: string;
}
