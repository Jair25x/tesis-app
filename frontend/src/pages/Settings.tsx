// src/pages/Settings.tsx
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#2d3b46] text-gray-800 dark:text-white p-6 rounded-lg shadow-md overflow-hidden">
      <h1 className="text-xl font-bold mb-4">⚙️ Configuración</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm">
          Tema actual: <strong>{theme === "dark" ? "Oscuro" : "Claro"}</strong>
        </p>
        <button
          onClick={toggleTheme}
          className={cn(
            "px-4 py-2 rounded transition text-sm",
            theme === "dark"
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-gray-200 text-black hover:bg-gray-300"
          )}
        >
          {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </div>
    </div>
  );
}
