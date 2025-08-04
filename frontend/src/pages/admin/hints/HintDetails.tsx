// src/pages/admin/hints/HintDetails.tsx

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getHintById, deleteHint } from "../../../services/hintService";
import type { HintResponse } from "../../../types/exercise/HintResponse";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";

export default function HintDetails() {
  const {
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    hintId,
  } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
    learningObjectiveId: string;
    exerciseId: string;
    hintId: string;
  }>();

  const navigate = useNavigate();

  const [hint, setHint] = useState<HintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchHint = async () => {
      if (
        !curriculumId ||
        !competencyId ||
        !standardId ||
        !learningObjectiveId ||
        !exerciseId ||
        !hintId
      ) {
        setError("Parámetros inválidos en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await getHintById(
          curriculumId,
          competencyId,
          standardId,
          learningObjectiveId,
          exerciseId,
          hintId
        );
        if (!response) {
          setError("No se encontró la pista.");
        } else {
          setHint(response);
        }
      } catch {
        setError("Ocurrió un error al cargar la pista.");
      } finally {
        setLoading(false);
      }
    };

    fetchHint();
  }, [
    curriculumId,
    competencyId,
    standardId,
    learningObjectiveId,
    exerciseId,
    hintId,
  ]);

  const handleConfirmDelete = async () => {
    if (
      !curriculumId ||
      !competencyId ||
      !standardId ||
      !learningObjectiveId ||
      !exerciseId ||
      !hintId
    )
      return;

    setConfirmLoading(true);
    try {
      await deleteHint(
        curriculumId,
        competencyId,
        standardId,
        learningObjectiveId,
        exerciseId,
        hintId
      );
      showToast.success("Pista desactivada correctamente.");
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`
      );
    } catch {
      showToast.error("Ocurrió un error al desactivar la pista.");
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
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de pistas
        </Link>
      </div>
    );
  }

  if (!hint) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>No se encontró la pista solicitada.</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de pistas
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles de la Pista
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints/${hint.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Editar
          </Link>
          {hint.active && (
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
        <Detail label="Texto de la pista">
          <pre className="whitespace-pre-wrap break-words text-sm">
            {hint.hintText}
          </pre>
        </Detail>
        <Detail label="Coste en puntos">{hint.cost}</Detail>
        <Detail
          label="Estado"
          value={
            hint.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-500 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(hint.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(hint.updatedAt)}
        </p>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standardId}/learning-objectives/${learningObjectiveId}/exercises/${exerciseId}/hints`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de pistas
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar pista?"
        description="¿Estás seguro de que deseas desactivar esta pista? Esta acción no la eliminará, pero la ocultará para los estudiantes."
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
