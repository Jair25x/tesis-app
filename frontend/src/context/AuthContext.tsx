import { createContext } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  roles: string[];
}

export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    userData: User,
    accessToken: string,
    refreshToken: string,
    remember: boolean
  ) => void;
  logout: () => void;

  impersonateStudentView: boolean;
  setImpersonateStudentView: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);
