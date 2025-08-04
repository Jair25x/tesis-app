import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getSolutionStepById,
  deleteSolutionStep,
} from "../../../services/solutionStepService";
import type { SolutionStepResponse } from "../../../types/exercise/SolutionStepResponse";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";

export default function SolutionStepDetails() {
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    stepId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
    stepId: string;
  }>();

  const navigate = useNavigate();

  const [step, setStep] = useState<SolutionStepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchStep = async () => {
      if (
        !curriculumId ||
        !competencyId ||
        !standardId ||
        !learningObjectiveId ||
        !exerciseId ||
        !stepId
      ) {
        setError("Parámetros inválidos en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await getSolutionStepById(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          stepId
        );
        if (!response) {
          setError("No se encontró el paso de solución.");
        } else {
          setStep(response);
        }
      } catch {
        setError("Ocurrió un error al cargar el paso de solución.");
      } finally {
        setLoading(false);
      }
    };

    fetchStep();
  }, [
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    stepId,
  ]);

  const handleConfirmDelete = async () => {
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId ||
      !stepId
    )
      return;

    setConfirmLoading(true);
    try {
      await deleteSolutionStep(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        stepId
      );
      showToast.success("Paso de solución desactivado correctamente.");
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`
      );
    } catch {
      showToast.error("Ocurrió un error al desactivar el paso de solución.");
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
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de pasos
        </Link>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>No se encontró el paso solicitado.</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de pasos
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles del Paso de Solución
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps/${step.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Editar
          </Link>
          {step.active && (
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
        <Detail label="Número de paso">{step.stepNumber}</Detail>
        <Detail label="Explicación">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {step.explanation}
          </pre>
        </Detail>
        <Detail
          label="Estado"
          value={
            step.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-500 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(step.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(step.updatedAt)}
        </p>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/solution-steps`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de pasos
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar paso de solución?"
        description="¿Estás seguro de que deseas desactivar este paso de solución? Esta acción no lo eliminará permanentemente, pero lo ocultará para los estudiantes."
        isLoading={confirmLoading}
        variant="danger"
      />
    </section>
  );
}

function Detail({
  label,
  children,
  value,
}: {
  label: string;
  children?: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <p>
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {label}:
      </span>{" "}
      <span className="text-gray-800 dark:text-gray-100">
        {value ?? children ?? "—"}
      </span>
    </p>
  );
}
