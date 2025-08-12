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

  return (
    <div className="relative">
      <button
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
          location.pathname.startsWith("/student")
            ? "bg-green-500 text-white"
            : ""
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
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Dashboard
          </Link>

          {/* 🔹 Solo launcher del mapa */}
          <Link
            to="/student/roadmap"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🗺️ Mapa de estudio
          </Link>

          <Link
            to="/student/achievements"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🏆 Logros
          </Link>
          <Link
            to="/student/diagnostic"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            📋 Test de Diagnóstico
          </Link>
        </div>
      )}
    </div>
  );
}
