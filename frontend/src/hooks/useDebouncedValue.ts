// src/hooks/useDebouncedValue.ts
import { useEffect, useState } from "react";

/**
 * Devuelve el valor "debounced" después de `delayMs`.
 * Útil para inputs de búsqueda sin disparar renders costosos.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
