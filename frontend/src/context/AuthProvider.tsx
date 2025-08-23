// src/context/AuthProvider.tsx
import React, { useState, useEffect } from "react";
import { AuthContext, type User } from "./AuthContext";
import {
  logout as logoutRequest,
  me as meRequest,
} from "../services/authService";
import LoadingScreen from "../components/LoadingScreen";
import { bindAuthTokenAccessors } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";

function readToken(where: Storage, key: string) {
  try {
    return where.getItem(key);
  } catch {
    return null;
  }
}
function writeToken(where: Storage, key: string, val?: string) {
  try {
    if (val == null) where.removeItem(key);
    else where.setItem(key, val);
  } catch {
    /* noop */
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const [impersonateStudentView, setImpersonateStudentView] = useState<boolean>(
    () => {
      return JSON.parse(
        sessionStorage.getItem("impersonateStudentView") || "false"
      );
    }
  );

  // ¿Dónde están los tokens ahora mismo?
  const pickStorage = () => {
    const hasLocal = !!readToken(localStorage, "accessToken");
    const hasSession = !!readToken(sessionStorage, "accessToken");
    if (hasLocal) return localStorage;
    if (hasSession) return sessionStorage;
    // Por defecto, usa sessionStorage
    return sessionStorage;
  };

  // Bindings para api.ts (refresh)
  useEffect(() => {
    bindAuthTokenAccessors({
      getAccessToken: () =>
        readToken(localStorage, "accessToken") ||
        readToken(sessionStorage, "accessToken"),
      getRefreshToken: () =>
        readToken(localStorage, "refreshToken") ||
        readToken(sessionStorage, "refreshToken"),
      setTokens: ({ accessToken, refreshToken }) => {
        const store = pickStorage();
        writeToken(store, "accessToken", accessToken);
        if (refreshToken != null)
          writeToken(store, "refreshToken", refreshToken);
      },
      onHardLogout: () => {
        // Si el refresh falla o no existe -> limpiar y forzar login
        hardLogout();
        if (!location.pathname.startsWith("/login")) {
          location.replace("/login");
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bootstrap: si hay tokens, trata de cargar /me (evita “sesiones zombis”)
  useEffect(() => {
    let canceled = false;
    const boot = async () => {
      const at =
        readToken(localStorage, "accessToken") ||
        readToken(sessionStorage, "accessToken");
      const rt =
        readToken(localStorage, "refreshToken") ||
        readToken(sessionStorage, "refreshToken");

      if (!at || !rt) {
        if (!canceled) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await meRequest();
        if (canceled) return;
        const u: User = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          roles: profile.roles,
        };
        setUser(u);
        setIsAuthenticated(true);
        // Siembra caché para useMe()
        qc.setQueryData(["me"], profile);
      } catch {
        // /me falló -> sesión inválida
        hardLogout();
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    void boot();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    writeToken(storage, "accessToken", accessToken);
    writeToken(storage, "refreshToken", refreshToken);
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    // También siembra el perfil en caché (opcional, si lo tienes a mano)
    // qc.setQueryData(["me"], { ...mapa a UserProfile si lo tuvieras });
  };

  const hardLogout = () => {
    // Siempre limpia ambos storages
    ["localStorage", "sessionStorage"].forEach((name) => {
      const s = name === "localStorage" ? localStorage : sessionStorage;
      writeToken(s, "accessToken", undefined);
      writeToken(s, "refreshToken", undefined);
      try {
        s.removeItem("user");
        s.removeItem("impersonateStudentView");
      } catch {
        /* noop */
      }
    });
    setUser(null);
    setIsAuthenticated(false);
    setImpersonateStudentView(false);
    // Limpia caché relacionada
    qc.removeQueries({ queryKey: ["me"] });
  };

  const logout = async () => {
    const rt =
      readToken(localStorage, "refreshToken") ||
      readToken(sessionStorage, "refreshToken");
    try {
      if (rt) await logoutRequest(rt);
    } catch {
      // Aunque falle el BE, limpiaremos el FE
    }
    hardLogout();
  };

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        impersonateStudentView,
        setImpersonateStudentView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
