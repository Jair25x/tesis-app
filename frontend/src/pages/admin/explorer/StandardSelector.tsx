import { useEffect, useState } from "react";
import {
  getStandards,
  reactivateStandard,
} from "../../../services/standardService";
import type { StandardResponse } from "../../../types/curriculum/StandardResponse";
import { useExplorerContext } from "./ExplorerContext";
import { Button } from "../../../components/ui/Button";
import { showToast } from "../../../utils/showToast";

export default function StandardSelector() {
  const {
    selectedCurriculum,
    selectedCompetency,
    selectedStandard,
    setSelectedStandard,
  } = useExplorerContext();

  const [standards, setStandards] = useState<StandardResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStandards = async () => {
      if (!selectedCurriculum || !selectedCompetency) return;
      setLoading(true);
      try {
        const res = await getStandards(
          selectedCurriculum.id,
          selectedCompetency.id,
          "all"
        );
        setStandards(res.data);
      } catch {
        showToast.error("Error al cargar los estándares.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandards();
  }, [selectedCurriculum, selectedCompetency]);

  const handleSelect = (standard: StandardResponse) => {
    if (!standard.active) return;
    setSelectedStandard(standard);
  };

  const handleReactivate = async (id: string) => {
    if (!selectedCurriculum || !selectedCompetency) return;
    try {
      await reactivateStandard(
        selectedCurriculum.id,
        selectedCompetency.id,
        id
      );
      showToast.success("Estándar reactivado.");
      const res = await getStandards(
        selectedCurriculum.id,
        selectedCompetency.id,
        "all"
      );
      setStandards(res.data);
    } catch {
      showToast.error("No se pudo reactivar el estándar.");
    }
  };

  if (!selectedCurriculum || !selectedCompetency) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">3️⃣ Estándares</h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : (
        <ul className="space-y-2">
          {standards.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay estándares registrados.
            </p>
          )}
          {standards.map((std) => (
            <li
              key={std.id}
              className="flex items-center justify-between border rounded p-2"
            >
              <button
                disabled={!std.active}
                className={`text-left flex-1 ${
                  selectedStandard?.id === std.id
                    ? "font-semibold text-blue-600"
                    : ""
                } ${!std.active ? "text-gray-400 line-through" : ""}`}
                onClick={() => handleSelect(std)}
              >
                {std.name}
              </button>

              {!std.active && (
                <Button
                  onClick={() => handleReactivate(std.id)}
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
