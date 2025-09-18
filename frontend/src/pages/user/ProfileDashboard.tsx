// src/pages/user/ProfileDashboard.tsx
import { Link } from "react-router-dom";
import { useMe } from "../../hooks/useMe";
import { formatDate } from "../../utils/formatDate";
import type { UserProfile } from "../../types/user/ProfileTypes";

function extractJoinDate(obj: unknown): string | null {
  if (obj === null || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const keys = [
    "fechaRegistro",
    "createdAt",
    "created_at",
    "joinDate",
  ] as const;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

export default function ProfileDashboard() {
  const { data, isLoading, error } = useMe();
  const me: UserProfile | undefined = data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1e2a34]">
        <p className="text-gray-600 dark:text-gray-300">Cargando…</p>
      </div>
    );
  }
  if (error || !me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1e2a34]">
        <p className="text-red-500">No autorizado o error al cargar.</p>
      </div>
    );
  }

  const joinedRaw = extractJoinDate(me);
  const joined = joinedRaw ? formatDate(joinedRaw) : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1e2a34] text-black dark:text-white px-4 py-8 flex flex-col items-center">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header estilo perfil */}
        <div className="bg-white dark:bg-[#2d3b46] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
          <div className="w-28 h-28 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 shadow-inner" />
          <h1 className="text-3xl font-bold tracking-tight">
            {me.nombres} {me.apellidos}
          </h1>

          {joined && (
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              Se unió el {joined}
            </p>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Roles:{" "}
            <span className="font-semibold text-gray-700 dark:text-white">
              {me.roles.join(", ")}
            </span>
          </p>
        </div>

        {/* Navegación válida */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DashboardCard
            to="/settings/profile"
            icon="👤"
            label="Ajustes de perfil"
          />
          <DashboardCard to="/settings/theme" icon="🎨" label="Tema" />
          <DashboardCard
            to="/settings/change-password"
            icon="🔒"
            label="Cambiar contraseña"
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({
  to,
  icon,
  label,
}: {
  to: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white dark:bg-[#2d3b46] hover:bg-gray-100 dark:hover:bg-gray-700 text-center rounded-2xl p-6 shadow-md transition"
    >
      <div className="text-4xl mb-2">{icon}</div>
      <p className="font-semibold">{label}</p>
    </Link>
  );
}
