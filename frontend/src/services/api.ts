// src/services/api.ts
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { showToast } from "../utils/showToast";
import type { JwtResponse } from "../types/user/JwtResponse";

/**
 * Resuelve el baseURL con compatibilidad hacia atrás:
 * - VITE_API_URL (nuevo) o VITE_API_BASE_URL (legacy)
 * - fallback "/api"
 */
export const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ?? // legacy
  "/api";

const baseURL = API_URL;

// Si quieres forzar cabeceras internas desde FE (útil en dev sin gateway)
const USE_INTERNAL =
  String(import.meta.env.VITE_USE_INTERNAL_HEADERS) === "true";

// 🔑 clave de storage usada por curriculumService
const CURR_STORAGE_KEY = "app:curriculumId";

// --- UUID seguro con fallback (para móviles / contextos sin Web Crypto) ---
function safeUUID(): string {
  try {
    if (typeof crypto !== "undefined" && (crypto as Crypto)?.randomUUID) {
      return (crypto as Crypto).randomUUID();
    }
  } catch {
    /* noop */
  }
  try {
    if (typeof crypto !== "undefined" && (crypto as Crypto)?.getRandomValues) {
      const arr = new Uint8Array(16);
      (crypto as Crypto).getRandomValues(arr);
      arr[6] = (arr[6] & 0x0f) | 0x40; // v4
      arr[8] = (arr[8] & 0x3f) | 0x80; // variant
      const toHex = (n: number) => n.toString(16).padStart(2, "0");
      const hex = Array.from(arr, toHex).join("");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
        12,
        16
      )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch {
    /* noop */
  }
  return `rid-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

// Cliente principal para toda la app
const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Cliente “crudo” (sin interceptores) solo para /auth/refresh-token
const raw = axios.create({
  baseURL,
  timeout: 15000,
});

// ---- Accessors inyectados por AuthProvider ----
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

export function readAccessToken(): string | null {
  return getAccessToken();
}

export function readBaseURL(): string {
  return baseURL;
}

// ---- Request: Authorization + headers internos + currículo activo ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers || {});
  const at = getAccessToken();

  if (at && !headers.get("Authorization")) {
    headers.set("Authorization", `Bearer ${at}`);
  }

  // Cabeceras internas (opcionales)
  if (USE_INTERNAL) {
    if (!headers.get("X-Request-Id")) headers.set("X-Request-Id", safeUUID());
    if (!headers.get("X-App-Version")) headers.set("X-App-Version", "web@1");
  } else {
    if (!headers.get("X-App-Version")) headers.set("X-App-Version", "web@1");
  }

  // 🔗 Curriculum scope (si existe)
  try {
    const currId = localStorage.getItem(CURR_STORAGE_KEY);
    if (currId && !headers.get("X-Curriculum-Id")) {
      headers.set("X-Curriculum-Id", currId);
    }
  } catch {
    /* noop */
  }

  // Negociación por defecto
  if (!headers.get("Accept")) headers.set("Accept", "application/json");

  // ⬇⬇⬇ IMPORTANTE:
  // - Si el body es FormData, NO establecer Content-Type (el navegador pone boundaries correctos)
  // - Si es JSON (POST/PUT/PATCH), forzar UTF-8
  const method = (config.method || "get").toUpperCase();
  const hasBody = ["POST", "PUT", "PATCH"].includes(method);
  if (hasBody) {
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (!isFormData) {
      const currentCT = String(headers.get("Content-Type") || "").toLowerCase();
      const isJson = currentCT.includes("application/json") || currentCT === "";
      if (isJson && !currentCT.includes("charset=utf-8")) {
        headers.set("Content-Type", "application/json; charset=utf-8");
      }
    }
  }

  config.headers = headers;
  return config;
});

// ---- Utils ----
function extractApiMessage(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message?: unknown }).message;
    return typeof m === "string" ? m : undefined;
  }
  return undefined;
}

// Acepta backends que devuelven token como `token` o `accessToken`
type RefreshResponse = JwtResponse & { accessToken?: string };

// ---- Refresh single-flight ----
let isRefreshing = false;
let waiters: Array<(newToken: string | null) => void> = [];

function flushWaiters(token: string | null) {
  waiters.forEach((w) => w(token));
  waiters = [];
}

async function doRefresh(rt: string): Promise<RefreshResponse> {
  const { data } = await raw.post<RefreshResponse>("/auth/refresh-token", {
    refreshToken: rt,
  });
  return data;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    // Network / timeout
    // (corremos ambos chequeos: code y message)
    if (error.code === "ECONNABORTED") {
      showToast.error("Tiempo de espera agotado. Intenta nuevamente.");
      return Promise.reject(error);
    }
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      showToast.error("Error de red. Verifica tu conexión.");
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Errores comunes (no-401)
    if (status && status !== 401) {
      if (status === 400) {
        const msg = extractApiMessage(error.response?.data);
        showToast.error(msg ?? "Petición inválida.");
      } else if (status === 403) {
        showToast.error("No tienes permiso para esta acción.");
      } else if (status === 404) {
        showToast.error("Recurso no encontrado.");
      } else if (status === 409) {
        const msg = extractApiMessage(error.response?.data);
        showToast.error(msg ?? "Conflicto en la operación.");
      } else if (status >= 500) {
        showToast.error("Error del servidor. Intenta más tarde.");
      }
      return Promise.reject(error);
    }

    // Si no es 401 o ya se reintentó, propaga
    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Evitar bucle en /auth/refresh-token
    if (original.url?.includes("/auth/refresh-token")) {
      onHardLogout?.();
      showToast.error("Sesión expirada. Vuelve a iniciar sesión.");
      return Promise.reject(error);
    }

    original._retry = true;

    const rt = getRefreshToken();
    if (!rt) {
      onHardLogout?.();
      showToast.error("Sesión expirada. Vuelve a iniciar sesión.");
      return Promise.reject(error);
    }

    // Single-flight
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
      const newAccess = data.accessToken ?? data.token;
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
      showToast.error("Sesión expirada. Vuelve a iniciar sesión.");
      return Promise.reject(e);
    }
  }
);

export default api;
