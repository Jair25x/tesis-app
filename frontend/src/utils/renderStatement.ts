import Mustache from "mustache";

export const renderStatement = (
  statement: string,
  parameters: Record<string, unknown>
): string => (statement ? Mustache.render(statement, parameters ?? {}) : "");
