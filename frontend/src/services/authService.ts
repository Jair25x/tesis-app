import api from "./api";

// Interfaces used by the authentication service
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nombres: string;
  apellidos: string;
  role?: string[]; // Opcional, por defecto es ROLE_STUDENT
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  roles: string[];
  email: string;
  nombres: string;
  apellidos: string;
}

// Register a new user
export const register = async (data: RegisterRequest): Promise<string> => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Authenticate the user and return JWT data
export const login = async (data: LoginRequest): Promise<JwtResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const logout = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};

