import { useState } from "react";
import {
  useActiveJoinCode,
  useGenerateJoinCodeMutation,
  useRevokeJoinCodeMutation,
} from "../../hooks/classroom/useJoinCode";
import LoadingScreen from "../LoadingScreen";

function formatTTL(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expirado";
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return h ? `expira en ${h}h ${rem}m` : `expira en ${rem}m`;
}

interface ClassroomJoinCodeTabProps {
  classroomId: string;
}

export default function ClassroomJoinCodeTab({
  classroomId,
}: ClassroomJoinCodeTabProps) {
  const { data, isLoading } = useActiveJoinCode(classroomId);
  const genMu = useGenerateJoinCodeMutation(classroomId);
  const revokeMu = useRevokeJoinCodeMutation(classroomId);

  const [ttl, setTtl] = useState<number>(60);
  const [maxUses, setMaxUses] = useState<number | "">("");

  if (isLoading) return <LoadingScreen />;

  const handleCopy = () => {
    if (!data?.code) return;
    void navigator.clipboard.writeText(data.code);
  };

  const handleGenerate = () => {
    genMu.mutate({
      ttlMinutes: ttl,
      maxUses: maxUses === "" ? null : maxUses,
    });
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Código de ingreso
        </h2>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
          Genera un código para que tus estudiantes se unan al aula sin que
          tengas que registrarlos manualmente.
        </p>
      </div>

      {/* Código activo */}
      <div className="mb-4 rounded-xl border bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800/60 sm:p-4">
        {data ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Código activo
              </div>
              <div className="flex items-baseline gap-2">
                <span className="rounded-lg bg-white px-3 py-1 font-mono text-lg tracking-widest shadow-sm dark:bg-gray-900">
                  {data.code}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTTL(data.expiresAt)} · usos: {data.usedCount}
                {typeof data.remainingUses === "number"
                  ? ` / quedan ${data.remainingUses}`
                  : " / ilimitados"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                onClick={handleCopy}
              >
                Copiar código
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-600 dark:text-rose-100 dark:hover:bg-rose-950/50"
                onClick={() => revokeMu.mutate()}
                disabled={revokeMu.isPending}
              >
                {revokeMu.isPending ? "Revocando…" : "Revocar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No hay código activo. Genera uno nuevo para compartir con tus
            estudiantes.
          </div>
        )}
      </div>

      {/* Generar / reemplazar */}
      <div className="border-t pt-3 text-sm dark:border-gray-700 sm:pt-4">
        <div className="mb-2 font-semibold text-gray-900 dark:text-white">
          Generar o reemplazar código
        </div>
        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col text-sm">
            <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
              Duración (minutos)
            </span>
            <input
              className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white sm:w-28"
              type="number"
              min={5}
              value={ttl}
              onChange={(e) => setTtl(Number(e.target.value) || 5)}
            />
            <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Mínimo 5 minutos.
            </span>
          </label>

          <label className="flex flex-col text-sm">
            <span className="mb-1 text-xs text-gray-700 dark:text-gray-200">
              Máx. usos (vacío = ilimitado)
            </span>
            <input
              className="w-full rounded-lg border px-2 py-1 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white sm:w-32"
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) =>
                setMaxUses(
                  e.target.value === "" ? "" : Number(e.target.value) || 1
                )
              }
            />
            <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Controla cuántas veces se puede usar.
            </span>
          </label>

          <button
            type="button"
            className="mt-1 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
            onClick={handleGenerate}
            disabled={genMu.isPending || ttl < 5}
          >
            {genMu.isPending ? "Generando…" : "Generar / Reemplazar"}
          </button>
        </div>
      </div>
    </div>
  );
}
