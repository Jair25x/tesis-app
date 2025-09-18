// src/pages/admin/catalog/AllExercises.tsx
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CatalogFilterBar from "../../../components/admin/catalog/CatalogFilterBar";
import Pagination from "../../../components/admin/catalog/Pagination";
import { useCatalogExercises } from "../../../hooks/catalog/useCatalog";
import type { CatalogExerciseDto } from "../../../types/curriculum/Catalog";
import type { Difficulty } from "../../../types/exercise/Difficulty";

const difficultyOptions: Array<{ value: Difficulty | ""; label: string }> = [
  { value: "", label: "Todas" },
  { value: "BASIC", label: "Básico" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" },
];

export default function AllExercises() {
  const [q, setQ] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(20);
  const [sort, setSort] = useState<string>("createdAt,desc");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");

  const params = useMemo(
    () => ({ q, page, size, sort, difficulty: difficulty || undefined }),
    [q, page, size, sort, difficulty]
  );
  const { data, isLoading, isError } = useCatalogExercises(params);

  const rows: CatalogExerciseDto[] = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  const onSearch = useCallback((value: string) => {
    setPage(0);
    setQ(value);
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Catálogo: Ejercicios</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">Dificultad:</label>
          <select
            value={difficulty}
            onChange={(e) => {
              setPage(0);
              setDifficulty(e.target.value as Difficulty | "");
            }}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b46] px-2 py-1 text-sm"
          >
            {difficultyOptions.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label className="text-sm ml-3">Orden:</label>
          <select
            value={sort}
            onChange={(e) => {
              setPage(0);
              setSort(e.target.value);
            }}
            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2d3b46] px-2 py-1 text-sm"
          >
            <option value="createdAt,desc">Más recientes</option>
            <option value="createdAt,asc">Más antiguos</option>
            <option value="difficulty,asc">Dificultad (asc)</option>
            <option value="difficulty,desc">Dificultad (desc)</option>
            <option value="type,asc">Tipo (A→Z)</option>
            <option value="type,desc">Tipo (Z→A)</option>
          </select>
        </div>
      </header>

      <CatalogFilterBar
        initialQ={q}
        onChange={onSearch}
        placeholder="Buscar por enunciado (statement) o tipo..."
      />

      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {[
                "Tipo",
                "Dificultad",
                "Objetivo",
                "Estándar",
                "Competencia",
                "Currículo",
                "Enunciado (preview)",
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
                <td colSpan={8} className="p-4">
                  Cargando…
                </td>
              </tr>
            )}
            {isError && !isLoading && (
              <tr>
                <td colSpan={8} className="p-4 text-red-500">
                  Error al cargar.
                </td>
              </tr>
            )}
            {rows.map((e) => (
              <tr
                key={e.id}
                className="border-t border-gray-200 dark:border-gray-700 align-top"
              >
                <td className="p-3">{e.type}</td>
                <td className="p-3">{e.difficulty}</td>
                <td className="p-3">{e.objectiveName}</td>
                <td className="p-3">{e.standardName}</td>
                <td className="p-3">{e.competencyName}</td>
                <td className="p-3">{e.curriculumName}</td>
                <td className="p-3">{e.statementPreview}</td>
                <td className="p-3">
                  <Link
                    to={`/admin/curricula/${e.curriculumId}/competencies/${e.competencyId}/standards/${e.standardId}/learning-objectives/${e.objectiveId}/exercises/${e.id}/details`}
                    className="text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4">
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
