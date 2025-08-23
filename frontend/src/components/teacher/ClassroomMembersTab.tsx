// src/components/teacher/ClassroomMembersTab.tsx
import { useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useClassroomMembers } from "../../hooks/classroom/useClassroomMembers";
import { useMembersDirectory } from "../../hooks/classroom/useMembersDirectory";
import LoadingScreen from "../LoadingScreen";

import { classroomApi } from "../../services/classroomService";
import { classroomKeys } from "../../hooks/classroom/queryKeys";
import { showToast } from "../../utils/showToast";
import type { MemberDto } from "../../types/classroom/ClassroomTypes";

export default function ClassroomMembersTab({
  classroomId,
}: {
  classroomId: string;
}) {
  // Privado: roles reales (OWNER/CT/STUDENT)
  const { data, isLoading } = useClassroomMembers(classroomId);
  // Público expandido: fullName + avatar (y safeRole)
  const { byId: byIdPublic } = useMembersDirectory(classroomId);

  const [q, setQ] = useState("");

  // 👉 Mutación: expulsar miembro (solo STUDENT)
  const qc = useQueryClient();
  const removeMu = useMutation({
    mutationFn: (userUuid: string) =>
      classroomApi.removeMember(classroomId, userUuid),
    onSuccess: () => {
      showToast.success("Miembro expulsado.");
      qc.invalidateQueries({ queryKey: classroomKeys.members(classroomId) });
    },
    onError: () => showToast.error("No se pudo expulsar."),
  });

  // 👉 Mutación: agregar estudiante por UUID
  const [newUuid, setNewUuid] = useState("");
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

  // ⚠️ Hooks SIEMPRE antes de cualquier return:
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

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="border rounded p-3 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Barra superior: buscador + agregar estudiante */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <label className="text-sm inline-flex flex-col gap-1">
          <span className="text-xs">Buscar</span>
          <input
            className="border rounded px-2 py-1 w-72 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            placeholder="Nombre, UUID o rol…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = newUuid.trim();
            if (!/^[0-9a-fA-F-]{32,36}$/.test(v)) {
              showToast.info("Ingresa un UUID válido.");
              return;
            }
            addMu.mutate(v);
          }}
        >
          <label className="text-sm inline-flex flex-col gap-1">
            <span className="text-xs">Agregar estudiante (UUID)</span>
            <input
              className="border rounded px-2 py-1 w-80 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={newUuid}
              onChange={(e) => setNewUuid(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={addMu.isPending}
            className="rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700 disabled:opacity-60"
          >
            {addMu.isPending ? "Agregando…" : "Agregar"}
          </button>
        </form>
      </div>

      {filtered.length ? (
        <ul className="divide-y dark:divide-gray-700">
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
        <div className="text-sm text-gray-500">Sin miembros aún.</div>
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
    <li className="py-2 flex items-center justify-between">
      <div className="min-w-0 flex items-center gap-3">
        <Avatar name={name} src={avatarUrl} />
        <div className="min-w-0">
          <div className="font-medium truncate">{name}</div>
          <div className="text-xs text-gray-500">
            <span
              className={`inline-block rounded px-2 py-0.5 mr-2 ${badge.cls}`}
            >
              {badge.text}
            </span>
            <span className="font-mono">{m.userUuid}</span> · {joined}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex gap-2">
        {/* Expulsar solo a STUDENT */}
        {m.role === "STUDENT" && (
          <button
            className="rounded border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-60"
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
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border dark:border-gray-700"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full grid place-items-center bg-gray-200 text-gray-700 text-xs font-semibold border dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100">
      {initials || "?"}
    </div>
  );
}
