import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getLearningObjectiveById,
  deleteLearningObjective,
} from "../../../services/learningObjectiveService";
import type { LearningObjectiveResponse } from "../../../types/curriculum/LearningObjectiveResponse";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";
import { useLearningObjective } from "../../../context/useLearningObjective";

export default function LearningObjectiveDetails() {
  const { curriculumId, competencyId, standardId, learningObjectiveId } =
    useParams<{
      curriculumId: string;
      competencyId: string;
      standardId: string;
      learningObjectiveId: string;
    }>();
  const navigate = useNavigate();

  const { refreshLearningObjectives } = useLearningObjective();

  const [objective, setObjective] = useState<LearningObjectiveResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchObjective = async () => {
      if (
        !curriculumId ||
        !competencyId ||
        !standardId ||
        !learningObjectiveId
      ) {
        setError("Parámetros inválidos en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await getLearningObjectiveById(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId
        );
        setObjective(response);
      } catch (err) {
        console.error("Error al obtener el objetivo de aprendizaje:", err);
        setError("Ocurrió un error al cargar el objetivo.");
      } finally {
        setLoading(false);
      }
    };

    fetchObjective();
  }, [curriculumId, competencyId, standardId, learningObjectiveId]);

  const handleConfirmDelete = async () => {
    if (!curriculumId || !competencyId || !standardId || !learningObjectiveId)
      return;

    setConfirmLoading(true);
    try {
      await deleteLearningObjective(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId
      );
      await refreshLearningObjectives(curriculumId, competencyId, standardId);
      showToast.success("Objetivo de aprendizaje desactivado correctamente.");
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`
      );
    } catch (err) {
      console.error("Error al desactivar el objetivo:", err);
      showToast.error("Ocurrió un error al desactivar el objetivo.");
    } finally {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>{error}</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de objetivos
        </Link>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>No se encontró el objetivo de aprendizaje solicitado.</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de objetivos
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles del Objetivo de Aprendizaje
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${objective.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Editar
          </Link>
          {objective.active && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Desactivar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
        <Detail label="Nombre" value={objective.name} />
        <Detail label="Código" value={objective.code} />
        <Detail label="Descripción" value={objective.description || "—"} />
        <Detail
          label="Estado"
          value={
            objective.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-500 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(objective.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(objective.updatedAt)}
        </p>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de objetivos
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar objetivo?"
        description="¿Estás seguro de que deseas desactivar este objetivo? Esta acción no eliminará los datos, pero lo ocultará para los usuarios."
        isLoading={confirmLoading}
        variant="danger"
      />
    </section>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {label}:
      </span>{" "}
      <span className="text-gray-800 dark:text-gray-100">{value}</span>
    </p>
  );
}
