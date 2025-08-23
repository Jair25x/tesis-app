// src/components/teacher/ClassroomJoinCodeTab.tsx

import { useState } from "react";
import {
  useActiveJoinCode,
  useGenerateJoinCodeMutation,
  useRevokeJoinCodeMutation,
} from "../../hooks/classroom/useJoinCode";
import LoadingScreen from "../LoadingScreen";

function formatTTL(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirado";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h ? `expira en ${h}h ${rem}m` : `expira en ${rem}m`;
}

export default function ClassroomJoinCodeTab({
  classroomId,
}: {
  classroomId: string;
}) {
  const { data, isLoading } = useActiveJoinCode(classroomId);
  const genMu = useGenerateJoinCodeMutation(classroomId);
  const revokeMu = useRevokeJoinCodeMutation(classroomId);
  const [ttl, setTtl] = useState(60);
  const [maxUses, setMaxUses] = useState<number | "">("");

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="border rounded p-3 space-y-3 dark:border-gray-700">
      {data ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">
              <span className="font-semibold">Código:</span>{" "}
              <span className="font-mono">{data.code}</span>
            </div>
            <div className="text-xs text-gray-500">
              {formatTTL(data.expiresAt)} · usos: {data.usedCount}
              {typeof data.remainingUses === "number"
                ? ` / quedan ${data.remainingUses}`
                : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded border px-2 py-1"
              onClick={() => navigator.clipboard.writeText(data.code)}
            >
              Copiar
            </button>
            <button
              className="rounded border px-2 py-1"
              onClick={() => revokeMu.mutate()}
            >
              Revocar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">No hay código activo.</div>
      )}

      <div className="pt-2 border-t dark:border-gray-700">
        <div className="text-sm font-semibold mb-2">Generar/Reemplazar</div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs mb-1">TTL (min)</span>
            <input
              className="border rounded px-2 py-1 w-24"
              type="number"
              min={5}
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            <span className="block text-xs mb-1">
              Max usos (vacío = ilimitado)
            </span>
            <input
              className="border rounded px-2 py-1 w-32"
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) =>
                setMaxUses(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </label>
          <button
            className="rounded bg-blue-600 text-white px-3 py-1.5"
            onClick={() =>
              genMu.mutate({
                ttlMinutes: ttl,
                maxUses: maxUses === "" ? null : maxUses,
              })
            }
          >
            Generar/Reemplazar
          </button>
        </div>
      </div>
    </div>
  );
}
