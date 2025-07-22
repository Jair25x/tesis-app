// src/layouts/components/SettingsMenu.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

interface SettingsMenuProps {
  settingsOpen: boolean;
  setSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSidebarOpen: (open: boolean) => void;
}

export default function SettingsMenu({
  settingsOpen,
  setSettingsOpen,
  setSidebarOpen,
}: SettingsMenuProps) {
  const location = useLocation();

  return (
    <div className="relative">
      <button
        className={cn(
          "w-full text-left px-4 py-2 rounded-md text-sm font-medium flex justify-between items-center transition hover:bg-gray-200 dark:hover:bg-gray-700",
          location.pathname.startsWith("/settings")
            ? "bg-green-500 text-white"
            : ""
        )}
        onClick={() => setSettingsOpen((prev) => !prev)}
      >
        ⚙️ Configuración
        <span className="ml-2">{settingsOpen ? "▴" : "▾"}</span>
      </button>
      {settingsOpen && (
        <div className="ml-4 mt-1 space-y-1">
          <Link
            to="/settings/profile"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            👤 Perfil
          </Link>
          <Link
            to="/settings/edit-profile"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            ✏️ Editar Perfil
          </Link>
          <Link
            to="/settings/change-password"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🔒 Cambiar Contraseña
          </Link>
          <Link
            to="/settings/theme"
            className="block px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            🌓 Tema
          </Link>
        </div>
      )}
    </div>
  );
}
