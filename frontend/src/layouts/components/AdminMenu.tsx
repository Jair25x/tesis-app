import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useState } from "react";
import { useCurriculum } from "../../hooks/useCurriculum";
import { useCompetencyMap } from "../../hooks/useCompetencyMap";

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

  // Aseguramos fallback con array vacío
  const { curricula = [] } = useCurriculum();
  const { competencyMap } = useCompetencyMap(curricula); // ✅ seguro gracias a fallback arriba

  const [curriculaOpen, setCurriculaOpen] = useState(false);
  const [expandedCurriculum, setExpandedCurriculum] = useState<string | null>(
    null
  );

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
          <Link
            to="/admin/explorer"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🧭 Explorador Curricular
          </Link>

          {/* Submenú dinámico: Currículo → Competencias */}
          <div>
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setCurriculaOpen((prev) => !prev)}
            >
              📗 Competencias
              <span className="ml-2">{curriculaOpen ? "▴" : "▾"}</span>
            </button>

            {curriculaOpen && (
              <div className="ml-4 mt-1 max-h-64 overflow-y-auto pr-1 space-y-1">
                {curricula.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 px-4">
                    No hay currículos activos.
                  </p>
                )}

                {curricula.map((curriculum) => (
                  <div key={curriculum.id}>
                    <button
                      className="w-full text-left px-4 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      onClick={() =>
                        setExpandedCurriculum((prev) =>
                          prev === curriculum.id ? null : curriculum.id
                        )
                      }
                    >
                      {curriculum.name}
                    </button>

                    {expandedCurriculum === curriculum.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {(competencyMap?.[curriculum.id] ?? []).map((comp) => (
                          <div key={comp.id}>
                            <Link
                              to={`/admin/curricula/${curriculum.id}/competencies/${comp.id}/standards`}
                              className="block px-4 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 truncate"
                              title={comp.name}
                              onClick={() => setSidebarOpen(false)}
                            >
                              ↳ {comp.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
