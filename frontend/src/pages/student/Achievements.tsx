import React from "react";
import { useAchievements as useAchievementsQ } from "../../hooks/progress/useAchievements";
import { useAchievementsCatalog } from "../../hooks/progress/useAchievementsCatalog";

function CardUnlocked(props: {
  name: string;
  description?: string;
  earnedAt?: string;
}) {
  return (
    <div className="rounded-xl border bg-white dark:bg-gray-800 p-4 shadow">
      <div className="flex items-start gap-3">
        <div className="text-3xl" aria-hidden>
          🏅
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {props.name}
          </div>
          {props.description ? (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {props.description}
            </div>
          ) : null}
          {props.earnedAt ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Obtenido: {new Date(props.earnedAt).toLocaleString()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CardLocked(props: { name: string; description?: string }) {
  return (
    <div className="rounded-xl border bg-gray-100 dark:bg-gray-800/60 p-4 shadow relative overflow-hidden">
      <div
        className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-[1px]"
        aria-hidden
      />
      <div className="flex items-start gap-3 opacity-70">
        <div className="text-3xl" aria-hidden>
          🔒
        </div>
        <div>
          <div className="font-semibold text-gray-700 dark:text-gray-200">
            {props.name}
          </div>
          {props.description ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {props.description}
            </div>
          ) : null}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Aún no desbloqueado
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Achievements() {
  const {
    data: unlocked,
    isLoading: loadingUnlocked,
    isError: errorUnlocked,
  } = useAchievementsQ();
  const { data: catalog, isLoading: loadingCatalog } = useAchievementsCatalog();

  const unlockedSet = new Set((unlocked ?? []).map((a) => a.code));
  const locked = (catalog ?? []).filter((c) => !unlockedSet.has(c.code));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">🏅 Tus logros</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Completa ejercicios, mantén tu racha y desbloquea todos los logros.
      </p>

      {/* Desbloqueados */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Desbloqueados</h2>
          {loadingUnlocked ? null : (
            <div className="text-sm text-gray-500">
              {unlocked?.length ?? 0}{" "}
              {unlocked && unlocked.length === 1 ? "logro" : "logros"}
            </div>
          )}
        </div>

        {loadingUnlocked ? (
          <p>Cargando…</p>
        ) : errorUnlocked ? (
          <p className="text-sm text-red-500">No pudimos cargar tus logros.</p>
        ) : unlocked && unlocked.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.earnedAt).getTime() -
                  new Date(a.earnedAt).getTime()
              )
              .map((a) => (
                <CardUnlocked
                  key={`${a.code}:${a.earnedAt}`}
                  name={a.name}
                  description={a.description}
                  earnedAt={a.earnedAt}
                />
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aún no tienes logros. ¡Intenta tu primer ejercicio!
          </p>
        )}
      </section>

      {/* Bloqueados (solo si hay catálogo) */}
      {loadingCatalog ? null : catalog && catalog.length > 0 ? (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Por desbloquear</h2>
            <div className="text-sm text-gray-500">
              {locked.length} {locked.length === 1 ? "pendiente" : "pendientes"}
            </div>
          </div>

          {locked.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((a) => (
                <CardLocked
                  key={a.code}
                  name={a.name}
                  description={a.description}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¡Has desbloqueado todos los logros del catálogo!
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
