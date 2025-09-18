// src/utils/renderStatement.ts
import Mustache from "mustache";
import { sanitizeHtml } from "./sanitizeHtml";

export const renderStatement = (
  statement: string,
  parameters: Record<string, unknown>
): { __html: string } => {
  const html = statement ? Mustache.render(statement, parameters ?? {}) : "";
  return { __html: sanitizeHtml(html) };
};
