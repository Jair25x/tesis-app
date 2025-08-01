import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getStandardById,
  deleteStandard,
} from "../../../services/standardService";
import type { StandardResponse } from "../../../types/curriculum/StandardResponse";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";

export default function StandardDetails() {
  const { curriculumId, competencyId, standardId } = useParams<{
    curriculumId: string;
    competencyId: string;
    standardId: string;
  }>();

  const navigate = useNavigate();

  const [standard, setStandard] = useState<StandardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchStandard = async () => {
      try {
        if (!curriculumId || !competencyId || !standardId) {
          throw new Error("Faltan parámetros en la URL");
        }

        const response = await getStandardById(
          curriculumId,
          competencyId,
          standardId
        );
        setStandard(response.data);
      } catch (err) {
        console.error("Error al obtener el estándar:", err);
        setError("No se pudo cargar el estándar.");
      } finally {
        setLoading(false);
      }
    };

    fetchStandard();
  }, [curriculumId, competencyId, standardId]);

  const handleConfirmDelete = async () => {
    if (!standard || !curriculumId || !competencyId) return;
    setConfirmLoading(true);
    try {
      await deleteStandard(curriculumId, competencyId, standard.id);
      showToast.success("Estándar desactivado correctamente.");
      navigate(
        `/admin/curricula/${curriculumId}/competencies/${competencyId}/standards`
      );
    } catch (err) {
      console.error("Error al desactivar el estándar:", err);
      showToast.error("Ocurrió un error al desactivar el estándar.");
    } finally {
      setConfirmLoading(false);
      setIsConfirmOpen(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (error)
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        <p>{error}</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista
        </Link>
      </div>
    );

  if (!standard) return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Título y botones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">
          Detalles del Estándar
        </h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards/${standard.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-center"
          >
            Editar
          </Link>
          {standard.active && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-center"
            >
              Desactivar
            </button>
          )}
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 space-y-4 overflow-x-auto">
        <Detail label="Nombre" value={standard.name} />
        <Detail label="Código" value={standard.code} />
        <Detail label="Descripción" value={standard.description || "—"} />
        <Detail label="Competencia" value={standard.competencyName} />
        <Detail
          label="Estado"
          value={
            standard.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-600 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(standard.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(standard.updatedAt)}
        </p>
      </div>

      {/* Enlace para volver */}
      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies/${competencyId}/standards`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de estándares
        </Link>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar estándar?"
        description="¿Estás seguro de que deseas desactivar este estándar? Esta acción no eliminará los datos, pero lo ocultará para los usuarios."
        isLoading={confirmLoading}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="break-words">
      <span className="font-semibold text-gray-600 dark:text-gray-300">
        {label}:
      </span>{" "}
      <span className="text-gray-800 dark:text-gray-100">{value}</span>
    </p>
  );
}
