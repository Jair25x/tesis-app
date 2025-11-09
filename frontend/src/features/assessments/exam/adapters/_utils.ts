// _utils.ts
/**
 * Convierte cadenas como "47 305", "47,305" o "47305" a número.
 * Si no es un número estricto, retorna null.
 */
export function toNumberStrict(s: string): number | null {
  if (typeof s !== "string") return null;
  // normalizamos espacios y separadores de miles
  const t = s.trim().replace(/\s+/g, "").replace(/,/g, "");
  // acepta enteros o decimales con signo opcional
  if (!/^[-+]?\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/** Normaliza texto: lower, NFKC, quita espacios extra */
export function normalizeWords(s: string): string {
  return (s ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

/** Convierte un array mixto a números, usando 0 cuando no es parseable */
export function toNumberArrayLoose(arr: Array<string | number>): number[] {
  return arr.map((x) => {
    if (typeof x === "number" && Number.isFinite(x)) return x;
    if (typeof x === "string") {
      const n = toNumberStrict(x);
      return n ?? 0;
    }
    return 0;
  });
}
