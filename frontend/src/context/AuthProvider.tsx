import React, { useState, useEffect } from "react";
import { AuthContext, type User } from "./AuthContext";
import { logout as logoutRequest } from "../services/authService";
import LoadingScreen from "../components/LoadingScreen"; // Loading indicator component

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  const [impersonateStudentView, setImpersonateStudentView] = useState<boolean>(
    () => {
      return JSON.parse(
        sessionStorage.getItem("impersonateStudentView") || "false"
      );
    }
  );

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    // Simular carga breve
    setTimeout(() => setLoading(false), 3000);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "impersonateStudentView",
      JSON.stringify(impersonateStudentView)
    );
  }, [impersonateStudentView]);

  const login = (
    userData: User,
    accessToken: string,
    refreshToken: string,
    remember: boolean
  ) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("accessToken", accessToken);
    storage.setItem("refreshToken", refreshToken);
    storage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await logoutRequest(refreshToken);
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("impersonateStudentView");
    setUser(null);
    setIsAuthenticated(false);
    setImpersonateStudentView(false);
  };

  if (loading) return <LoadingScreen />; // Show a spinner while validating the session

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        impersonateStudentView, // 👈 NUEVO
        setImpersonateStudentView, // 👈 NUEVO
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
