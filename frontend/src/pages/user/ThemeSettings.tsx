// src/pages/user/ThemeSettings.tsx
import { useTheme } from "../../hooks/useTheme";

export default function ThemeSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex justify-center items-center px-4 py-12 bg-gray-50 dark:bg-[#1e2a34] h-screen">
      <div className="w-full max-w-sm bg-white dark:bg-[#2d3b46] p-6 rounded-2xl shadow-lg space-y-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          🌓 Ajustes de Tema
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Tema actual:{" "}
          <strong className="text-gray-900 dark:text-white">
            {theme === "dark" ? "Oscuro" : "Claro"}
          </strong>
        </p>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-medium rounded-md transition"
        >
          {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
        </button>
      </div>
    </div>
  );
}
