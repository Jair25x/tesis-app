// src/utils/monitoring.ts
import * as Sentry from "@sentry/react";

export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // si no hay DSN, no inicializamos (útil en dev sin Sentry)

  // Lee rates opcionales desde env (si no están, quedan en 0 → desactivado)
  const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0);
  const replaysSessionSampleRate = Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0);
  const replaysErrorSampleRate = Number(import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? 1);

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // "development", "production", etc.
    // Performance
    tracesSampleRate,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Replay (sin sampleRate aquí; se controla con las props raíz de abajo)
      Sentry.replayIntegration({
        // Flags útiles
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Replay sampling (RAÍZ)
    replaysSessionSampleRate,
    replaysOnErrorSampleRate: replaysErrorSampleRate,

    // PII (datos personales). Déjalo en false salvo que sepas por qué lo quieres.
    sendDefaultPii: false,
  });
}
