// src/pages/admin/catalog/AllStandards.tsx
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CatalogFilterBar from "../../../components/admin/catalog/CatalogFilterBar";
import Pagination from "../../../components/admin/catalog/Pagination";
import { useCatalogStandards } from "../../../hooks/catalog/useCatalog";
import type { CatalogStandardDto } from "../../../types/curriculum/Catalog";

export default function AllStandards() {
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(20);
  const [sort, setSort] = useState<string>("name,asc");

  const params = useMemo(
    () => ({ q, page, size, sort }),
    [q, page, size, sort]
  );
  const { data, isLoading, isError } = useCatalogStandards(params);

  const rows: CatalogStandardDto[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const onSearch = useCallback((value: string) => {
    setPage(0);
    setQ(value);
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Catálogo: Estándares</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">Orden:</label>
          <select
            value={sort}
            onChange={(e) => {
              setPage(0);
              setSort(e.target.value);
            }}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b46] px-2 py-1 text-sm"
          >
            <option value="name,asc">Nombre (A→Z)</option>
            <option value="name,desc">Nombre (Z→A)</option>
            <option value="code,asc">Código (A→Z)</option>
            <option value="code,desc">Código (Z→A)</option>
            <option value="createdAt,desc">Más recientes</option>
            <option value="createdAt,asc">Más antiguos</option>
          </select>
        </div>
      </header>

      <CatalogFilterBar
        initialQ={q}
        onChange={onSearch}
        placeholder="Buscar por nombre, código o descripción..."
      />

      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {["Código", "Nombre", "Competencia", "Currículo", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-4">
                  Cargando…
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={5} className="p-4 text-red-500">
                  Error al cargar.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr
                key={s.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{s.code}</td>
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.competencyName}</td>
                <td className="p-3">{s.curriculumName}</td>
                <td className="p-3">
                  <Link
                    to={`/admin/curricula/${s.curriculumId}/competencies/${s.competencyId}/standards/${s.id}/details`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4">
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        size={size}
        totalPages={totalPages}
        onPageChange={setPage}
        onSizeChange={(n) => {
          setPage(0);
          setSize(n);
        }}
      />
    </div>
  );
}
