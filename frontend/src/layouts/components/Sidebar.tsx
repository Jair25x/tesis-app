// src/layouts/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useStudentView } from "../../context/useStudentView";
import { cn } from "../../utils/cn";
import StudentMenu from "./StudentMenu";
import AdminMenu from "./AdminMenu";
import SettingsMenu from "./SettingsMenu";
import TeacherMenu from "./TeacherMenu";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, logout } = useAuth();
  const { impersonateStudentView, toggleStudentView, isStudentView } =
    useStudentView();

  const roles = user?.roles ?? [];
  const isTeacher =
    roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN");

  const [teacherOpen, setTeacherOpen] = useState<boolean>(true);
  const [studentOpen, setStudentOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const closeSidebar = (): void => setSidebarOpen(false);

  useEffect(() => {
    if (isStudentView) setStudentOpen(true);
  }, [isStudentView]);

  // Cerrar con tecla Esc cuando el sidebar esté abierto (especialmente en móvil)
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const handleLogout = async (): Promise<void> => {
    await logout();
    navigate("/login", { replace: true });
    closeSidebar();
  };

  return (
    <>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform border-r border-gray-200 bg-white p-6 shadow-md transition-transform duration-300 dark:border-white/20 dark:bg-[#1e2a34]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        role="navigation"
        aria-label="Menú principal"
      >
        <div className="flex h-full flex-col">
          {/* Header fijo */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#2d3b46] dark:text-white">
              TesisApp
            </h2>
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 md:hidden dark:text-gray-300 dark:hover:text-white"
              onClick={closeSidebar}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          {isAuthenticated && user && (
            <p className="mb-4 text-sm italic text-gray-700 dark:text-gray-300">
              👋 Hola,{" "}
              <span className="font-semibold">{user.nombres ?? "usuario"}</span>
            </p>
          )}

          {/* Zona scrollable simple (sin fade) */}
          <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
            <nav className="space-y-2">
              <Link
                to="/profile-dashboard"
                className={cn(
                  "block rounded-md px-4 py-2 text-sm font-medium transition",
                  location.pathname === "/profile-dashboard"
                    ? "bg-green-500 text-white"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                onClick={closeSidebar}
              >
                🏠 Mi perfil
              </Link>

              {/* Toggle “ver como estudiante” */}
              {isTeacher && (
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-4 py-2 text-left text-sm font-medium transition hover:bg-gray-200 dark:hover:bg-gray-700",
                    impersonateStudentView ? "bg-green-500 text-white" : ""
                  )}
                  onClick={() => {
                    toggleStudentView();
                    setStudentOpen(true);
                  }}
                  aria-pressed={impersonateStudentView}
                >
                  <span>
                    🎭{" "}
                    {impersonateStudentView
                      ? "Salir de vista estudiante"
                      : "Ver como estudiante"}
                  </span>
                  <span className="ml-2">
                    {impersonateStudentView ? "▴" : "▾"}
                  </span>
                </button>
              )}

              {/* Menú Docente para TEACHER/ADMIN */}
              {isTeacher && (
                <TeacherMenu
                  teacherOpen={teacherOpen}
                  setTeacherOpen={setTeacherOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}

              {/* Menú Estudiante cuando está en “vista estudiante” */}
              {isStudentView && (
                <StudentMenu
                  studentOpen={studentOpen}
                  setStudentOpen={setStudentOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}

              {/* Menú Admin */}
              {roles.includes("ROLE_ADMIN") && (
                <AdminMenu
                  adminOpen={adminOpen}
                  setAdminOpen={setAdminOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}

              {/* Menú Settings (siempre) */}
              <SettingsMenu
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>
          </div>

          {/* Footer fijo (logout) */}
          {isAuthenticated && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700"
              >
                🔓 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
