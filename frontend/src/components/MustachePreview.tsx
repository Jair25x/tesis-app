// src/components/MustachePreview.tsx

import mustache from "mustache";

interface MustachePreviewProps {
  template: string;
  parameters: Record<string, unknown>;
}

export default function MustachePreview({
  template,
  parameters,
}: MustachePreviewProps) {
  let rendered: string;

  try {
    rendered = mustache.render(template, parameters);
  } catch {
    rendered = "⚠️ Error al renderizar el enunciado.";
  }

  return (
    <div className="border rounded-md bg-gray-50 dark:bg-gray-700 p-4 mt-2 text-gray-800 dark:text-white">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
        Vista previa:
      </h3>
      <p className="text-base">{rendered}</p>
    </div>
  );
}
