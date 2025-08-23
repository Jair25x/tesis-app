// src/components/teacher/ClassroomInfoTab.tsx
import { useState } from "react";
import type { ClassroomDetailDto } from "../../types/classroom/ClassroomTypes";
import { useUpdateClassroom } from "../../hooks/classroom/useMutations";


export default function ClassroomInfoTab({
  classroom,
}: {
  classroom: ClassroomDetailDto;
}) {
  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description ?? "");
  const updateMu = useUpdateClassroom(classroom.id);

  return (
    <div className="border rounded p-3 dark:border-gray-700">
      <div className="grid gap-2">
        <label className="text-sm">
          <span className="block mb-1">Nombre</span>
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1">Descripción</span>
          <textarea
            className="border rounded px-2 py-1 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div>
          <button
            onClick={() => updateMu.mutate({ name, description })}
            className="rounded bg-blue-600 text-white px-3 py-1.5"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
