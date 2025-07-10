// src/layouts/SettingsLayout.tsx
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { cn } from "../utils/cn";

export default function SettingsLayout() {
  const location = useLocation();
  if (location.pathname === "/settings") {
    return <Navigate to="/settings/profile" replace />;
  }
  const tabs = [
    { to: "/settings/profile", label: "👤 Perfil" },
    { to: "/settings/edit-profile", label: "✏️ Editar Perfil" },
    { to: "/settings/change-password", label: "🔒 Cambiar Contraseña" },
    { to: "/settings/theme", label: "🌓 Tema" },
  ];

  return (
    <div className="p-6 bg-white dark:bg-[#2d3b46] rounded-lg shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">⚙️ Configuración</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "px-4 py-2 rounded text-sm font-medium transition",
              location.pathname === tab.to
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
