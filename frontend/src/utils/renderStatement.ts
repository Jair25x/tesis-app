import Mustache from "mustache";

export const renderStatement = (
  statement: string,
  pattern: string | null,
  parameters: Record<string, unknown>
): string => {
  return statement?.trim()
    ? statement
    : Mustache.render(pattern || "", parameters || {});
};
