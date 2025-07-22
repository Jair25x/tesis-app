import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCompetencyById,
  deleteCompetency,
} from "../../../services/competencyService";
import type { CompetencyResponse } from "../../../types/Competency";
import LoadingScreen from "../../../components/LoadingScreen";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { formatDate } from "../../../utils/formatDate";
import { showToast } from "../../../utils/showToast";
import { useCompetency } from "../../../context/useCompetency"; // ✅ Importa contexto

export default function CompetencyDetails() {
  const { curriculumId, competencyId } = useParams<{
    curriculumId: string;
    competencyId: string;
  }>();
  const navigate = useNavigate();

  const { refreshCompetencies } = useCompetency(); // ✅ Desde contexto

  const [competency, setCompetency] = useState<CompetencyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    const fetchCompetency = async () => {
      if (!curriculumId || !competencyId) {
        setError("Parámetros inválidos en la URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await getCompetencyById(curriculumId, competencyId);
        if (!response) {
          setError("No se encontró la competencia.");
        } else {
          setCompetency(response);
        }
      } catch (err) {
        console.error("Error al obtener la competencia:", err);
        setError("Ocurrió un error al cargar la competencia.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompetency();
  }, [curriculumId, competencyId]);

  const handleConfirmDelete = async () => {
    if (!curriculumId || !competencyId) return;

    setConfirmLoading(true);
    try {
      await deleteCompetency(curriculumId, competencyId);
      await refreshCompetencies(curriculumId); // ✅ Actualiza lista global
      showToast.success("Competencia desactivada correctamente.");
      navigate(`/admin/curricula/${curriculumId}/competencies`);
    } catch (err) {
      console.error("Error al desactivar la competencia:", err);
      showToast.error("Ocurrió un error al desactivar la competencia.");
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
          to={`/admin/curricula/${curriculumId}/competencies`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de competencias
        </Link>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400" role="alert">
        <p>No se encontró la competencia solicitada.</p>
        <Link
          to={`/admin/curricula/${curriculumId}/competencies`}
          className="text-blue-600 dark:text-blue-300 underline"
        >
          ← Volver a la lista de competencias
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detalles de la Competencia
        </h1>
        <div className="flex gap-2">
          <Link
            to={`/admin/curricula/${curriculumId}/competencies/${competency.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Editar
          </Link>
          {competency.active && (
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
        <Detail label="Nombre" value={competency.name} />
        <Detail label="Código" value={competency.code} />
        <Detail label="Descripción" value={competency.description || "—"} />
        <Detail
          label="Estado"
          value={
            competency.active ? (
              <span className="text-green-600 font-medium">Activo</span>
            ) : (
              <span className="text-red-500 font-medium">Inactivo</span>
            )
          }
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creado: {formatDate(competency.createdAt)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(competency.updatedAt)}
        </p>
      </div>

      <div className="mt-6">
        <Link
          to={`/admin/curricula/${curriculumId}/competencies`}
          className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          ← Volver a la lista de competencias
        </Link>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Desactivar competencia?"
        description="¿Estás seguro de que deseas desactivar esta competencia? Esta acción no eliminará los datos, pero la ocultará para los usuarios."
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
