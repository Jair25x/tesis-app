// src/layouts/components/StudentMenu.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface StudentMenuProps {
  studentOpen: boolean;
  setStudentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

export default function StudentMenu({
  studentOpen,
  setStudentOpen,
  setSidebarOpen,
}: StudentMenuProps) {
  const location = useLocation();

  const isSectionActive = location.pathname.startsWith("/student");

  const itemClass =
    "block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="relative">
      <button
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
          isSectionActive ? "bg-green-500 text-white" : ""
        )}
        onClick={() => setStudentOpen((prev) => !prev)}
      >
        📚 Estudiante
        <span className="ml-2">{studentOpen ? "▴" : "▾"}</span>
      </button>

      {studentOpen && (
        <div className="ml-4 mt-1 space-y-1">
          <Link
            to="/student/dashboard"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Dashboard
          </Link>

          {/* Launcher del mapa */}
          <Link
            to="/student/roadmap"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🗺️ Mapa de estudio
          </Link>

          {/* 🔹 NUEVOS: Aulas */}
          <Link
            to="/student/classrooms"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🏫 Mis aulas
          </Link>
          <Link
            to="/student/join"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            ➕ Unirme a un aula
          </Link>

          <Link
            to="/student/achievements"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            🏆 Logros
          </Link>

          <Link
            to="/student/diagnostic"
            className={itemClass}
            onClick={() => setSidebarOpen(false)}
          >
            📋 Test de Diagnóstico
          </Link>
        </div>
      )}
    </div>
  );
}
