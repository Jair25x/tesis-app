export interface JwtResponse {
  token: string;
  refreshToken: string;
  type: string; // normalmente 'Bearer'
  id: number;
  username: string;
  roles: string[];
  email: string;
  nombres: string;
  apellidos: string;
}