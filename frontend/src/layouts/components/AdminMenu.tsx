// src/layouts/components/AdminMenu.tsx
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useId, type KeyboardEvent } from "react";

interface AdminMenuProps {
  adminOpen: boolean;
  setAdminOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

const baseItem =
  "group relative block rounded-md px-3 py-2 text-sm transition outline-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 dark:hover:bg-gray-800";
const activeItem =
  "bg-green-600/15 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-400/10 dark:text-green-200";

function ItemLink({
  to,
  children,
  onNavigate,
  end,
}: {
  to: string;
  children: React.ReactNode;
  onNavigate: () => void;
  end?: boolean;
}) {
  const item = ({ isActive }: { isActive: boolean }) =>
    cn(baseItem, isActive && activeItem);
  return (
    <NavLink to={to} end={end} className={item} onClick={onNavigate}>
      {children}
    </NavLink>
  );
}

export default function AdminMenu({
  adminOpen,
  setAdminOpen,
  setSidebarOpen,
}: AdminMenuProps) {
  const location = useLocation();
  const sectionActive = location.pathname.startsWith("/admin");
  const panelId = useId();

  const toggleOpen = () => setAdminOpen((prev) => !prev);
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={adminOpen}
        aria-controls={panelId}
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500",
          sectionActive ? "bg-green-500 text-white" : ""
        )}
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
      >
        <span className="flex items-center gap-2">🛠 Administración</span>
        <span className="ml-2" aria-hidden="true">
          {adminOpen ? "▴" : "▾"}
        </span>
      </button>

      {adminOpen && (
        <div id={panelId} className="ml-4 mt-1 space-y-1">
          {/* Nivel 1 */}
          <ItemLink to="/admin" end onNavigate={closeSidebar}>
            📊 Dashboard
          </ItemLink>

          {/* Contenido curricular */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Contenido curricular
            </div>
            <nav className="space-y-1">
              <ItemLink to="/admin/curricula" onNavigate={closeSidebar}>
                📚 Currículos
              </ItemLink>
              {/* <ItemLink to="/admin/explorer" onNavigate={closeSidebar}>
                🧭 Explorador Curricular
              </ItemLink> */}
            </nav>
          </div>

          {/* Catálogo global */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Catálogo global
            </div>
            <nav className="space-y-1">
              <ItemLink
                to="/admin/catalog/competencies"
                onNavigate={closeSidebar}
              >
                🗂️ Competencias (todas)
              </ItemLink>
              <ItemLink to="/admin/catalog/standards" onNavigate={closeSidebar}>
                🗃️ Estándares (todos)
              </ItemLink>
              <ItemLink
                to="/admin/catalog/objectives"
                onNavigate={closeSidebar}
              >
                🧩 Objetivos (todos)
              </ItemLink>
              <ItemLink to="/admin/catalog/exercises" onNavigate={closeSidebar}>
                ✏️ Ejercicios (todos)
              </ItemLink>
            </nav>
          </div>

          {/* Evaluaciones */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              Evaluaciones
            </div>
            <nav className="space-y-1">
              <ItemLink
                to="/admin/assessments/templates"
                onNavigate={closeSidebar}
              >
                📄 Plantillas
              </ItemLink>
              <ItemLink
                to="/admin/assessments/templates/new"
                onNavigate={closeSidebar}
              >
                ➕ Nueva plantilla
              </ItemLink>
              <ItemLink
                to="/admin/assessments/assignments"
                onNavigate={closeSidebar}
              >
                📋 Asignaciones
              </ItemLink>
              <ItemLink
                to="/admin/assessments/assignments/new"
                onNavigate={closeSidebar}
              >
                📝 Nueva asignación
              </ItemLink>
              <ItemLink to="/admin/assessments/tools" onNavigate={closeSidebar}>
                🧰 Herramientas
              </ItemLink>
            </nav>
          </div>

          {/* IA / Debug */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide opacity-60">
              IA / Debug
            </div>
            <nav className="space-y-1">
              <ItemLink to="/admin/ai-advisor" onNavigate={closeSidebar}>
                🤖 Chat de CapiBOT (debug)
              </ItemLink>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
