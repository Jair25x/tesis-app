// src/pages/user/Profile.tsx
import React from "react";
import { useMe } from "../../hooks/useMe";

const rolesMap: Record<string, string> = {
  ROLE_STUDENT: "ESTUDIANTE",
  ROLE_TEACHER: "PROFESOR",
  ROLE_ADMIN: "ADMINISTRADOR",
};

const Profile: React.FC = () => {
  const { data: profile, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <p className="text-gray-500 dark:text-gray-300">
          Cargando perfil…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-12 text-center text-red-500">
        Error al cargar el perfil.
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="mt-12 text-center text-red-500">
        No autorizado o sesión expirada.
      </p>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-gray-50 px-4 py-10 dark:bg-[#1e2a34]">
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-[#2d3b46] sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src="https://cdn-icons-png.flaticon.com/512/7541/7541900.png"
              alt="Avatar de usuario"
              className="h-24 w-24 rounded-full border-4 border-emerald-500 shadow-md sm:h-28 sm:w-28"
            />
            <span className="absolute -right-1 -bottom-1 rounded-full bg-emerald-500 px-2 py-[2px] text-[10px] font-semibold uppercase text-white shadow-sm">
              Activo
            </span>
          </div>
          <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            👤 Perfil de usuario
          </h1>
          <p className="max-w-sm text-center text-xs text-gray-500 dark:text-gray-300 sm:text-sm">
            Aquí puedes ver los datos básicos de tu cuenta en la plataforma.
          </p>
        </div>

        <dl className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
          <div className="flex flex-col justify-between gap-1 border-b border-gray-100 pb-2 dark:border-gray-700 sm:flex-row sm:items-center">
            <dt className="font-medium">Nombres</dt>
            <dd className="truncate">{profile.nombres}</dd>
          </div>

          <div className="flex flex-col justify-between gap-1 border-b border-gray-100 pb-2 dark:border-gray-700 sm:flex-row sm:items-center">
            <dt className="font-medium">Apellidos</dt>
            <dd className="truncate">{profile.apellidos}</dd>
          </div>

          <div className="flex flex-col justify-between gap-1 border-b border-gray-100 pb-2 dark:border-gray-700 sm:flex-row sm:items-center">
            <dt className="font-medium">Correo electrónico</dt>
            <dd className="truncate">{profile.email}</dd>
          </div>

          <div className="flex flex-col justify-between gap-1 border-b border-gray-100 pb-2 dark:border-gray-700 sm:flex-row sm:items-center">
            <dt className="font-medium">Usuario</dt>
            <dd className="truncate">{profile.username}</dd>
          </div>

          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
            <dt className="font-medium">Rol(es)</dt>
            <dd>
              <div className="mt-1 flex flex-wrap gap-2 sm:mt-0">
                {profile.roles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-800 dark:bg-emerald-700 dark:text-white"
                  >
                    {rolesMap[r] ?? r}
                  </span>
                ))}
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Profile;
