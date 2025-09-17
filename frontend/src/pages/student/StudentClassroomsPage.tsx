// src/pages/student/StudentClassroomsPage.tsx
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

/** Badge reutilizable */
function Pill({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      {children}
    </span>
  );
}

/** Botón de acción “fantasma/outline” coherente con dark/light */
function GhostButton({
  children,
  onClick,
  title,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className="rounded-lg border px-3 py-1.5 text-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  );
}

/** Card de Aula */
function ClassroomCard({
  c,
  onOpenMembers,
  onLeave,
}: {
  c: ClassroomSummaryDto;
  onOpenMembers: (id: string) => void;
  onLeave: (id: string) => void;
}) {
  const membersLabel =
    c.membersCount === 1 ? "1 miembro" : `${c.membersCount} miembros`;

  return (
    <li
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition",
        "hover:shadow-md focus-within:shadow-md dark:border-gray-700 dark:bg-gray-800",
      ].join(" ")}
    >
      {/* adorno superior sutil */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 opacity-70"></div>

      {/* encabezado */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {c.name}
          </h3>
        </div>

        {/* badge miembros */}
        <Pill title="Cantidad de integrantes del aula">👥 {membersLabel}</Pill>
      </div>

      {/* descripción (clamp) */}
      {c.description ? (
        <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
          {c.description}
        </p>
      ) : (
        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          Sin descripción.
        </p>
      )}

      {/* acciones */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <GhostButton
          onClick={() => onOpenMembers(c.id)}
          title="Ver miembros del aula"
        >
          Ver miembros
        </GhostButton>

        <GhostButton onClick={() => onLeave(c.id)} title="Salir del aula">
          Salir
        </GhostButton>

        {/* CTA secundaria de navegación (opcional) */}
        {/* Si tienes una ruta de detalle del aula, activa este Link.
            Por defecto lo dejamos hacia /student/join para mantener el flujo actual. */}
        <Link
          to="/student/join"
          className="ml-auto inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Unirme a un aula mediante código"
          title="Unirme a un aula"
        >
          + Unirme a un aula
        </Link>
      </div>
    </li>
  );
}

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
      <div className="p-4 text-sm text-red-600 dark:text-red-400">
        Error al cargar aulas.
      </div>
    );
  }

  const list: ClassroomSummaryDto[] = data ?? [];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      {/* Toolbar superior */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
            Mis aulas
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aquí verás todas las clases a las que perteneces.
          </p>
        </div>
        <Link
          to="/student/join"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          + Unirme a un aula
        </Link>
      </div>

      {/* Grid de cards */}
      {list.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ClassroomCard
              key={c.id}
              c={c}
              onOpenMembers={(id) => setOpenMembersId(id)}
              onLeave={(id) => setPendingLeave(id)}
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
          Aún no perteneces a ninguna aula. Pulsa{" "}
          <Link
            to="/student/join"
            className="font-medium text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
          >
            “Unirme a un aula”
          </Link>{" "}
          y usa el código que te compartió tu profesor(a).
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
