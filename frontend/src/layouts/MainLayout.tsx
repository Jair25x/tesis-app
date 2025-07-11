// src/layouts/MainLayout.tsx
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { cn } from "../utils/cn";
import { Menu, X } from "lucide-react";

export default function MainLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1e2a34] text-black dark:text-white transition-colors duration-300">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-40 top-0 left-0 h-full w-64 bg-white dark:bg-[#1e2a34] shadow-md border-r border-gray-200 dark:border-white/20 p-6 transform transition-transform duration-300 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#2d3b46] dark:text-white">
                TesisApp
              </h2>
              <button
                className="md:hidden text-gray-700 dark:text-gray-300"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            {isAuthenticated && user && (
              <p className="text-sm italic text-gray-700 dark:text-gray-300">
                👋 Hola, <span className="font-semibold">{user.nombres}</span>
              </p>
            )}

            <Link
              to="/dashboard"
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition",
                location.pathname === "/dashboard"
                  ? "bg-green-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              🏠 Dashboard
            </Link>

            {user && user.roles.includes("ROLE_ADMIN") && (
              <div
                className="relative group"
                onMouseEnter={() => setAdminOpen(true)}
                onMouseLeave={() => setAdminOpen(false)}
              >
                <button
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                    location.pathname.startsWith("/admin")
                      ? "bg-green-500 text-white"
                      : ""
                  )}
                  onClick={() => setAdminOpen((prev) => !prev)}
                >
                  🛠 Administración
                  <span className="ml-2">{adminOpen ? "▴" : "▾"}</span>
                </button>

                {adminOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setSidebarOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setSidebarOpen(false)}
                    >
                      🧑‍💼 Usuarios
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Configuración con submenú */}
            <div
              className="relative group"
              onMouseEnter={() => setSettingsOpen(true)}
              onMouseLeave={() => setSettingsOpen(false)}
            >
              <button
                className={cn(
                  "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                  location.pathname.startsWith("/settings")
                    ? "bg-green-500 text-white"
                    : ""
                )}
                onClick={() => setSettingsOpen((prev) => !prev)}
              >
                ⚙️ Configuración
                <span className="ml-2">{settingsOpen ? "▴" : "▾"}</span>
              </button>

              {settingsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Link
                    to="/settings/profile"
                    className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setSidebarOpen(false)}
                  >
                    👤 Perfil
                  </Link>
                  <Link
                    to="/settings/edit-profile"
                    className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setSidebarOpen(false)}
                  >
                    ✏️ Editar Perfil
                  </Link>
                  <Link
                    to="/settings/change-password"
                    className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setSidebarOpen(false)}
                  >
                    🔒 Cambiar Contraseña
                  </Link>
                  <Link
                    to="/settings/theme"
                    className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={() => setSidebarOpen(false)}
                  >
                    🌓 Tema
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Cerrar sesión */}
          {isAuthenticated && (
            <div className="pt-6">
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                🔓 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col ml-0 md:ml-64 h-full">
        {/* Topbar para móvil */}
        <header className="md:hidden p-4 flex items-center justify-between border-b dark:border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-black dark:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">TesisApp</h1>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#1e2a34] transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
