// src/pages/admin/explorer/CurriculumSelector.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllCurricula,
  reactivateCurriculum,
} from "../../../services/curriculumService";
import { type CurriculumResponse } from "../../../types/curriculum/Curriculum";
import { showToast } from "../../../utils/showToast";
import { Button } from "../../../components/ui/Button";
import { FiRefreshCcw, FiEdit2 } from "react-icons/fi";
import { useExplorerContext } from "./ExplorerContext";

export default function CurriculumSelector() {
  const {
    selectedCurriculum,
    setSelectedCurriculum,
    setSelectedCompetency,
    setSelectedStandard,
    setSelectedObjective,
  } = useExplorerContext();

  const [activeCurricula, setActiveCurricula] = useState<CurriculumResponse[]>(
    []
  );
  const [inactiveCurricula, setInactiveCurricula] = useState<
    CurriculumResponse[]
  >([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadCurricula = async () => {
    setLoading(true);
    try {
      const curricula = await getAllCurricula("all");
      setActiveCurricula(curricula.filter((c) => c.active));
      setInactiveCurricula(curricula.filter((c) => !c.active));
    } catch {
      showToast.error("Error al cargar currículos");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateCurriculum(id);
      showToast.success("Currículo reactivado correctamente");
      await loadCurricula();
    } catch {
      showToast.error("No se pudo reactivar el currículo");
    }
  };

  const handleSelect = (curriculum: CurriculumResponse) => {
    if (!curriculum.active) return;
    setSelectedCurriculum(curriculum);
    setSelectedCompetency(null);
    setSelectedStandard(null);
    setSelectedObjective(null);
  };

  useEffect(() => {
    loadCurricula();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">📚 Selecciona un Currículo</h2>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      ) : activeCurricula.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay currículos activos.
        </p>
      ) : (
        <div className="space-y-2">
          {activeCurricula.map((curriculum) => (
            <div
              key={curriculum.id}
              className={`flex items-center justify-between px-4 py-2 rounded-md border transition ${
                selectedCurriculum?.id === curriculum.id
                  ? "bg-green-500 text-white border-green-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
              }`}
              onClick={() => handleSelect(curriculum)}
            >
              <span className="truncate">{curriculum.name}</span>
              <Link
                to={`/admin/curricula/${curriculum.id}/edit`}
                onClick={(e) => e.stopPropagation()} // Prevenir selección
                className="ml-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                title="Editar currículo"
              >
                <FiEdit2 className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Currículos inactivos */}
      <div className="mt-4">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showInactive ? "Ocultar" : "Mostrar"} currículos inactivos (
          {inactiveCurricula.length})
        </button>

        {showInactive && inactiveCurricula.length > 0 && (
          <div className="mt-2 space-y-2">
            {inactiveCurricula.map((curriculum) => (
              <div
                key={curriculum.id}
                className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
              >
                <span className="truncate text-sm">{curriculum.name}</span>
                <Button
                  onClick={() => handleReactivate(curriculum.id)}
                  variant="outline"
                  className="flex items-center gap-1 text-sm"
                >
                  <FiRefreshCcw className="w-4 h-4" />
                  Reactivar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
