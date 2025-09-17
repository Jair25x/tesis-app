// src/utils/showToast.ts
import { toast } from "react-hot-toast";

/**
 * Utilidad centralizada para mostrar notificaciones estándar.
 */
/** Utilidad centralizada para mostrar notificaciones estándar. */
export const showToast = {
  success: (message: string) =>
    toast.success(message, { duration: 4000, position: "top-right" }),
  error: (message: string) =>
    toast.error(message, { duration: 5000, position: "top-right" }),
  info: (message: string) =>
    toast(message, { duration: 4000, position: "top-right" }),
  warning: (message: string) =>
    toast(message, { duration: 4500, position: "top-right" }),
};
