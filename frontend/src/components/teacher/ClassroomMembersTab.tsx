import { useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useClassroomMembers } from "../../hooks/classroom/useClassroomMembers";
import { useMembersDirectory } from "../../hooks/classroom/useMembersDirectory";
import LoadingScreen from "../LoadingScreen";
import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "../../hooks/classroom/queryKeys";
import { showToast } from "../../utils/showToast";
import type { MemberDto } from "../../types/classroom/ClassroomTypes";

interface ClassroomMembersTabProps {
  classroomId: string;
}

export default function ClassroomMembersTab({
  classroomId,
}: ClassroomMembersTabProps) {
  const { data, isLoading } = useClassroomMembers(classroomId);
  const { byId: byIdPublic } = useMembersDirectory(classroomId);

  const [q, setQ] = useState("");
  const [newUuid, setNewUuid] = useState("");

  const qc = useQueryClient();

  // Expulsar miembro (solo STUDENT)
  const removeMu = useMutation({
    mutationFn: (userUuid: string) =>
      classroomApi.removeMember(classroomId, userUuid),
    onSuccess: () => {
      showToast.success("Miembro expulsado.");
      qc.invalidateQueries({ queryKey: classroomKeys.members(classroomId) });
    },
    onError: () => showToast.error("No se pudo expulsar."),
  });

  // Agregar estudiante
  const addMu = useMutation({
    mutationFn: (userUuid: string) =>
      classroomApi.addMember(classroomId, userUuid, "STUDENT"),
    onSuccess: () => {
      showToast.success("Estudiante agregado.");
      setNewUuid("");
      qc.invalidateQueries({ queryKey: classroomKeys.members(classroomId) });
    },
    onError: () => showToast.error("No se pudo agregar el estudiante."),
  });

  const list: MemberDto[] = data ?? [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;

    return list.filter((m) => {
      const pub = byIdPublic.get(m.userUuid);
      const name = (pub?.fullName ?? m.fullName ?? "").toLowerCase();
      const uid = m.userUuid.toLowerCase();
      const role = m.role.toLowerCase();
      return name.includes(term) || uid.includes(term) || role.includes(term);
    });
  }, [list, q, byIdPublic]);

  const handleAdd = () => {
    const v = newUuid.trim();
    if (!/^[0-9a-fA-F-]{32,36}$/.test(v)) {
      showToast.info("Ingresa un UUID válido.");
      return;
    }
    addMu.mutate(v);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      {/* Barra superior: buscador + agregar estudiante */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <label className="flex flex-col text-sm md:w-1/3">
          <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
            Buscar
          </span>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/70 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            placeholder="Nombre, UUID o rol…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <form
          className="flex flex-col gap-2 text-sm md:flex-row md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <label className="flex flex-col md:w-80">
            <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
              Agregar estudiante (UUID)
            </span>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/70 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={newUuid}
              onChange={(e) => setNewUuid(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={addMu.isPending}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {addMu.isPending ? "Agregando…" : "Agregar"}
          </button>
        </form>
      </div>

      {/* Lista de miembros */}
      {filtered.length ? (
        <ul className="divide-y text-sm dark:divide-gray-800">
          {filtered.map((m) => {
            const pub = byIdPublic.get(m.userUuid);
            const name = pub?.fullName ?? m.fullName ?? m.userUuid.slice(0, 8);
            const avatarUrl = pub?.avatarUrl;
            return (
              <MemberRow
                key={m.userUuid}
                m={m}
                name={name}
                avatarUrl={avatarUrl}
                onRemove={() => removeMu.mutate(m.userUuid)}
                removing={removeMu.isPending}
              />
            );
          })}
        </ul>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-300">
          Sin miembros aún.
        </div>
      )}
    </div>
  );
}

function MemberRow({
  m,
  name,
  avatarUrl,
  onRemove,
  removing,
}: {
  m: MemberDto;
  name: string;
  avatarUrl?: string;
  onRemove: () => void;
  removing: boolean;
}) {
  const joined = new Date(m.joinedAt).toLocaleString();

  const badge =
    m.role === "OWNER"
      ? { text: "OWNER", cls: "bg-indigo-100 text-indigo-700" }
      : m.role === "CO_TEACHER"
      ? { text: "CO-TEACHER", cls: "bg-blue-100 text-blue-700" }
      : { text: "STUDENT", cls: "bg-gray-100 text-gray-700" };

  return (
    <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} src={avatarUrl} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          <div className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-300">
            <span
              className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}
            >
              {badge.text}
            </span>
            <span className="font-mono break-all">{m.userUuid}</span> · {joined}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {m.role === "STUDENT" && (
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            onClick={onRemove}
            disabled={removing}
            title="Expulsar estudiante"
          >
            Expulsar
          </button>
        )}
      </div>
    </li>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-8 w-8 rounded-full border object-cover dark:border-gray-700"
      />
    );
  }

  return (
    <div className="grid h-8 w-8 place-items-center rounded-full border bg-gray-200 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100">
      {initials || "?"}
    </div>
  );
}
