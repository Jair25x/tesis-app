// src/pages/admin/catalog/AllObjectives.tsx
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CatalogFilterBar from "../../../components/admin/catalog/CatalogFilterBar";
import Pagination from "../../../components/admin/catalog/Pagination";
import { useCatalogObjectives } from "../../../hooks/catalog/useCatalog";
import type { CatalogObjectiveDto } from "../../../types/curriculum/Catalog";

export default function AllObjectives() {
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(20);
  const [sort, setSort] = useState<string>("code,asc");

  const params = useMemo(
    () => ({ q, page, size, sort }),
    [q, page, size, sort]
  );
  const { data, isLoading, isError } = useCatalogObjectives(params);

  const rows: CatalogObjectiveDto[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const onSearch = useCallback((value: string) => {
    setPage(0);
    setQ(value);
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Catálogo: Objetivos de aprendizaje
        </h1>
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
              {[
                "Código",
                "Nombre",
                "Estándar",
                "Competencia",
                "Currículo",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-4">
                  Cargando…
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={6} className="p-4 text-red-500">
                  Error al cargar.
                </td>
              </tr>
            )}
            {rows.map((o) => (
              <tr
                key={o.id}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <td className="p-3">{o.code}</td>
                <td className="p-3 font-medium">{o.name}</td>
                <td className="p-3">{o.standardName}</td>
                <td className="p-3">{o.competencyName}</td>
                <td className="p-3">{o.curriculumName}</td>
                <td className="p-3">
                  <Link
                    to={`/admin/curricula/${o.curriculumId}/competencies/${o.competencyId}/standards/${o.standardId}/learning-objectives/${o.id}/details`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4">
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
