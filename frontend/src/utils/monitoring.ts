// src/utils/monitoring.ts
import * as Sentry from "@sentry/react";
import type { Span as SentrySpan } from "@sentry/types";

/** Type guard para spans con .end() */
function hasEndMethod(span: unknown): span is Pick<SentrySpan, "end"> {
  return (
    typeof span === "object" &&
    span !== null &&
    "end" in (span as Record<string, unknown>) &&
    typeof (span as { end?: unknown }).end === "function"
  );
}

/**
 * Inicializa Sentry de forma segura y configurable por .env
 * - Sin PII por defecto
 * - Performance (traces) y Replay controlados por sample rates
 */
export function initMonitoring(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // sin DSN no inicializamos (útil en dev)

  const env = import.meta.env.MODE; // "development" | "production"
  const tracesSampleRate = Number(
    import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0
  );
  const replaysSessionSampleRate = Number(
    import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? 0
  );
  const replaysErrorSampleRate = Number(
    import.meta.env.VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? 1
  );

  Sentry.init({
    dsn,
    environment: env,

    // 🟡 Performance (APM)
    tracesSampleRate,
    integrations: [
      Sentry.browserTracingIntegration(),

      // 🟣 Session Replay
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Control de muestreo de Replay (a nivel raíz)
    replaysSessionSampleRate,
    replaysOnErrorSampleRate: replaysErrorSampleRate,

    // 🔒 Sin PII por defecto (no envía emails, nombres, etc.)
    sendDefaultPii: false,
  });
}

/** Contexto de usuario sin PII (solo id y role como tag) */
export function setUserContext(user?: { id?: string | number; role?: string }): void {
  if (!user?.id) {
    Sentry.setUser(null);
  } else {
    Sentry.setUser({ id: String(user.id) });
  }
  if (user?.role) Sentry.setTag("role", user.role);
}

/** Tags de navegación/negocio (ruta activa, curriculum, etc.) */
export function setNavContext(ctx: { route?: string; curriculumId?: string }): void {
  if (ctx.route) Sentry.setTag("route", ctx.route);
  if (ctx.curriculumId) Sentry.setTag("curriculumId", ctx.curriculumId);
}

/**
 * Medición de acciones:
 *  a) Callback: te doy un finish() (cierra el span) dentro del callback
 *  b) Manual: devuelvo { finish } para cerrar cuando quieras
 */
export function startSpan(
  name: string,
  fn?: (finish: () => void) => void
): { finish: () => void } | void {
  if (fn) {
    return Sentry.startSpan({ name }, (span) => {
      const finish = () => {
        if (hasEndMethod(span)) span.end();
      };
      let finished = false;
      try {
        fn(() => {
          if (!finished) {
            finish();
            finished = true;
          }
        });
      } finally {
        if (!finished) finish();
      }
    });
  }

  // Modo manual: span inactivo (control total)
  const span = Sentry.startInactiveSpan({ name });
  const finish = () => {
    if (hasEndMethod(span)) span.end();
  };
  return { finish };
}
