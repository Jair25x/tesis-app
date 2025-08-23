import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import LoadingScreen from "../../components/LoadingScreen";
import ConfirmModal from "../../components/ui/ConfirmModal";

import { useClassroomsMine } from "../../hooks/classroom/useClassroomsMine";
import { useCreateClassroom } from "../../hooks/classroom/useMutations";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "../../hooks/classroom/queryKeys";
import type { ClassroomSummaryDto } from "../../types/classroom/ClassroomTypes";
import { showToast } from "../../utils/showToast";

export default function TeacherClassrooms() {
  const { data, isLoading } = useClassroomsMine();
  const createMu = useCreateClassroom();

  const qc = useQueryClient();
  const [pendingArchive, setPendingArchive] = useState<string | null>(null);

  // Archivar (soft delete) con update optimista: active -> false
  const archiveMu = useMutation({
    mutationFn: (id: string) => classroomApi.remove(id), // tu backend hace soft delete
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: classroomKeys.mine });
      const previous = qc.getQueryData<ClassroomSummaryDto[]>(
        classroomKeys.mine
      );
      if (previous) {
        const next = previous.map((c) =>
          c.id === id ? { ...c, active: false } : c
        );
        qc.setQueryData<ClassroomSummaryDto[]>(classroomKeys.mine, next);
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(classroomKeys.mine, ctx.previous);
      }
      showToast.error("No se pudo archivar el aula.");
    },
    onSuccess: () => showToast.success("Aula archivada."),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: classroomKeys.mine });
    },
  });

  // Reactivar con update optimista: active -> true
  const restoreMu = useMutation({
    mutationFn: (id: string) => classroomApi.update(id, { active: true }),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: classroomKeys.mine });
      const previous = qc.getQueryData<ClassroomSummaryDto[]>(
        classroomKeys.mine
      );
      if (previous) {
        const next = previous.map((c) =>
          c.id === id ? { ...c, active: true } : c
        );
        qc.setQueryData<ClassroomSummaryDto[]>(classroomKeys.mine, next);
      }
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(classroomKeys.mine, ctx.previous);
      }
      showToast.error("No se pudo reactivar el aula.");
    },
    onSuccess: () => showToast.success("Aula reactivada."),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: classroomKeys.mine });
    },
  });

  const active = useMemo(
    () => (data ?? []).filter((c) => c.active !== false),
    [data]
  );
  const archived = useMemo(
    () => (data ?? []).filter((c) => c.active === false),
    [data]
  );

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis aulas</h1>
        <button
          onClick={() => createMu.mutate({ name: "Nueva aula" })}
          className="rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 transition-colors"
        >
          + Crear
        </button>
      </div>

      {/* Aulas activas */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
          Aulas activas {active.length ? `(${active.length})` : ""}
        </h2>

        {active.length ? (
          <ul className="grid gap-3">
            {active.map((c) => (
              <li
                key={c.id}
                className="border rounded p-3 flex items-center justify-between dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">
                    {c.membersCount}{" "}
                    {c.membersCount === 1 ? "miembro" : "miembros"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    to={`/teacher/classrooms/${c.id}`}
                  >
                    Abrir
                  </Link>
                  <button
                    className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setPendingArchive(c.id)}
                    disabled={archiveMu.isPending}
                    title="Archivar aula"
                  >
                    Archivar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No tienes aulas activas.</div>
        )}
      </section>

      {/* Aulas archivadas */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
          Archivadas {archived.length ? `(${archived.length})` : ""}
        </h2>

        {archived.length ? (
          <ul className="grid gap-3">
            {archived.map((c) => (
              <li
                key={c.id}
                className="border rounded p-3 flex items-center justify-between dark:border-gray-700 bg-white dark:bg-gray-800 opacity-90"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">
                    {c.membersCount}{" "}
                    {c.membersCount === 1 ? "miembro" : "miembros"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded border px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => restoreMu.mutate(c.id)}
                    disabled={restoreMu.isPending}
                    title="Reactivar aula"
                  >
                    Reactivar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">Sin aulas archivadas.</div>
        )}
      </section>

      <ConfirmModal
        isOpen={!!pendingArchive}
        onClose={() => setPendingArchive(null)}
        onConfirm={async () => {
          if (!pendingArchive) return;
          await archiveMu.mutateAsync(pendingArchive);
          setPendingArchive(null);
        }}
        isLoading={archiveMu.isPending}
        title="Archivar aula"
        description="El aula pasará a 'Archivadas'. ¿Confirmas?"
        variant="warning"
      />
    </div>
  );
}
