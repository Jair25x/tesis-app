// src/layouts/components/Sidebar.tsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useStudentView } from "../../context/useStudentView";
import { cn } from "../../utils/cn";
import { X } from "lucide-react";
import StudentMenu from "./StudentMenu";
import AdminMenu from "./AdminMenu";
import SettingsMenu from "./SettingsMenu";
import TeacherMenu from "./TeacherMenu";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { impersonateStudentView, toggleStudentView, isStudentView } =
    useStudentView();
  const location = useLocation();
  const roles = user?.roles || [];
  const isTeacher =
    roles.includes("ROLE_TEACHER") || roles.includes("ROLE_ADMIN");

  const [teacherOpen, setTeacherOpen] = useState(true);
  const [studentOpen, setStudentOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (isStudentView) setStudentOpen(true);
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
        <div className="flex h-full flex-col">
          {/* Header fijo */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#2d3b46] dark:text-white">
              TesisApp
            </h2>
            <button
              className="md:hidden text-gray-700 dark:text-gray-300"
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>
          </div>

          {isAuthenticated && user && (
            <p className="mb-4 text-sm italic text-gray-700 dark:text-gray-300">
              👋 Hola, <span className="font-semibold">{user.nombres}</span>
            </p>
          )}

          {/* Zona scrollable con fade inferior */}
          <div className="relative flex-1 overflow-y-auto no-scrollbar pr-1">
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

              {isTeacher && (
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

              <SettingsMenu
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </nav>

            {/* Fade inferior (sugiere que hay más contenido) */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-6
                         bg-gradient-to-t from-white to-transparent
                         dark:from-[#1e2a34]"
            />
          </div>

          {/* Footer fijo (logout) */}
          {isAuthenticated && (
            <div className="pt-4">
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login", { replace: true });
                  setSidebarOpen(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                🔓 Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
