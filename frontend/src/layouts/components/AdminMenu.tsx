import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useState } from "react";
import { useCurriculum } from "../../hooks/useCurriculum"; // ✅ Nuevo hook

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
  const { curricula } = useCurriculum(); // ✅ Obtenemos el estado global
  const [curriculaOpen, setCurriculaOpen] = useState(false);

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
          <Link
            to="/admin/curricula"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            📚 Currículos
          </Link>

          {/* Submenú de competencias por currículo */}
          <div>
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setCurriculaOpen((prev) => !prev)}
            >
              📗 Competencias
              <span className="ml-2">{curriculaOpen ? "▴" : "▾"}</span>
            </button>

            {curriculaOpen && (
              <div className="ml-4 mt-1 max-h-64 overflow-y-auto space-y-1 pr-1">
                {curricula.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                    No hay currículos activos.
                  </p>
                )}
                {curricula.map((curriculum) => (
                  <Link
                    key={curriculum.id}
                    to={`/admin/curricula/${curriculum.id}/competencies`}
                    className="block px-4 py-1 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 w-full"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="block truncate" title={curriculum.name}>
                      {curriculum.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
