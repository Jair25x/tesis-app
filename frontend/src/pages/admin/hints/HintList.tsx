import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getHints,
  deleteHint,
  reactivateHint,
} from "../../../services/hintService";

import { formatDate } from "../../../utils/formatDate";
import { cn } from "../../../utils/cn";
import { showToast } from "../../../utils/showToast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { Button } from "../../../components/ui/Button";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { HintResponse } from "../../../types/exercise/HintResponse";

export default function HintList() {
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

  const [hints, setHints] = useState<HintResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadHints = async () => {
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
      const data = await getHints(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        status
      );
      setHints(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando pistas:", err);
      setError("Ocurrió un error al cargar las pistas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHints();
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
        await deleteHint(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          selectedId
        );
        showToast.success("Pista desactivada correctamente.");
      } else {
        await reactivateHint(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          selectedId
        );
        showToast.success("Pista reactivada correctamente.");
      }
      await loadHints();
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
          Gestión de Pistas
        </h1>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/new`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">➕ Nueva Pista</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center sm:justify-start">
        {(["all", "active", "inactive"] as const).map((type) => (
          <button
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
              ? "Todas"
              : type === "active"
              ? "Activas"
              : "Inactivas"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando pistas...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : hints.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay pistas para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Texto
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Coste
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
              {hints.map((hint) => (
                <tr
                  key={hint.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3">{hint.hintText}</td>
                  <td className="p-3">{hint.cost}</td>
                  <td className="p-3">{formatDate(hint.createdAt)}</td>
                  <td className="p-3">
                    {hint.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activa
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center space-x-2">
                    {/* Ver detalles */}
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hint.id}/details`}
                        aria-label="Ver detalles"
                      >
                        <Eye className="inline h-5 w-5 text-blue-500 hover:text-blue-600" />
                      </Link>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver detalles
                      </span>
                    </div>
                    {/* Editar */}
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hint.id}/edit`}
                        aria-label="Editar"
                      >
                        <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                      </Link>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Editar
                      </span>
                    </div>
                    {/* Activar/Desactivar */}
                    {hint.active ? (
                      <div className="group relative inline-block">
                        <button
                          onClick={() => openModal(hint.id, "delete")}
                          aria-label="Desactivar"
                        >
                          <Trash2 className="inline h-5 w-5 text-red-500 hover:text-red-600" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Desactivar
                        </span>
                      </div>
                    ) : (
                      <div className="group relative inline-block">
                        <button
                          onClick={() => openModal(hint.id, "reactivate")}
                          aria-label="Reactivar"
                        >
                          <RotateCcw className="inline h-5 w-5 text-green-500 hover:text-green-600" />
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Reactivar
                        </span>
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
        title={
          modalAction === "delete" ? "Desactivar Pista" : "Reactivar Pista"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar esta pista?"
            : "¿Deseas reactivarla?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}
