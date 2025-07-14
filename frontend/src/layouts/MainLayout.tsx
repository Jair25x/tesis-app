import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useStudentView } from "../context/useStudentView";
import { cn } from "../utils/cn";
import { Menu, X } from "lucide-react";

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isStudentView, impersonateStudentView, setImpersonateStudentView } =
    useStudentView();
  const location = useLocation();

  useEffect(() => {
    if (isStudentView) {
      setStudentOpen(true); // Abre el submenú estudiante automáticamente
    }
  }, [isStudentView]);

  const hideSidebar = location.pathname.startsWith("/student/practice");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const roles = user?.roles || [];

  const toggleStudentView = () => {
    setImpersonateStudentView(!impersonateStudentView);
    setStudentOpen(true); // Abrir submenú al activar vista estudiante
  };
  // Verificacion de como llegan los roles No te olvides de borrarlo al terminar
  // console.log("user.roles:", user?.roles);
  // console.log("impersonateStudentView:", impersonateStudentView);
  // console.log("isStudentView:", isStudentView);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1e2a34] text-black dark:text-white transition-colors duration-300">
      {!hideSidebar && (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={cn(
              "fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-[#1e2a34] shadow-md border-r border-gray-200 dark:border-white/20 p-6 transform transition-transform duration-300",
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            )}
          >
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
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
                    👋 Hola,&nbsp;
                    <span className="font-semibold">{user.nombres}</span>
                  </p>
                )}

                <nav className="space-y-2">
                  <Link
                    to="/profile-dashboard"
                    className={cn(
                      "block px-4 py-2 rounded-md text-sm font-medium transition",
                      location.pathname === "/profile-dashboard"
                        ? "bg-green-500 text-white"
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    🏠 Mi Perfil
                  </Link>

                  {/* VER COMO ESTUDIANTE DOCENTE Y ADMIN OJO */}
                  {(roles.includes("ROLE_TEACHER") ||
                    roles.includes("ROLE_ADMIN")) && (
                    <div className="relative">
                      <button
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                          impersonateStudentView
                            ? "bg-green-500 text-white"
                            : ""
                        )}
                        onClick={toggleStudentView}
                      >
                        🎭{" "}
                        {impersonateStudentView
                          ? "Salir de vista estudiante"
                          : "Ver como estudiante"}
                        <span className="ml-2">
                          {impersonateStudentView ? "▴" : "▾"}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Submenú Estudiante */}
                  {isStudentView && (
                    <div className="relative">
                      <button
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                          location.pathname.startsWith("/student")
                            ? "bg-green-500 text-white"
                            : ""
                        )}
                        onClick={() => setStudentOpen((v) => !v)}
                      >
                        📚 Estudiante
                        <span className="ml-2">{studentOpen ? "▴" : "▾"}</span>
                      </button>
                      {studentOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          <Link
                            to="/student/dashboard"
                            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(false)}
                          >
                            🏠 Dashboard
                          </Link>
                          <Link
                            to="/student/practice"
                            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(false)}
                          >
                            📝 Práctica
                          </Link>
                          <Link
                            to="/student/roadmap"
                            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(false)}
                          >
                            🗺️ Mapa
                          </Link>
                          <Link
                            to="/student/achievements"
                            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => setSidebarOpen(false)}
                          >
                            🏆 Logros
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submenú Admin */}
                  {roles.includes("ROLE_ADMIN") && (
                    <div className="relative">
                      <button
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                          location.pathname.startsWith("/admin")
                            ? "bg-green-500 text-white"
                            : ""
                        )}
                        onClick={() => setAdminOpen((v) => !v)}
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

                  {/* Submenú Configuración */}
                  <div className="relative">
                    <button
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                        location.pathname.startsWith("/settings")
                          ? "bg-green-500 text-white"
                          : ""
                      )}
                      onClick={() => setSettingsOpen((v) => !v)}
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
                </nav>
              </div>

              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                >
                  🔓 Cerrar sesión
                </button>
              )}
            </div>
          </aside>

          {/* Topbar móvil */}
          <header className="md:hidden fixed top-0 left-0 right-0 p-4 flex items-center justify-between bg-white dark:bg-[#1e2a34] shadow z-20">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-black dark:text-white"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold">TesisApp</h1>
          </header>
        </>
      )}

      <div
        className={cn(
          "flex-1 flex flex-col h-full transition-margin duration-300",
          hideSidebar ? "ml-0" : "md:ml-64"
        )}
      >
        {impersonateStudentView &&
          (roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN")) && (
            <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
              Estás viendo la plataforma como estudiante.{" "}
              <button
                onClick={toggleStudentView}
                className="underline font-medium text-yellow-900 ml-2"
              >
                Salir
              </button>
            </div>
          )}

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#1e2a34]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
