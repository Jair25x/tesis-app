import * as XLSX from "xlsx";

/**
 * Exporta un arreglo de objetos a un .xlsx de una sola hoja llamada "Overview".
 * rows: [{ col1: '...', col2: 123 }, ...]
 * filename: base sin extensión (se agrega .xlsx)
 */
export function exportOverviewToExcel(
  rows: Array<Record<string, string | number>>,
  filename: string
) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Overview");
  XLSX.writeFile(wb, `${filename}.xlsx`, { compression: true });
}
