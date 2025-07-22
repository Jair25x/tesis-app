// src/layouts/components/Sidebar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useStudentView } from "../../context/useStudentView";
import { cn } from "../../utils/cn";
import { X } from "lucide-react";
import StudentMenu from "./StudentMenu";
import AdminMenu from "./AdminMenu";
import SettingsMenu from "./SettingsMenu";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { impersonateStudentView, toggleStudentView, isStudentView } =
    useStudentView();
  const location = useLocation();
  const roles = user?.roles || [];

  const [studentOpen, setStudentOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (isStudentView) {
      setStudentOpen(true);
    }
  }, [isStudentView]);

  return (
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
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                👋 Hola, <span className="font-semibold">{user.nombres}</span>
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

              {(roles.includes("ROLE_TEACHER") ||
                roles.includes("ROLE_ADMIN")) && (
                <button
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
                    impersonateStudentView ? "bg-green-500 text-white" : ""
                  )}
                  onClick={() => {
                    toggleStudentView();
                    setStudentOpen(true);
                  }}
                >
                  🎭{" "}
                  {impersonateStudentView
                    ? "Salir de vista estudiante"
                    : "Ver como estudiante"}
                  <span className="ml-2">
                    {impersonateStudentView ? "▴" : "▾"}
                  </span>
                </button>
              )}

              {isStudentView && (
                <StudentMenu
                  studentOpen={studentOpen}
                  setStudentOpen={setStudentOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}

              {roles.includes("ROLE_ADMIN") && (
                <AdminMenu
                  adminOpen={adminOpen}
                  setAdminOpen={setAdminOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              )}

              <SettingsMenu
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                setSidebarOpen={setSidebarOpen}
              />
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
    </>
  );
}
