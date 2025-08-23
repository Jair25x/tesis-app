// src/pages/user/Profile.tsx
import { useMe } from "../../hooks/useMe";

export default function Profile() {
  const { data: profile, isLoading, error } = useMe();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh]">
        <p className="text-gray-500 dark:text-gray-300">Cargando perfil…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-12 text-red-500">
        Error al cargar el perfil.
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-center mt-12 text-red-500">
        No autorizado o sesión expirada.
      </p>
    );
  }

  const rolesMap: Record<string, string> = {
    ROLE_STUDENT: "ESTUDIANTE",
    ROLE_TEACHER: "PROFESOR",
    ROLE_ADMIN: "ADMINISTRADOR",
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[70vh] bg-gray-50 dark:bg-[#1e2a34]">
      <div className="w-full max-w-xl bg-white dark:bg-[#2d3b46] p-8 mx-4 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7541/7541900.png"
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-green-500 shadow-md"
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
            <span className="font-medium">Rol(es):</span>
            <div className="flex flex-wrap gap-2">
              {profile.roles.map((r) => (
                <span
                  key={r}
                  className="bg-green-100 dark:bg-green-700 text-green-800 dark:text-white px-2 py-1 rounded-md text-xs font-semibold"
                >
                  {rolesMap[r] ?? r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
