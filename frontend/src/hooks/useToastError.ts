// src/hooks/useToastError.ts
import { useCallback } from "react";
import { showToast } from "../utils/showToast";

/**
 * Devuelve una función que:
 *  - Normaliza el error a un mensaje de string
 *  - (Opcional) setea el estado local del error
 *  - Muestra un toast de error
 */
export function useToastError(
  setError?: (msg: string | null) => void
): (err: unknown, fallback?: string) => void {
  return useCallback(
    (err: unknown, fallback = "Ocurrió un error.") => {
      let msg = fallback;
      if (err instanceof Error && err.message) msg = err.message;
      else if (typeof err === "string" && err.trim()) msg = err.trim();
      // Intenta extraer message de JSON serializado en err
      else {
        try {
          const parsed = JSON.parse(String(err));
          if (parsed?.message) msg = String(parsed.message);
        } catch {
          /* noop */
        }
      }
      setError?.(msg);
      showToast.error(msg);
    },
    [setError]
  );
}
