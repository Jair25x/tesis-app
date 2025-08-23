// src/components/student/StudentMembersModal.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicMembers } from "../../hooks/classroom/usePublicMembers";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "../../hooks/classroom/queryKeys";

export default function StudentMembersModal({
  classroomId,
  open,
  onClose,
}: {
  classroomId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");

  // miembros públicos (expand para traer fullName/avatar cuando haya)
  const { data, isLoading } = usePublicMembers(classroomId, {
    page: 0,
    size: 50,
    expand: true,
    search,
    // sort: "joinedAt,desc", // ⬅️ quitar si el hook no lo soporta
  });

  // detalle del aula para identificar al owner si safeRole no viene
  const { data: detail } = useQuery({
    queryKey: classroomKeys.detail(classroomId),
    queryFn: () => classroomApi.getDetail(classroomId),
    enabled: open,
    staleTime: 60_000,
  });
  const ownerUuid = detail?.ownerUuid;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between border-b p-3 dark:border-gray-700">
          <h3 className="font-semibold">Miembros del aula</h3>
          <button
            className="text-sm px-2 py-1 rounded border dark:border-gray-700"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="p-3">
          <input
            className="w-full border rounded px-2 py-1 mb-3 dark:border-gray-700 dark:bg-gray-900"
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {isLoading ? (
            <div className="text-sm">Cargando…</div>
          ) : data?.content?.length ? (
            <ul className="divide-y dark:divide-gray-700">
              {data.content.map((m) => {
                const name = m.fullName ?? m.userUuid.slice(0, 8);
                const isOwner =
                  m.safeRole === "OWNER" || m.userUuid === ownerUuid;
                const badge = isOwner ? (
                  <span className="text-xs rounded px-2 py-0.5 bg-indigo-100 text-indigo-700">
                    DOCENTE
                  </span>
                ) : (
                  <span className="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-700">
                    Estudiante
                  </span>
                );
                return (
                  <li
                    key={m.userUuid}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(m.joinedAt).toLocaleString()}
                      </div>
                    </div>
                    {badge}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Sin miembros.</div>
          )}
        </div>
      </div>
    </div>
  );
}
