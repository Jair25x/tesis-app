// src/services/api.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { showToast } from "../utils/showToast";

const baseURL = import.meta.env.VITE_API_URL ?? "/api"; // <-- usa VITE_API_URL
const api = axios.create({
  baseURL,
  timeout: 7000, // 7s razonable en FE
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers || {});

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // 🚫 No enviar headers internos desde el FE
  // (X-Internal-Call, x-user-id, X-Auth-*)
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch { /* empty */ }
      if (!location.pathname.startsWith("/login")) {
        location.replace("/login");
      }
    } else if (status === 403) {
      showToast.error("No tienes permiso para esta acción.");
    } else if (status === 503) {
      showToast.error("Servicio no disponible. Intenta de nuevo.");
    }
    return Promise.reject(err);
  }
);

export default api;
