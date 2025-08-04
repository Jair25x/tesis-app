// src/components/layout/AdminMenu.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface AdminMenuProps {
  adminOpen: boolean;
  setAdminOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminMenu({
  adminOpen,
  setAdminOpen,
  setSidebarOpen,
}: AdminMenuProps) {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? "bg-green-500 text-white" : "";

  return (
    <div className="relative">
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
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin$")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/admin/users"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/users")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            🧑‍💼 Usuarios
          </Link>
          <Link
            to="/admin/curricula"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/curricula")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            📚 Currículos
          </Link>
          <Link
            to="/admin/competencies"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/competencies")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            📗 Competencias
          </Link>
          <Link
            to="/admin/standards"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/standards")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            📘 Estándares
          </Link>
          <Link
            to="/admin/objectives"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/objectives")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            🎯 Objetivos
          </Link>
          <Link
            to="/admin/exercises"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/exercises")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            ✏️ Ejercicios
          </Link>
          <Link
            to="/admin/explorer"
            className={cn(
              "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
              isActive("/admin/explorer")
            )}
            onClick={() => setSidebarOpen(false)}
          >
            🧭 Explorador Curricular
          </Link>
        </div>
      )}
    </div>
  );
}
