// src/utils/showAchievementToast.tsx
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface AchievementToastProps {
  title: string;
  description: string;
  icon?: string;
}

/** Registro local de toasts de “logros” para poder cerrarlos todos al navegar/logout */
const activeAchievementToastIds = new Set<string>();

export function dismissAllAchievementToasts() {
  for (const id of activeAchievementToastIds) {
    toast.dismiss(id);
  }
  activeAchievementToastIds.clear();
}

export function showAchievementToast({
  title,
  description,
  icon,
}: AchievementToastProps) {
  // Creamos un id propio para rastrear este toast
  const id = `ach-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeAchievementToastIds.add(id);

  toast.custom(
    () => (
      <div
        className={`
          relative w-[90%] sm:w-[400px] rounded-2xl shadow-xl px-4 py-3
          flex gap-3 items-start border-2
          bg-yellow-50 dark:bg-yellow-900
          border-yellow-400 dark:border-yellow-600
        `}
      >
        {/* Botón de cierre */}
        <button
          onClick={() => {
            toast.dismiss(id);
            activeAchievementToastIds.delete(id);
          }}
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
      id, // 👈 usamos nuestro id
      duration: 5000,
      position: "top-center",
    }
  );
}
