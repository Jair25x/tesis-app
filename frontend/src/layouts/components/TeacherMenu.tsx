import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface TeacherMenuProps {
  teacherOpen: boolean;
  setTeacherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

const baseItem =
  "block rounded-md px-3 py-2 text-sm transition outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:hover:bg-gray-800";
const activeItem =
  "bg-indigo-600/15 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-200";

export default function TeacherMenu({
  teacherOpen,
  setTeacherOpen,
  setSidebarOpen,
}: TeacherMenuProps) {
  const location = useLocation();
  const sectionActive = location.pathname.startsWith("/teacher");
  const item = ({ isActive }: { isActive: boolean }) =>
    cn(baseItem, isActive && activeItem);

  return (
    <div className="relative">
      {/* Toggle sección Docente */}
      <button
        aria-expanded={teacherOpen}
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
          sectionActive ? "bg-indigo-500 text-white" : ""
        )}
        onClick={() => setTeacherOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2">📊 Docente</span>
        <span className="ml-2">{teacherOpen ? "▴" : "▾"}</span>
      </button>

      {teacherOpen && (
        <div className="ml-4 mt-1 space-y-1">
          {/* ——— Núcleo docente ——— */}
          <NavLink
            to="/teacher/dashboard"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
            to="/teacher/classrooms"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🏫 Mis aulas
          </NavLink>
          <NavLink
            to="/teacher/ai/recommendations"
            className={item}
            onClick={() => setSidebarOpen(false)}
          >
            🤖 Recomendaciones (IA)
          </NavLink>

          {/* ——— Evaluaciones: Plantillas ——— */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Plantillas
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/teacher/assessments/templates"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                📚 Mis plantillas
              </NavLink>
              <NavLink
                to="/teacher/assessments/templates/new"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                ➕ Crear plantilla
              </NavLink>
            </nav>
          </div>

          {/* ——— Evaluaciones: Asignaciones ——— */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Asignaciones
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/teacher/assessments"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                📝 Mis asignaciones
              </NavLink>
              <NavLink
                to="/teacher/assessments/new"
                className={item}
                onClick={() => setSidebarOpen(false)}
              >
                ➕ Crear asignación
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
