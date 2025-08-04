import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSolutionSteps,
  deleteSolutionStep,
  reactivateSolutionStep,
} from "../../../services/solutionStepService";

import { formatDate } from "../../../utils/formatDate";
import { cn } from "../../../utils/cn";
import { showToast } from "../../../utils/showToast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { Button } from "../../../components/ui/Button";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { SolutionStepResponse } from "../../../types/exercise/SolutionStepResponse";

export default function SolutionStepList() {
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
  }>();

  const [steps, setSteps] = useState<SolutionStepResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadSolutionSteps = async () => {
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId
    )
      return;

    setLoading(true);
    try {
      const includeAll = status === "all";
      const data = await getSolutionSteps(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        includeAll
      );

      // Si el usuario quiere ver solo activos o inactivos, filtramos manualmente
      const filtered =
        status === "active"
          ? data.filter((s) => s.active)
          : status === "inactive"
          ? data.filter((s) => !s.active)
          : data;

      setSteps(filtered);
      setError(null);
    } catch (err) {
      console.error("Error cargando pasos:", err);
      setError("Ocurrió un error al cargar los pasos de solución.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolutionSteps();
  }, [
    status,
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
  ]);

  const openModal = (id: string, action: "delete" | "reactivate") => {
    setSelectedId(id);
    setModalAction(action);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (
      !selectedId ||
      !modalAction ||
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId
    )
      return;

    try {
      setModalLoading(true);
      if (modalAction === "delete") {
        await deleteSolutionStep(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          selectedId
        );
        showToast.success("Paso de solución desactivado correctamente.");
      } else {
        await reactivateSolutionStep(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          selectedId
        );
        showToast.success("Paso de solución reactivado correctamente.");
      }
      await loadSolutionSteps();
    } catch (err) {
      console.error("Error al realizar la acción:", err);
      showToast.error("Ocurrió un error al realizar la acción.");
    } finally {
      setModalLoading(false);
      setShowModal(false);
      setSelectedId(null);
      setModalAction(null);
    }
  };

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-center sm:text-left w-full sm:w-auto">
          Gestión de Pasos de Solución
        </h1>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/new`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">➕ Nuevo Paso</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
            type="button"
            key={type}
            onClick={() => setStatus(type)}
            className={cn(
              "px-3 py-1 rounded text-sm transition",
              status === type
                ? {
                    all: "bg-blue-600 text-white",
                    active: "bg-green-600 text-white",
                    inactive: "bg-red-600 text-white",
                  }[type]
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            )}
          >
            {type === "all"
              ? "Todos"
              : type === "active"
              ? "Activos"
              : "Inactivos"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando pasos...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : steps.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay pasos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Paso
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Explicación
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Creación
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => (
                <tr
                  key={step.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3 font-semibold">{step.stepNumber}</td>
                  <td className="p-3">{step.explanation}</td>
                  <td className="p-3">{formatDate(step.createdAt)}</td>
                  <td className="p-3">
                    {step.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${step.id}/details`}
                        aria-label="Ver detalles"
                      >
                        <Eye className="inline h-5 w-5 text-blue-500 hover:text-blue-600" />
                      </Link>
                      <span className="tooltip">Ver detalles</span>
                    </div>

                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${step.id}/edit`}
                        aria-label="Editar"
                      >
                        <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                      </Link>
                      <span className="tooltip">Editar</span>
                    </div>

                    {step.active ? (
                      <div className="group relative inline-block">
                        <button
                          onClick={() => openModal(step.id, "delete")}
                          aria-label="Desactivar"
                        >
                          <Trash2 className="inline h-5 w-5 text-red-500 hover:text-red-600" />
                        </button>
                        <span className="tooltip">Desactivar</span>
                      </div>
                    ) : (
                      <div className="group relative inline-block">
                        <button
                          onClick={() => openModal(step.id, "reactivate")}
                          aria-label="Reactivar"
                        >
                          <RotateCcw className="inline h-5 w-5 text-green-500 hover:text-green-600" />
                        </button>
                        <span className="tooltip">Reactivar</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title={modalAction === "delete" ? "Desactivar Paso" : "Reactivar Paso"}
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar este paso de solución?"
            : "¿Deseas reactivarlo?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}
