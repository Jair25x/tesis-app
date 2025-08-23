import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import LoadingScreen from "../../components/LoadingScreen";
import { classroomApi } from "../../services/classroomService";
import { showToast } from "../../utils/showToast";
import StudentMembersModal from "../../components/student/StudentMembersModal";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { classroomKeys } from "../../hooks/classroom/queryKeys";
import { useLeaveClassroom } from "../../hooks/classroom/useMutations";
import type { ClassroomSummaryDto } from "../../types/classroom/ClassroomTypes";

export default function StudentClassroomsPage() {
  // Lista de aulas donde está inscrito el estudiante
  const { data, isLoading, isError } = useQuery({
    queryKey: classroomKeys.enrolled,
    queryFn: () => classroomApi.listEnrolled(),
    staleTime: 60_000,
  });

  // Modal de miembros
  const [openMembersId, setOpenMembersId] = useState<string | null>(null);

  // Confirmación para salir del aula
  const [pendingLeave, setPendingLeave] = useState<string | null>(null);
  const leaveMu = useLeaveClassroom();

  if (isLoading) return <LoadingScreen />;
  if (isError) {
    showToast.error("No se pudieron cargar tus aulas.");
    return (
      <div className="p-4 text-sm text-red-600">Error al cargar aulas.</div>
    );
  }

  const list: ClassroomSummaryDto[] = data ?? [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis aulas</h1>
        <Link
          to="/student/join"
          className="rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
        >
          + Unirme a un aula
        </Link>
      </div>

      {list.length > 0 ? (
        <ul className="grid gap-3">
          {list.map((c) => (
            <li
              key={c.id}
              className="border rounded p-3 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{c.name}</div>
                  {c.description ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {c.description}
                    </div>
                  ) : null}
                  <div className="text-xs text-gray-500 mt-1">
                    {c.membersCount}{" "}
                    {c.membersCount === 1 ? "miembro" : "miembros"}
                  </div>
                </div>

                <div className="shrink-0 flex gap-2">
                  <button
                    className="rounded border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                    onClick={() => setOpenMembersId(c.id)}
                    title="Ver miembros del aula"
                  >
                    Ver miembros
                  </button>
                  <button
                    className="rounded border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                    onClick={() => setPendingLeave(c.id)}
                    title="Salir del aula"
                  >
                    Salir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">
          Aún no perteneces a ninguna aula. Usa “Unirme a un aula”.
        </div>
      )}

      {/* Modal de miembros */}
      {openMembersId && (
        <StudentMembersModal
          classroomId={openMembersId}
          open={true}
          onClose={() => setOpenMembersId(null)}
        />
      )}

      {/* Confirmación: salir del aula */}
      <ConfirmModal
        isOpen={!!pendingLeave}
        onClose={() => setPendingLeave(null)}
        onConfirm={async () => {
          if (!pendingLeave) return;
          await leaveMu.mutateAsync(pendingLeave);
          setPendingLeave(null);
        }}
        isLoading={leaveMu.isPending}
        title="Salir del aula"
        description="Esta acción te quitará acceso a los contenidos del aula. ¿Confirmas?"
        variant="warning"
      />
    </div>
  );
}
