// src/utils/exportToCsv.ts
export function exportToCSV(
  rows: Array<Record<string, unknown>>,
  filename: string
) {
  if (!rows.length) {
    const blob = new Blob([""], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, `${filename}.csv`);
    return;
  }

  const headers = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set())
  );

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    // Escapa comillas dobles y envuelve en comillas si tiene separador o salto de línea
    const needsQuotes = s.includes(",") || s.includes("\n") || s.includes('"');
    const esc = s.replace(/"/g, '""');
    return needsQuotes ? `"${esc}"` : esc;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  triggerDownload(blob, `${filename}.csv`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
