/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_INTERNAL_HEADERS?: string;
  readonly VITE_CHAT_STREAM?: string;
  readonly VITE_RECO_PREFETCH_ON_ATTEMPT?: string;
  readonly VITE_DUELS_ZERO_INDEX?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  readonly VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE?: string;
  readonly VITE_SENTRY_REPLAYS_ERROR_SAMPLE_RATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
