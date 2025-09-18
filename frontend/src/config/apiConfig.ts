export const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ?? // por si en algún lugar quedó el viejo nombre
  "/api";
