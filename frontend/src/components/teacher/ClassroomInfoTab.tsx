import { useEffect, useState } from "react";
import type { ClassroomDetailDto } from "../../types/classroom/ClassroomTypes";
import { useUpdateClassroom } from "../../hooks/classroom/useMutations";

interface ClassroomInfoTabProps {
  classroom: ClassroomDetailDto;
}

export default function ClassroomInfoTab({ classroom }: ClassroomInfoTabProps) {
  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description ?? "");
  const updateMu = useUpdateClassroom(classroom.id);

  // Sincronizar cuando llegue un refetch con otros datos
  useEffect(() => {
    setName(classroom.name);
    setDescription(classroom.description ?? "");
  }, [classroom.id, classroom.name, classroom.description]);

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();

  const isDirty =
    trimmedName !== classroom.name ||
    (classroom.description ?? "") !== trimmedDescription;

  const handleSave = () => {
    const payload: Partial<Pick<ClassroomDetailDto, "name" | "description">> = {
      name: trimmedName,
    };

    if (trimmedDescription) {
      payload.description = trimmedDescription;
    }

    updateMu.mutate(payload);
  };

  const handleReset = () => {
    setName(classroom.name);
    setDescription(classroom.description ?? "");
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Información del aula
        </h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
          Ajusta el nombre y la descripción. Los cambios se reflejan en la vista
          de las estudiantes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm md:col-span-2">
          <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">
            Nombre del aula
          </span>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/70 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Matemática 6°A – 2025"
          />
          <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Este nombre se muestra en la lista de aulas de las estudiantes.
          </span>
        </label>

        <label className="flex flex-col text-sm md:col-span-2">
          <span className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">
            Descripción (opcional)
          </span>
          <textarea
            className="min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/70 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            value={description}
            maxLength={400}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Aula para practicar operaciones, problemas y examen diagnóstico."
          />
          <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Puedes indicar periodo, grupo, o instrucciones generales.
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || updateMu.isPending || !trimmedName}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 disabled:hover:bg-indigo-600"
        >
          {updateMu.isPending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty || updateMu.isPending}
          className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
