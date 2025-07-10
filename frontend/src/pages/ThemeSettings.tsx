// src/pages/ThemeSettings.tsx
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export default function ThemeSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="text-center space-y-4">
      <p className="text-lg">
        Tema actual: <strong>{theme === "dark" ? "Oscuro" : "Claro"}</strong>
      </p>
      <button
                onClick={toggleTheme}
                className={cn(
                  "mt-auto px-4 py-2 rounded transition",
                  theme === "dark"
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                )}
              >
                {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
              </button>
    </div>
  );
}
