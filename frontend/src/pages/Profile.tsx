import { useEffect, useState } from "react";
import { getProfile } from "../services/profileService";
import { useApi } from "../hooks/useApi";
import type { UserProfile } from "../types/ProfileTypes";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { isAuthenticated } = useAuth();
  const { execute: fetchProfile, error } = useApi(getProfile);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile().then(setProfile).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated)
    return <p className="text-center mt-10 text-red-500">No autorizado.</p>;

  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  // Ya no se muestra loader ni spinner
  if (!profile) return null;

  const traducirRol = (rol: string): string => {
    switch (rol) {
      case "ROLE_STUDENT":
        return "ESTUDIANTE";
      case "ROLE_TEACHER":
        return "PROFESOR";
      case "ROLE_ADMIN":
        return "ADMINISTRADOR";
      default:
        return rol;
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-10 min-h-[calc(100vh-100px)] bg-gray-50 dark:bg-[#1e2a34]">
      <div className="w-full max-w-xl bg-white dark:bg-[#2d3b46] p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7541/7541900.png"
            alt="Avatar capibara"
            className="w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            👤 Perfil de Usuario
          </h1>
        </div>

        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span className="font-medium">Nombres:</span>
            <span>{profile.nombres}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Apellidos:</span>
            <span>{profile.apellidos}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Correo electrónico:</span>
            <span>{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Usuario:</span>
            <span>{profile.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Rol:</span>
            <div className="flex flex-wrap gap-2">
              {profile.roles.map((rol) => (
                <span
                  key={rol}
                  className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-white px-2 py-1 rounded-md text-xs font-semibold"
                >
                  {traducirRol(rol)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
