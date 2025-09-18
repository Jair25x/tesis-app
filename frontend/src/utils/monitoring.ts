import * as Sentry from "@sentry/react";

export function initMonitoring() {
  if (import.meta.env.MODE !== "production") return;
  if (!import.meta.env.VITE_SENTRY_DSN) return;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1, // ajusta según presupuesto
  });
}
