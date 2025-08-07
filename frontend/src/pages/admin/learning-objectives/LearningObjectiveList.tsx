// src/pages/admin/standards/LearningObjectiveList.tsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  deleteLearningObjective,
  reactivateLearningObjective,
  getLearningObjectives,
} from "../../../services/learningObjectiveService";
import { formatDate } from "../../../utils/formatDate";
import { Trash2, Pencil, Eye, RotateCcw, ListChecks } from "lucide-react";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { showToast } from "../../../utils/showToast";
import { cn } from "../../../utils/cn";
import { type LearningObjectiveResponse } from "../../../types/curriculum/LearningObjectiveResponse";
import { Button } from "../../../components/ui/Button";
import BackLink from "../../../components/ui/BackLink";

export default function LearningObjectiveList() {
  const { curriculumId, competencyId, standardId } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
  }>();

  const [learningObjectives, setLearningObjectives] = useState<
    LearningObjectiveResponse[]
  >([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadObjectives = async () => {
    if (!curriculumId || !competencyId || !standardId) return;
    setLoading(true);
    try {
      const res = await getLearningObjectives(
        curriculumId,
        competencyId,
        standardId,
        status
      );
      setLearningObjectives(res);
      setError(null);
    } catch (err) {
      console.error("Error al obtener objetivos:", err);
      setError("Ocurrió un error al cargar los objetivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjectives();
  }, [status]);

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
      !standardId
    )
      return;
    try {
      setModalLoading(true);
      if (modalAction === "delete") {
        await deleteLearningObjective(
          curriculumId,
          competencyId,
          standardId,
          selectedId
        );
        showToast.success("Objetivo desactivado correctamente.");
      } else {
        await reactivateLearningObjective(
          curriculumId,
          competencyId,
          standardId,
          selectedId
        );
        showToast.success("Objetivo reactivado correctamente.");
      }
      await loadObjectives();
    } catch (err) {
      console.error("Error ejecutando acción:", err);
      showToast.error("Ocurrió un error al realizar la acción.");
    } finally {
      setModalLoading(false);
      setShowModal(false);
    }
  };

  return (
    <section className="p-6 md:p-8">
      <BackLink
        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards`}
        label="Volver al listado de Estándares"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-white text-center sm:text-left w-full sm:w-auto">
          Gestión de Objetivos de Aprendizaje
        </h1>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/new`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">➕ Nuevo Objetivo</Button>
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
              ? "Todos"
              : type === "active"
              ? "Activos"
              : "Inactivos"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Cargando...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : learningObjectives.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay objetivos para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Nombre
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Código
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Creación
                </th>
                <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Estado
                </th>
                <th className="text-center p-3 font-semibold text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {learningObjectives.map((lo) => (
                <tr
                  key={lo.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3">{lo.name}</td>
                  <td className="p-3">{lo.code}</td>
                  <td className="p-3">{formatDate(lo.createdAt)}</td>
                  <td className="p-3">
                    {lo.active ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <TooltipIcon
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${lo.id}/details`}
                        label="Ver detalles"
                      >
                        <Eye className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                      </TooltipIcon>

                      <TooltipIcon
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${lo.id}/edit`}
                        label="Editar objetivo"
                      >
                        <Pencil className="h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                      </TooltipIcon>

                      <TooltipIcon
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${lo.id}/exercises`}
                        label="Ver ejercicios"
                      >
                        <ListChecks className="h-5 w-5 text-purple-500 hover:text-purple-600" />
                      </TooltipIcon>

                      <TooltipButton
                        onClick={() =>
                          openModal(lo.id, lo.active ? "delete" : "reactivate")
                        }
                        label={lo.active ? "Desactivar" : "Reactivar"}
                      >
                        {lo.active ? (
                          <Trash2 className="h-5 w-5 text-red-500 hover:text-red-600" />
                        ) : (
                          <RotateCcw className="h-5 w-5 text-green-500 hover:text-green-600" />
                        )}
                      </TooltipButton>
                    </div>
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
          modalAction === "delete"
            ? "Desactivar Objetivo de Aprendizaje"
            : "Reactivar Objetivo de Aprendizaje"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar este objetivo?"
            : "¿Deseas reactivarlo?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}

function TooltipIcon({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative inline-block">
      <Link to={to} className="inline-block">
        {children}
      </Link>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {label}
      </span>
    </div>
  );
}

function TooltipButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative inline-block">
      <button onClick={onClick} className="inline-block">
        {children}
      </button>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        {label}
      </span>
    </div>
  );
}
