// src/components/admin/EntityList.tsx
import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface EntityListProps {
  title: string;
  addButtonText: string;
  onAddClick: () => void;
  filter: "all" | "active" | "inactive";
  setFilter: (filter: "all" | "active" | "inactive") => void;
  children: ReactNode;
  loading: boolean;
  error: string;
  emptyMessage: string;
}

export default function EntityList({
  title,
  addButtonText,
  onAddClick,
  filter,
  setFilter,
  children,
  loading,
  error,
  emptyMessage,
}: EntityListProps) {
  return (
    <section className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-center sm:text-left w-full sm:w-auto">
          {title}
        </h1>
        {/* Botón de adición dentro de un contenedor estilizado */}
        <div className="w-full sm:w-auto">
          <button
            onClick={onAddClick}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition duration-200"
          >
            ➕ {addButtonText}
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={cn(
              "px-3 py-1 rounded text-sm transition font-medium",
              filter === type
                ? {
                    all: "bg-blue-600 text-white",
                    active: "bg-green-600 text-white",
                    inactive: "bg-red-600 text-white",
                  }[type]
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {type === "all"
              ? "Todos"
              : type === "active"
              ? "Activos"
              : "Inactivos"}
          </button>
        ))}
      </div>

      {/* Tabla o mensajes */}
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : children ? (
        children
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          {emptyMessage}
        </p>
      )}
    </section>
  );
}
