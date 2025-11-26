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

  // Archivar (soft delete) con update optimista
  const archiveMu = useMutation({
    mutationFn: (id: string) => classroomApi.remove(id),
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

  // Reactivar con update optimista
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
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-6 dark:bg-[#1e2a34] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mis aulas
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
              Crea, archiva y gestiona las aulas donde tus estudiantes practican
              con Capimath.
            </p>
          </div>
          <button
            type="button"
            onClick={() => createMu.mutate({ name: "Nueva aula" })}
            disabled={createMu.isPending}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {createMu.isPending ? "Creando…" : "➕ Crear aula"}
          </button>
        </div>

        {/* Aulas activas */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
            Aulas activas {active.length ? `(${active.length})` : ""}
          </h2>

          {active.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {active.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                      {c.membersCount}{" "}
                      {c.membersCount === 1 ? "miembro" : "miembros"}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                      to={`/teacher/classrooms/${c.id}`}
                    >
                      Abrir
                    </Link>
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
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
            <div className="rounded-2xl border border-dashed bg-white p-4 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              No tienes aulas activas. Crea una para empezar a asignar
              ejercicios.
            </div>
          )}
        </section>

        {/* Aulas archivadas */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100">
            Archivadas {archived.length ? `(${archived.length})` : ""}
          </h2>

          {archived.length ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {archived.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 opacity-90 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {c.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                      {c.membersCount}{" "}
                      {c.membersCount === 1 ? "miembro" : "miembros"}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
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
            <div className="text-sm text-gray-500 dark:text-gray-300">
              Sin aulas archivadas.
            </div>
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
          description="El aula pasará a la sección de 'Archivadas'. Podrás reactivarla más adelante."
          variant="warning"
        />
      </div>
    </div>
  );
}
