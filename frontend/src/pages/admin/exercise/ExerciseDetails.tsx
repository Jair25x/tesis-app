// src/pages/admin/exercises/ExerciseDetails.tsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getExerciseById,
  deleteExercise,
} from "../../../services/exerciseService";
import type { ExerciseResponse } from "../../../types/exercise/ExerciseResponse";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";
import MustachePreview from "../../../components/MustachePreview";

export default function ExerciseDetails() {
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

  const navigate = useNavigate();

  const [exercise, setExercise] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      if (
        !curriculumId ||
        !competencyId ||
        !standardId ||
        !learningObjectiveId ||
        !exerciseId
      ) {
        setError("Parámetros inválidos en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await getExerciseById(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId
        );
        if (!response) {
          setError("No se encontró el ejercicio.");
        } else {
          setExercise(response);
        }
      } catch {
        setError("Ocurrió un error al cargar el ejercicio.");
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [curriculumId, competencyId, standardId, learningObjectiveId, exerciseId]);

  const handleConfirmDelete = async () => {
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId
    )
      return;

    setConfirmLoading(true);
    try {
      await deleteExercise(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId
      );
      showToast.success("Ejercicio desactivado correctamente.");
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`
      );
    } catch {
      showToast.error("Ocurrió un error al desactivar el ejercicio.");
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
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de ejercicios
        </Link>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>No se encontró el ejercicio solicitado.</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de ejercicios
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles del Ejercicio
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exercise.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Editar
          </Link>
          {exercise.active && (
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
        <Detail label="Enunciado (Mustache)">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {exercise.statement}
          </pre>
        </Detail>
        <Detail label="Dificultad">{exercise.difficulty}</Detail>
        <Detail label="Tipo">{exercise.type}</Detail>
        <Detail label="Plantilla">{exercise.templateType}</Detail>
        <Detail label="Parámetros">
          <pre className="whitespace-pre-wrap break-words text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
            {JSON.stringify(exercise.parameters, null, 2)}
          </pre>
        </Detail>
        {/* Vista previa del enunciado Mustache renderizado */}
        {exercise.templateType === "MUSTACHE" && (
          <div>
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
              Vista previa del ejercicio
            </h3>
            <MustachePreview
              template={exercise.statement}
              parameters={exercise.parameters}
            />
          </div>
        )}
        <Detail
          label="Estado"
          value={
            exercise.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-500 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(exercise.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(exercise.updatedAt)}
        </p>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de ejercicios
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar ejercicio?"
        description="¿Estás seguro de que deseas desactivar este ejercicio? Esta acción no lo eliminará, pero lo ocultará para los estudiantes."
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
