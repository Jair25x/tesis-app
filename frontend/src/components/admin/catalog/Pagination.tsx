// src/components/admin/catalog/Pagination.tsx
interface Props {
  page: number; // 0-based
  size: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  size,
  totalPages,
  onPageChange,
  onSizeChange,
}: Props) {
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          ← Anterior
        </button>
        <span className="text-sm">
          Página <b>{page + 1}</b> de <b>{Math.max(totalPages, 1)}</b>
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente →
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Filas:</span>
        <select
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b46] px-2 py-1 text-sm"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
