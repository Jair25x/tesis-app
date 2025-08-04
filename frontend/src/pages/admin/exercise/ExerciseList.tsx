import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getExercises,
  deleteExercise,
  reactivateExercise,
} from "../../../services/exerciseService";
import { formatDate } from "../../../utils/formatDate";
import { cn } from "../../../utils/cn";
import { showToast } from "../../../utils/showToast";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { Button } from "../../../components/ui/Button";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { ExerciseResponse } from "../../../types/exercise/ExerciseResponse";

export default function ExerciseList() {
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();

  const [exercises, setExercises] = useState<ExerciseResponse[]>([]);
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<
    "delete" | "reactivate" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadExercises = async () => {
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId)
      return;
    setLoading(true);
    try {
      const data = await getExercises(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        status
      );
      setExercises(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando ejercicios:", err);
      setError("Ocurrió un error al cargar los ejercicios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [status, curriculumId, competencyId, standardId, learningObjectiveId]);

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
      !learningObjectiveId
    )
      return;
    try {
      setModalLoading(true);
      if (modalAction === "delete") {
        await deleteExercise(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          selectedId
        );
        showToast.success("Ejercicio desactivado correctamente.");
      } else {
        await reactivateExercise(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          selectedId
        );
        showToast.success("Ejercicio reactivado correctamente.");
      }
      await loadExercises();
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
          Gestión de Ejercicios
        </h1>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/new`}
          className="w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">➕ Nuevo Ejercicio</Button>
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
          Cargando ejercicios...
        </p>
      ) : error ? (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      ) : exercises.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No hay ejercicios para mostrar.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md shadow-sm">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Tipo
                </th>
                <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                  Dificultad
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
              {exercises.map((ex) => (
                <tr
                  key={ex.id}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <td className="p-3">{ex.templateType}</td>
                  <td className="p-3">{ex.difficulty}</td>
                  <td className="p-3">{formatDate(ex.createdAt)}</td>
                  <td className="p-3">
                    {ex.active ? (
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
                    {/* Ver */}
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${ex.id}/details`}
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
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${ex.id}/edit`}
                        aria-label="Editar"
                      >
                        <Pencil className="inline h-5 w-5 text-yellow-500 hover:text-yellow-600" />
                      </Link>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Editar
                      </span>
                    </div>
                    {/* Ver pistas */}
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${ex.id}/hints`}
                        aria-label="Ver pistas"
                      >
                        <span className="inline-block px-1 py-0.5 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600">
                          Pistas
                        </span>
                      </Link>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver pistas
                      </span>
                    </div>

                    {/* Ver pasos */}
                    <div className="group relative inline-block">
                      <Link
                        to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${ex.id}/solution-steps`}
                        aria-label="Ver pasos"
                      >
                        <span className="inline-block px-1 py-0.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600">
                          Pasos
                        </span>
                      </Link>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver pasos
                      </span>
                    </div>

                    {/* Desactivar / Reactivar */}
                    {ex.active ? (
                      <div className="group relative inline-block">
                        <button
                          onClick={() => openModal(ex.id, "delete")}
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
                          onClick={() => openModal(ex.id, "reactivate")}
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
          modalAction === "delete"
            ? "Desactivar Ejercicio"
            : "Reactivar Ejercicio"
        }
        description={
          modalAction === "delete"
            ? "¿Estás seguro de que deseas desactivar este ejercicio?"
            : "¿Deseas reactivarlo?"
        }
        variant={modalAction === "delete" ? "danger" : "success"}
        isLoading={modalLoading}
      />
    </section>
  );
}
