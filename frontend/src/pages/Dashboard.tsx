import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1e2a34] text-black dark:text-white px-4 py-8 flex flex-col items-center">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header estilo perfil */}
        <div className="bg-white dark:bg-[#2d3b46] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center">
          {/* Avatar (puede reemplazarse por imagen real en el futuro) */}
          <div className="w-28 h-28 bg-gray-300 dark:bg-gray-600 rounded-full mb-4 shadow-inner" />

          {/* Nombre del usuario */}
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.nombres} {user?.apellidos}
          </h1>

          {/* Fecha de unión simulada */}
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Se unió en julio de 2025
          </p>

          {/* Rol */}
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Rol:{" "}
            <span className="font-semibold text-gray-700 dark:text-white">
              {user?.roles.join(", ")}
            </span>
          </p>
        </div>

        {/* Navegación de funcionalidades */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DashboardCard to="/profile" icon="👤" label="Ver Perfil" />
          <DashboardCard to="/curriculum" icon="📚" label="Ver Currículo" />
          <DashboardCard to="/progress" icon="📈" label="Ver Progreso" />
        </div>

        {/* Estadísticas simuladas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Días de racha" value="12 🔥" />
          <StatCard label="EXP total" value="2,340 ⚡" />
          <StatCard label="Nivel actual" value="Nivel 4 🧠" />
        </div>
      </div>
    </div>
  );
}

// Componentes internos

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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-[#2d3b46] text-center rounded-2xl p-5 shadow-md">
      <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
