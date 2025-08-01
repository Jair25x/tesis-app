// src/pages/admin/explorer/CompetencySelector.tsx
import { useEffect, useState } from "react";
import {
  getCompetenciesByCurriculum,
  reactivateCompetency,
} from "../../../services/competencyService";
import type { CompetencyResponse } from "../../../types/curriculum/Competency";
import { useExplorerContext } from "./ExplorerContext";
import { Button } from "../../../components/ui/Button";
import { showToast } from "../../../utils/showToast";

export default function CompetencySelector() {
  const { selectedCurriculum, selectedCompetency, setSelectedCompetency } =
    useExplorerContext();
  const [competencies, setCompetencies] = useState<CompetencyResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompetencies = async () => {
      if (!selectedCurriculum) return;
      setLoading(true);
      try {
        const data = await getCompetenciesByCurriculum(
          selectedCurriculum.id,
          "all"
        );
        setCompetencies(data);
      } catch {
        showToast.error("Error al cargar las competencias.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetencies();
  }, [selectedCurriculum]);

  const handleSelect = (competency: CompetencyResponse) => {
    if (!competency.active) return;
    setSelectedCompetency(competency);
  };

  const handleReactivate = async (id: string) => {
    try {
      if (!selectedCurriculum) return;
      await reactivateCompetency(selectedCurriculum.id, id);
      showToast.success("Competencia reactivada.");
      const updated = await getCompetenciesByCurriculum(
        selectedCurriculum.id,
        "all"
      );
      setCompetencies(updated);
    } catch {
      showToast.error("No se pudo reactivar la competencia.");
    }
  };

  if (!selectedCurriculum) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">2️⃣ Competencias</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : (
        <ul className="space-y-2">
          {competencies.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay competencias registradas.
            </p>
          )}
          {competencies.map((comp) => (
            <li
              key={comp.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <button
                disabled={!comp.active}
                className={`text-left flex-1 ${
                  selectedCompetency?.id === comp.id
                    ? "font-semibold text-blue-600"
                    : ""
                } ${!comp.active ? "text-gray-400 line-through" : ""}`}
                onClick={() => handleSelect(comp)}
              >
                {comp.name}
              </button>

              {!comp.active && (
                <Button
                  onClick={() => handleReactivate(comp.id)}
                  variant="outline"
                  className="ml-2 text-xs"
                >
                  Reactivar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
