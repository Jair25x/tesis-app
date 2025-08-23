// src/services/api.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { showToast } from "../utils/showToast";
import type { JwtResponse } from "../types/user/JwtResponse";

const baseURL = import.meta.env.VITE_API_URL ?? "/api";
const USE_INTERNAL =
  String(import.meta.env.VITE_USE_INTERNAL_HEADERS) === "true";

// Cliente principal para toda la app
const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Cliente “crudo” (sin interceptores) solo para /auth/refresh-token
const raw = axios.create({
  baseURL,
  timeout: 10000,
});

// ---- Accessors que nos “inyecta” el AuthProvider ----
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let setTokens: (t: {
  accessToken: string;
  refreshToken?: string;
}) => void = () => {};
let onHardLogout: () => void = () => {};

export function bindAuthTokenAccessors(opts: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (t: { accessToken: string; refreshToken?: string }) => void;
  onHardLogout?: () => void;
}) {
  getAccessToken = opts.getAccessToken;
  getRefreshToken = opts.getRefreshToken;
  setTokens = opts.setTokens;
  if (opts.onHardLogout) onHardLogout = opts.onHardLogout;
}

// ---- Request: añade Authorization + headers internos opcionales ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers || {});
  const at = getAccessToken();

  if (at && !headers.get("Authorization")) {
    headers.set("Authorization", `Bearer ${at}`);
  }

  if (USE_INTERNAL) {
    // Idempotente: sólo si no existen
    if (!headers.get("X-Request-Id"))
      headers.set("X-Request-Id", crypto.randomUUID());
    if (!headers.get("X-App-Version")) headers.set("X-App-Version", "web@1");
  }

  config.headers = headers;
  return config;
});

// ---- Util para extraer mensaje del backend sin "any" ----
function extractApiMessage(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message?: unknown }).message;
    return typeof m === "string" ? m : undefined;
  }
  return undefined;
}

// ---- Response: refresh single-flight ----
let isRefreshing = false;
let waiters: Array<(newToken: string | null) => void> = [];

function flushWaiters(token: string | null) {
  waiters.forEach((w) => w(token));
  waiters = [];
}

// Acepta backends que devuelven token como `token` o `accessToken`
type RefreshResponse = JwtResponse & { accessToken?: string };

async function doRefresh(rt: string): Promise<RefreshResponse> {
  const { data } = await raw.post<RefreshResponse>("/auth/refresh-token", {
    refreshToken: rt,
  });
  return data;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Errores comunes (403/503/409)
    if (status && status !== 401) {
      if (status === 403) {
        showToast.error("No tienes permiso para esta acción.");
      } else if (status === 503) {
        showToast.error("Servicio no disponible. Intenta de nuevo.");
      } else if (status === 409) {
        const msg = extractApiMessage(error.response?.data);
        showToast.error(msg ?? "Conflicto en la operación.");
      }
      return Promise.reject(error);
    }

    // Si no es 401 o ya se reintentó, propaga
    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Evitar bucle en /auth/refresh-token
    if (original.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    original._retry = true;

    const rt = getRefreshToken();
    if (!rt) {
      onHardLogout?.();
      return Promise.reject(error);
    }

    // Single-flight: cuelga hasta que termine el refresh en curso
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((newToken) => {
          if (!newToken) return reject(error);
          original.headers = {
            ...(original.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const data = await doRefresh(rt);
      const newAccess = data.accessToken ?? data.token; // compat token|accessToken
      const newRefresh = data.refreshToken;

      setTokens({ accessToken: newAccess, refreshToken: newRefresh });
      isRefreshing = false;
      flushWaiters(newAccess);

      original.headers = {
        ...(original.headers || {}),
        Authorization: `Bearer ${newAccess}`,
      };
      return api(original);
    } catch (e) {
      isRefreshing = false;
      flushWaiters(null);
      onHardLogout?.();
      return Promise.reject(e);
    }
  }
);

export default api;
