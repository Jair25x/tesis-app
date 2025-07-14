import React from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface AchievementToastProps {
  title: string;
  description: string;
  icon?: string;
}

export function showAchievementToast({
  title,
  description,
  icon,
}: AchievementToastProps) {
  toast.custom(
    (t) => (
      <div
        className={`relative w-[90%] sm:w-[400px] rounded-2xl shadow-xl px-4 py-3 flex gap-3 items-start border-2
          ${t.visible ? "animate-enter" : "animate-leave"}
          bg-yellow-50 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600`}
      >
        {/* Botón de cierre */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute top-2 right-2 text-yellow-700 dark:text-yellow-200 hover:text-red-500 transition"
          aria-label="Cerrar notificación"
        >
          <X size={18} />
        </button>

        <div className="text-4xl">{icon ?? "🏅"}</div>
        <div className="flex-1">
          <p className="text-lg font-extrabold text-yellow-900 dark:text-yellow-200">
            {title}
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {description}
          </p>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "top-center", // 📌 Aparece desde arriba
    }
  );
}
