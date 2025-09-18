// src/utils/sanitizeHtml.ts
import DOMPurify, { type Config } from "dompurify";

/**
 * Config defensiva y compatible con los tipos actuales:
 * - FORBID_TAGS: elimina nodos peligrosos
 * - ALLOW_DATA_ATTR: false (no aceptar data-* arbitrarios)
 * Omitimos FORBID_ATTR/ALLOWED_URI_REGEXP para evitar inconsistencias de tipos;
 * DOMPurify ya elimina on* y esquemas peligrosos por defecto.
 */
const PURIFY_CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ["script", "iframe", "object", "embed", "link", "meta", "style"],
  ALLOW_DATA_ATTR: false,
};

// Endurecemos enlaces que abren en nueva pestaña y limpiamos "javascript:" en href
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  // `node` puede ser Element/ChildNode; protegemos con guards seguros
  if (!("getAttribute" in node) || !("setAttribute" in node)) return;

  const el = node as Element;
  const tag = el.tagName?.toLowerCase?.();
  if (tag !== "a") return;

  const href = (el.getAttribute("href") || "").trim().toLowerCase();
  if (href.startsWith("javascript:")) el.removeAttribute("href");

  if (el.getAttribute("target") === "_blank") {
    const rel = (el.getAttribute("rel") || "").toLowerCase();
    const relSet = new Set(rel.split(/\s+/).filter(Boolean));
    relSet.add("noopener");
    relSet.add("noreferrer");
    el.setAttribute("rel", Array.from(relSet).join(" "));
  }
});

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";
  return DOMPurify.sanitize(dirtyHtml, PURIFY_CONFIG);
}
