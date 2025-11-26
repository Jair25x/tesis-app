// src/pages/user/ThemeSettings.tsx
import React from "react";
import { useTheme } from "../../hooks/useTheme";

const ThemeSettings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12 dark:bg-[#1e2a34]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg dark:bg-[#2d3b46] sm:p-8">
        <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">
          🌓 Ajustes de tema
        </h2>
        <p className="mb-4 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
          Cambia entre modo claro y oscuro según tu preferencia o las
          condiciones de iluminación del entorno.
        </p>

        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-[#1e2a34] dark:text-gray-200">
          Tema actual:{" "}
          <strong className="font-semibold text-gray-900 dark:text-white">
            {isDark ? "Oscuro" : "Claro"}
          </strong>
        </div>

        <button
          onClick={toggleTheme}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {isDark ? "☀️ Cambiar a modo claro" : "🌙 Cambiar a modo oscuro"}
        </button>

        <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-300 sm:text-xs">
          Tu preferencia de tema se aplicará en todas las pantallas de la
          plataforma.
        </p>
      </div>
    </div>
  );
};

export default ThemeSettings;
