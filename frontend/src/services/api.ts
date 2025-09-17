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

// 🔑 clave de storage usada por curriculumService
const CURR_STORAGE_KEY = "app:curriculumId";

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

  // Envia cabeceras internas si corresponden
  if (USE_INTERNAL) {
    if (!headers.get("X-Request-Id"))
      headers.set("X-Request-Id", crypto.randomUUID());
    if (!headers.get("X-App-Version")) headers.set("X-App-Version", "web@1");
  } else {
    // Aun sin USE_INTERNAL, es útil mandar versión de la app (opcional)
    if (!headers.get("X-App-Version")) headers.set("X-App-Version", "web@1");
  }

  // 🔗 Curriculum scope: si hay uno seleccionado, adjúntalo SIEMPRE
  try {
    const currId = localStorage.getItem(CURR_STORAGE_KEY);
    if (currId && !headers.get("X-Curriculum-Id")) {
      headers.set("X-Curriculum-Id", currId);
    }
  } catch {
    // noop
  }

  // Mejor negociación por defecto
  if (!headers.get("Accept")) headers.set("Accept", "application/json");

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
    if (error.code === "ECONNABORTED") {
      showToast.error("Tiempo de espera agotado. Intenta nuevamente.");
      return Promise.reject(error);
    }
    if (error.message === "Network Error") {
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
